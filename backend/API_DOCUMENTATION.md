# SmartQueue System API Documentation

## New Endpoints Added

### Visitor Log Endpoints

#### Create Visitor Log
- **POST** `/api/v1/visitor-logs`
- **Description**: Create a new visitor log entry
- **Request Body**:
```json
{
  "visitorName": "John Doe",
  "branchId": "branch-uuid",
  "checkInTime": "2024-01-15T10:00:00Z",
  "serviceStartTime": "2024-01-15T10:15:00Z",
  "waitTimeInMinutes": 15
}
```

#### Get Visitor Log by ID
- **GET** `/api/v1/visitor-logs/{visitor_log_id}`
- **Description**: Get a specific visitor log entry by ID

#### Get All Visitor Logs
- **GET** `/api/v1/visitor-logs?skip=0&limit=100`
- **Description**: Get all visitor log entries with pagination

#### Get Visitor Logs by Branch
- **GET** `/api/v1/visitor-logs/branch/{branch_id}?skip=0&limit=100`
- **Description**: Get visitor logs for a specific branch

#### Get Visitor Logs by Branch (Last 30 Days)
- **GET** `/api/v1/visitor-logs/branch/{branch_id}/last-30-days`
- **Description**: Get visitor logs for a specific branch in the last 30 days

#### Get Average Wait Time by Branch
- **GET** `/api/v1/visitor-logs/branch/{branch_id}/average-wait-time`
- **Description**: Get average wait time for a specific branch

#### Update Visitor Log
- **PUT** `/api/v1/visitor-logs/{visitor_log_id}`
- **Description**: Update a visitor log entry
- **Request Body**:
```json
{
  "visitorName": "Updated Name",
  "waitTimeInMinutes": 20
}
```

#### Delete Visitor Log
- **DELETE** `/api/v1/visitor-logs/{visitor_log_id}`
- **Description**: Delete a visitor log entry

### Wait Time Prediction Endpoints

#### Create Wait Time Prediction
- **POST** `/api/v1/wait-time-predictions`
- **Description**: Create a new wait time prediction using OpenAI
- **Request Body**:
```json
{
  "visitorId": "visitor-uuid",
  "branchId": "branch-uuid",
  "visitDate": "2024-01-15T10:00:00Z"
}
```

#### Get Wait Time Prediction by ID
- **GET** `/api/v1/wait-time-predictions/{wait_time_prediction_id}`
- **Description**: Get a specific wait time prediction entry by ID

#### Get All Wait Time Predictions
- **GET** `/api/v1/wait-time-predictions?skip=0&limit=100`
- **Description**: Get all wait time prediction entries with pagination

#### Get Wait Time Predictions by Visitor
- **GET** `/api/v1/wait-time-predictions/visitor/{visitor_id}?skip=0&limit=100`
- **Description**: Get wait time predictions for a specific visitor

#### Get Wait Time Predictions by Branch
- **GET** `/api/v1/wait-time-predictions/branch/{branch_id}?skip=0&limit=100`
- **Description**: Get wait time predictions for a specific branch

#### Update Wait Time Prediction
- **PUT** `/api/v1/wait-time-predictions/{wait_time_prediction_id}`
- **Description**: Update a wait time prediction entry
- **Request Body**:
```json
{
  "predictedWaitTime": 25.5,
  "accuracy": 0.85
}
```

#### Delete Wait Time Prediction
- **DELETE** `/api/v1/wait-time-predictions/{wait_time_prediction_id}`
- **Description**: Delete a wait time prediction entry

## OpenAI Integration

The Wait Time Prediction service integrates with OpenAI's GPT-3.5-turbo model to provide intelligent wait time predictions. The system:

1. Collects historical visitor log data for the last 30 days
2. Collects crowd data for the last 30 days
3. Formats this data into a comprehensive prompt
4. Sends the prompt to OpenAI for analysis
5. Receives a JSON response with predicted wait time, actual wait time, and accuracy
6. Stores the prediction in the database

### Required Environment Variables

Make sure to set the following environment variable:
- `OPENAI_API_KEY`: Your OpenAI API key

## Database Schema

### VisitorLog Table
- `VisitorLogId` (Primary Key)
- `VisitorName` (String)
- `BranchId` (Foreign Key to branches)
- `CheckInTime` (DateTime)
- `ServiceStartTime` (DateTime)
- `WaitTimeInMinutes` (Integer)

### WaitTimePrediction Table
- `WaitTimePredictionId` (Primary Key)
- `VisitorId` (Foreign Key to visitors)
- `BranchId` (Foreign Key to branches)
- `VisitDate` (DateTime)
- `PredictedWaitTime` (Float)
- `ActualWaitTime` (Float)
- `Accuracy` (Float)
- `PredictedAt` (DateTime)

## Notes

- VisitorName in VisitorLog doesn't need to match actual visitors from the Visitors table
- The system automatically calculates wait time if not provided (based on check-in and service start times)
- Branch capacity is currently set to a default value of 50 (can be enhanced in the future)
- All endpoints include proper error handling and validation
- The OpenAI integration uses a temperature of 0.3 for consistent predictions
