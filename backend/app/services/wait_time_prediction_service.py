import json
import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import openai

from app.db.wait_time_prediction_crud import wait_time_prediction_crud
from app.db.visitor_log_crud import visitor_log_crud
from app.models import WaitTimePrediction, Branch, CrowdData
from app.schemas.wait_time_prediction_schema import (
    WaitTimePredictionCreate, 
    WaitTimePredictionUpdate, 
    WaitTimePredictionResponse,
    WaitTimePredictionRequest
)
from core.config import settings


class WaitTimePredictionService:
    def __init__(self):
        # Initialize OpenAI client only if API key is available
        self.openai_client = None
        try:
            if settings.OPENAI_API_KEY:
                self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        except Exception:
            # If OpenAI client initialization fails, we'll handle it gracefully
            self.openai_client = None

    def _get_branch_capacity(self, branch: Branch) -> int:
        """Get branch capacity - this is a placeholder implementation"""
        # In a real implementation, you might have a capacity field in the Branch model
        # For now, we'll use a default capacity based on institution type
        return 50  # Default capacity

    def _format_visitor_logs_for_prompt(self, visitor_logs: List) -> str:
        """Format visitor logs for the OpenAI prompt"""
        if not visitor_logs:
            return "No visitor log data available for the last 30 days."
        
        formatted_logs = []
        for log in visitor_logs:
            wait_time = log.WaitTimeInMinutes
            formatted_logs.append(
                f"Visitor Name - {log.VisitorName} - Check In time - {log.CheckInTime} - "
                f"Service Start Time - {log.ServiceStartTime} - Waited for - {wait_time} minutes"
            )
        
        return "\n".join(formatted_logs)

    def _format_crowd_data_for_prompt(self, crowd_data: List) -> str:
        """Format crowd data for the OpenAI prompt"""
        if not crowd_data:
            return "No crowd data available for the last 30 days."
        
        formatted_data = []
        for data in crowd_data:
            formatted_data.append(
                f"Date - {data.Timestamp} - Crowd Count - {data.CurrentCrowdCount}"
            )
        
        return "\n".join(formatted_data)

    def _call_openai_for_prediction(
        self, 
        branch_name: str, 
        branch_capacity: int, 
        crowd_data_str: str, 
        visitor_logs_str: str
    ) -> dict:
        """Call OpenAI API to get wait time prediction"""
        prompt = f"""
You are a clever predictive model that can predict the wait time for a user to receive service at an institution like a bank, restaurant, park, corporate office or similar places. You will be given the following information to analyze and come up with a meaningful possible wait time based on historical visit logs collected from the institutions.

Here is the information you have about the branch the user is trying to predict the wait time for:

The branch name is {branch_name}, and it can hold a NORMAL capacity of {branch_capacity} people before one can consider the place crowded(Note that NORMAL capacity means ALL or SOME of the service centers in the institution can be occupied at a given time).

You are also given a record of the crowd data in the last 30 days of that branch, in the following manner:
{crowd_data_str}

Finally, you are given a record of all the VisitorLog data in the last 30 days, in the following manner:
{visitor_logs_str}

Based on these data, you will give me thoughtful answer about the waiting time for the visitor which we are calling PredictedWaitTime in our WaitTimePredictionTable. You will provide me the data in the following JSON format:

{{
    "predictedWaitTime": int,
    "actualWaitTime": int,
    "accuracy": float
}}

Analyze the predicted time based on your own data/knowledge and provided data. If provided data is low, use your majority knowledge to come up with a logical time. DO NOT MAKE ANYTHING UP AND ABSOLUTELY DO NOT GIVE ME A TIME THAT'S WAY OFF THE AVERAGE WAIT TIME.
"""

        try:
            if not self.openai_client:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="OpenAI API key not configured"
                )
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that provides wait time predictions in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            # Extract the JSON response
            content = response.choices[0].message.content
            # Find JSON in the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = content[start_idx:end_idx]
                return json.loads(json_str)
            else:
                raise ValueError("No valid JSON found in OpenAI response")
                
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get prediction from OpenAI: {str(e)}"
            )

    def create_wait_time_prediction(
        self, db: Session, prediction_request: WaitTimePredictionRequest
    ) -> WaitTimePredictionResponse:
        """Create a new wait time prediction using OpenAI"""
        try:
            # Verify that the branch exists
            branch = db.query(Branch).filter(Branch.BranchId == prediction_request.branchId).first()
            if not branch:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Branch not found"
                )

            # Get visitor logs for the last 30 days
            visitor_logs = visitor_log_crud.get_visitor_logs_by_branch_last_30_days(
                db, prediction_request.branchId
            )

            # Get crowd data for the last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            crowd_data = (
                db.query(CrowdData)
                .filter(
                    CrowdData.BranchId == prediction_request.branchId,
                    CrowdData.Timestamp >= thirty_days_ago
                )
                .order_by(CrowdData.Timestamp.desc())
                .all()
            )

            # Get branch capacity
            branch_capacity = self._get_branch_capacity(branch)

            # Format data for OpenAI prompt
            visitor_logs_str = self._format_visitor_logs_for_prompt(visitor_logs)
            crowd_data_str = self._format_crowd_data_for_prompt(crowd_data)

            # Get prediction from OpenAI
            prediction_result = self._call_openai_for_prediction(
                branch.Name, branch_capacity, crowd_data_str, visitor_logs_str
            )

            # Calculate actual wait time (average of historical data)
            actual_wait_time = visitor_log_crud.get_average_wait_time_by_branch(
                db, prediction_request.branchId
            )

            # Create the prediction record
            prediction_id = str(uuid.uuid4())
            predicted_at = datetime.now()
            
            wait_time_prediction = WaitTimePredictionCreate(
                waitTimePredictionId=prediction_id,
                visitorId=prediction_request.visitorId,
                branchId=prediction_request.branchId,
                visitDate=prediction_request.visitDate,
                predictedWaitTime=float(prediction_result.get("predictedWaitTime", 0)),
                actualWaitTime=actual_wait_time,
                accuracy=float(prediction_result.get("accuracy", 0.0)),
                predictedAt=predicted_at,
            )

            db_prediction = wait_time_prediction_crud.create_wait_time_prediction(
                db, wait_time_prediction
            )

            return WaitTimePredictionResponse(
                waitTimePredictionId=db_prediction.WaitTimePredictionId,
                visitorId=db_prediction.VisitorId,
                branchId=db_prediction.BranchId,
                visitDate=db_prediction.VisitDate,
                predictedWaitTime=db_prediction.PredictedWaitTime,
                actualWaitTime=db_prediction.ActualWaitTime,
                accuracy=db_prediction.Accuracy,
                predictedAt=db_prediction.PredictedAt,
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create wait time prediction: {str(e)}",
            )

    def get_wait_time_prediction(
        self, db: Session, wait_time_prediction_id: str
    ) -> WaitTimePredictionResponse:
        """Get a single wait time prediction entry by ID"""
        try:
            db_prediction = wait_time_prediction_crud.get_wait_time_prediction(
                db, wait_time_prediction_id
            )
            return WaitTimePredictionResponse(
                waitTimePredictionId=db_prediction.WaitTimePredictionId,
                visitorId=db_prediction.VisitorId,
                branchId=db_prediction.BranchId,
                visitDate=db_prediction.VisitDate,
                predictedWaitTime=db_prediction.PredictedWaitTime,
                actualWaitTime=db_prediction.ActualWaitTime,
                accuracy=db_prediction.Accuracy,
                predictedAt=db_prediction.PredictedAt,
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get wait time prediction: {str(e)}",
            )

    def get_all_wait_time_predictions(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[WaitTimePredictionResponse]:
        """Get all wait time prediction entries with pagination"""
        try:
            db_predictions = wait_time_prediction_crud.get_all_wait_time_predictions(
                db, skip, limit
            )
            return [
                WaitTimePredictionResponse(
                    waitTimePredictionId=pred.WaitTimePredictionId,
                    visitorId=pred.VisitorId,
                    branchId=pred.BranchId,
                    visitDate=pred.VisitDate,
                    predictedWaitTime=pred.PredictedWaitTime,
                    actualWaitTime=pred.ActualWaitTime,
                    accuracy=pred.Accuracy,
                    predictedAt=pred.PredictedAt,
                )
                for pred in db_predictions
            ]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get wait time predictions: {str(e)}",
            )

    def get_wait_time_predictions_by_visitor(
        self, db: Session, visitor_id: str, skip: int = 0, limit: int = 100
    ) -> List[WaitTimePredictionResponse]:
        """Get wait time predictions for a specific visitor"""
        try:
            db_predictions = wait_time_prediction_crud.get_wait_time_predictions_by_visitor(
                db, visitor_id, skip, limit
            )
            return [
                WaitTimePredictionResponse(
                    waitTimePredictionId=pred.WaitTimePredictionId,
                    visitorId=pred.VisitorId,
                    branchId=pred.BranchId,
                    visitDate=pred.VisitDate,
                    predictedWaitTime=pred.PredictedWaitTime,
                    actualWaitTime=pred.ActualWaitTime,
                    accuracy=pred.Accuracy,
                    predictedAt=pred.PredictedAt,
                )
                for pred in db_predictions
            ]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get wait time predictions by visitor: {str(e)}",
            )

    def get_wait_time_predictions_by_branch(
        self, db: Session, branch_id: str, skip: int = 0, limit: int = 100
    ) -> List[WaitTimePredictionResponse]:
        """Get wait time predictions for a specific branch"""
        try:
            db_predictions = wait_time_prediction_crud.get_wait_time_predictions_by_branch(
                db, branch_id, skip, limit
            )
            return [
                WaitTimePredictionResponse(
                    waitTimePredictionId=pred.WaitTimePredictionId,
                    visitorId=pred.VisitorId,
                    branchId=pred.BranchId,
                    visitDate=pred.VisitDate,
                    predictedWaitTime=pred.PredictedWaitTime,
                    actualWaitTime=pred.ActualWaitTime,
                    accuracy=pred.Accuracy,
                    predictedAt=pred.PredictedAt,
                )
                for pred in db_predictions
            ]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get wait time predictions by branch: {str(e)}",
            )

    def update_wait_time_prediction(
        self, db: Session, wait_time_prediction_id: str, 
        wait_time_prediction_update: WaitTimePredictionUpdate
    ) -> WaitTimePredictionResponse:
        """Update a wait time prediction entry"""
        try:
            db_prediction = wait_time_prediction_crud.update_wait_time_prediction(
                db, wait_time_prediction_id, wait_time_prediction_update
            )
            return WaitTimePredictionResponse(
                waitTimePredictionId=db_prediction.WaitTimePredictionId,
                visitorId=db_prediction.VisitorId,
                branchId=db_prediction.BranchId,
                visitDate=db_prediction.VisitDate,
                predictedWaitTime=db_prediction.PredictedWaitTime,
                actualWaitTime=db_prediction.ActualWaitTime,
                accuracy=db_prediction.Accuracy,
                predictedAt=db_prediction.PredictedAt,
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update wait time prediction: {str(e)}",
            )

    def delete_wait_time_prediction(
        self, db: Session, wait_time_prediction_id: str
    ) -> bool:
        """Delete a wait time prediction entry"""
        try:
            return wait_time_prediction_crud.delete_wait_time_prediction(
                db, wait_time_prediction_id
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete wait time prediction: {str(e)}",
            )


wait_time_prediction_service = WaitTimePredictionService()
