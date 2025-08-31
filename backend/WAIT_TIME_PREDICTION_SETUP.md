# Wait Time Prediction Setup Guide

## Overview
The wait time prediction feature can work in two modes:
1. **AI-powered mode** (with OpenAI API)
2. **Fallback mode** (local prediction algorithm)

## Configuration Options

### Option 1: AI-Powered Predictions (Recommended)
To use OpenAI for more accurate predictions:

1. Get an OpenAI API key from: https://platform.openai.com/api-keys
2. Add the API key to your `.env` file:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```
3. Restart the backend server

### Option 2: Fallback Predictions (Default)
If no OpenAI API key is configured, the system will automatically use a local prediction algorithm that:
- Analyzes historical visitor logs
- Considers crowd data patterns
- Provides reasonable wait time estimates
- Works without any external API dependencies

## How the Fallback System Works

The fallback prediction system:

1. **Analyzes Historical Data**: 
   - Parses visitor logs to find average wait times
   - Examines crowd data to understand busy periods

2. **Institution-Specific Logic**:
   - Banks: ~20 minutes average wait
   - Restaurants: ~15 minutes average wait  
   - Parks: ~5 minutes average wait
   - Other: ~12 minutes average wait

3. **Crowd Adjustment**:
   - High crowd (>80% capacity): +50% wait time
   - Medium crowd (50-80% capacity): +20% wait time
   - Low crowd (<50% capacity): -20% wait time

4. **Accuracy Calculation**:
   - With historical data + crowd data: 85% accuracy
   - With either historical or crowd data: 75% accuracy
   - With no data: 65% accuracy

## Testing the API

You can test the wait time prediction API with:

```bash
curl -X POST "http://localhost:8000/api/v1/wait-time-predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "visitorId": "visitor-123",
    "branchId": "your-branch-id",
    "visitDate": "2025-09-02T10:00:00.000Z"
  }'
```

## Response Format

The API returns:
```json
{
  "waitTimePredictionId": "uuid",
  "visitorId": "visitor-123",
  "branchId": "branch-id",
  "visitDate": "2025-09-02T10:00:00.000Z",
  "predictedWaitTime": 15,
  "actualWaitTime": 12,
  "accuracy": 85.0,
  "predictedAt": "2025-08-31T15:30:00.000Z"
}
```

## Notes

- The fallback system provides reasonable predictions even without historical data
- Predictions are bounded between 5-60 minutes for realism
- The system automatically chooses the best available prediction method
- No configuration is required for the fallback system to work
