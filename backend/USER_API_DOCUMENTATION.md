# User Management API Documentation

This document describes all the available APIs for managing users, operators, visitors, favorites, and alert preferences in the Smart Queue System.

## Base URL
All APIs are prefixed with `/api/v1`

## Authentication
All endpoints require proper authentication (to be implemented based on your authentication system).

## Users

### Get All Users
- **URL**: `GET /users`
- **Description**: Retrieve all users in the system
- **Response**: List of users
- **Example Response**:
```json
[
  {
    "userId": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "visitor",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
]
```

### Get User by ID
- **URL**: `GET /users/{user_id}`
- **Description**: Retrieve a specific user by ID
- **Parameters**: `user_id` (string) - The ID of the user
- **Response**: User object

### Create User
- **URL**: `POST /users`
- **Description**: Create a new user
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "visitor",
  "password": "securepassword"
}
```
- **Response**: Created user object

### Update User
- **URL**: `PUT /users/{user_id}`
- **Description**: Update an existing user
- **Parameters**: `user_id` (string) - The ID of the user
- **Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```
- **Response**: Updated user object

### Delete User
- **URL**: `DELETE /users/{user_id}`
- **Description**: Delete a user
- **Parameters**: `user_id` (string) - The ID of the user
- **Response**:
```json
{
  "message": "User deleted successfully"
}
```

## Operators

### Get All Operators
- **URL**: `GET /operators`
- **Description**: Retrieve all operator assignments with user and branch information
- **Response**: List of operator assignments
- **Example Response**:
```json
[
  {
    "userId": "uuid",
    "branchId": "uuid",
    "user": {
      "userId": "uuid",
      "name": "Operator Name",
      "email": "operator@example.com",
      "role": "operator",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    },
    "branch": {
      "branchId": "uuid",
      "name": "Main Branch",
      "address": "123 Main St",
      "serviceHours": "9 AM - 5 PM"
    }
  }
]
```

### Get Operators by Branch ID
- **URL**: `GET /branches/{branch_id}/operators`
- **Description**: Retrieve all operators assigned to a specific branch
- **Parameters**: `branch_id` (string) - The ID of the branch
- **Response**: List of operator assignments for the branch

### Get Operator Assignments by User ID
- **URL**: `GET /users/{user_id}/operator-assignments`
- **Description**: Retrieve all branch assignments for a specific operator
- **Parameters**: `user_id` (string) - The ID of the user
- **Response**: List of operator assignments for the user

### Create Operator Assignment
- **URL**: `POST /operators`
- **Description**: Assign a user as an operator to a branch
- **Request Body**:
```json
{
  "userId": "uuid",
  "branchId": "uuid"
}
```
- **Response**: Created operator assignment
- **Validation**: 
  - User must exist
  - Branch must exist
  - User cannot be already assigned to the same branch

### Update Operator Assignment
- **URL**: `PUT /operators/{user_id}/{branch_id}`
- **Description**: Update operator assignment (e.g., reassign to different branch)
- **Parameters**: 
  - `user_id` (string) - The ID of the user
  - `branch_id` (string) - The current branch ID
- **Request Body**:
```json
{
  "branchId": "new-branch-uuid"
}
```
- **Response**: Updated operator assignment

### Delete Operator Assignment
- **URL**: `DELETE /operators/{user_id}/{branch_id}`
- **Description**: Remove operator assignment from a branch
- **Parameters**: 
  - `user_id` (string) - The ID of the user
  - `branch_id` (string) - The ID of the branch
- **Response**:
```json
{
  "message": "Operator assignment deleted successfully"
}
```

## Visitors

### Get All Visitors
- **URL**: `GET /visitors`
- **Description**: Retrieve all visitors with their user information
- **Response**: List of visitors
- **Example Response**:
```json
[
  {
    "userId": "uuid",
    "user": {
      "userId": "uuid",
      "name": "Visitor Name",
      "email": "visitor@example.com",
      "role": "visitor",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  }
]
```

### Get Visitor by User ID
- **URL**: `GET /visitors/{user_id}`
- **Description**: Retrieve a specific visitor by user ID
- **Parameters**: `user_id` (string) - The ID of the user
- **Response**: Visitor object

### Create Visitor
- **URL**: `POST /visitors`
- **Description**: Create a new visitor (user must already exist)
- **Request Body**:
```json
{
  "userId": "uuid"
}
```
- **Response**: Created visitor object
- **Validation**: User must exist and not already be a visitor

## Favorites

### Get Favorites by Visitor ID
- **URL**: `GET /visitors/{visitor_id}/favorites`
- **Description**: Retrieve all favorite branches for a specific visitor
- **Parameters**: `visitor_id` (string) - The ID of the visitor (user ID)
- **Response**: List of favorite branches
- **Example Response**:
```json
[
  {
    "favoriteInstitutionId": "uuid",
    "visitorId": "uuid",
    "branchId": "uuid",
    "createdAt": "2024-01-01T00:00:00",
    "branch": {
      "branchId": "uuid",
      "name": "Favorite Branch",
      "address": "123 Favorite St",
      "serviceHours": "9 AM - 5 PM"
    }
  }
]
```

### Create Favorite
- **URL**: `POST /favorites`
- **Description**: Mark a branch as favorite for a visitor
- **Request Body**:
```json
{
  "visitorId": "uuid",
  "branchId": "uuid"
}
```
- **Response**: Created favorite object
- **Validation**: 
  - Visitor must exist
  - Branch must exist
  - Branch cannot already be favorited by the same visitor

### Delete Favorite
- **URL**: `DELETE /favorites/{visitor_id}/{branch_id}`
- **Description**: Remove a branch from favorites
- **Parameters**: 
  - `visitor_id` (string) - The ID of the visitor
  - `branch_id` (string) - The ID of the branch
- **Response**:
```json
{
  "message": "Favorite deleted successfully"
}
```

## Alert Preferences

### Get Alert Preferences by Visitor ID
- **URL**: `GET /visitors/{visitor_id}/alert-preferences`
- **Description**: Retrieve all alert preferences for a specific visitor
- **Parameters**: `visitor_id` (string) - The ID of the visitor (user ID)
- **Response**: List of alert preferences
- **Example Response**:
```json
[
  {
    "alertId": "uuid",
    "visitorId": "uuid",
    "branchId": "uuid",
    "crowdThreshold": 50,
    "createdAt": "2024-01-01T00:00:00",
    "branch": {
      "branchId": "uuid",
      "name": "Branch Name",
      "address": "123 Branch St",
      "serviceHours": "9 AM - 5 PM"
    }
  }
]
```

### Create Alert Preference
- **URL**: `POST /alert-preferences`
- **Description**: Create a new alert preference for a visitor
- **Request Body**:
```json
{
  "visitorId": "uuid",
  "branchId": "uuid",
  "crowdThreshold": 50
}
```
- **Response**: Created alert preference object
- **Validation**: 
  - Visitor must exist
  - Branch must exist
  - Alert preference cannot already exist for the same visitor and branch

### Update Alert Preference
- **URL**: `PUT /alert-preferences/{alert_id}`
- **Description**: Update an existing alert preference
- **Parameters**: `alert_id` (string) - The ID of the alert preference
- **Request Body**:
```json
{
  "crowdThreshold": 75,
  "branchId": "new-branch-uuid"
}
```
- **Response**: Updated alert preference object

### Delete Alert Preference
- **URL**: `DELETE /alert-preferences/{alert_id}`
- **Description**: Delete an alert preference
- **Parameters**: `alert_id` (string) - The ID of the alert preference
- **Response**:
```json
{
  "message": "Alert preference deleted successfully"
}
```

## Administrators

### Get All Administrators
- **URL**: `GET /administrators`
- **Description**: Retrieve all administrators with their user information
- **Response**: List of administrators
- **Example Response**:
```json
[
  {
    "userId": "uuid",
    "user": {
      "userId": "uuid",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "administrator",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  }
]
```

### Create Administrator
- **URL**: `POST /administrators`
- **Description**: Create a new administrator (user must already exist)
- **Request Body**:
```json
{
  "userId": "uuid"
}
```
- **Response**: Created administrator object
- **Validation**: User must exist and not already be an administrator

## Error Responses

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request (e.g., invalid data, duplicate entries)
- **404**: Not Found (e.g., user/branch not found)
- **500**: Internal Server Error

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Important Notes

1. **User Creation**: Users must be created before they can be assigned roles (visitor, operator, administrator).

2. **Operator Assignments**: A user can be assigned as an operator to multiple branches, but cannot be assigned to the same branch twice.

3. **Favorites**: A visitor can have multiple favorite branches, but cannot favorite the same branch twice.

4. **Alert Preferences**: A visitor can have multiple alert preferences for different branches, but only one per branch.

5. **Validation**: All endpoints include proper validation to ensure data integrity and prevent duplicate entries.

6. **UUID Generation**: All IDs are automatically generated as UUIDs when creating new records.

## Usage Examples

### Creating a Complete User Setup

1. **Create User**:
```bash
POST /api/v1/users
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "visitor",
  "password": "securepassword"
}
```

2. **Create Visitor**:
```bash
POST /api/v1/visitors
{
  "userId": "user-uuid"
}
```

3. **Add Favorite Branch**:
```bash
POST /api/v1/favorites
{
  "visitorId": "user-uuid",
  "branchId": "branch-uuid"
}
```

4. **Set Alert Preference**:
```bash
POST /api/v1/alert-preferences
{
  "visitorId": "user-uuid",
  "branchId": "branch-uuid",
  "crowdThreshold": 50
}
```

### Managing Operators

1. **Assign Operator to Branch**:
```bash
POST /api/v1/operators
{
  "userId": "operator-uuid",
  "branchId": "branch-uuid"
}
```

2. **Get All Operators for a Branch**:
```bash
GET /api/v1/branches/{branch_id}/operators
```

3. **Update Operator Assignment**:
```bash
PUT /api/v1/operators/{user_id}/{branch_id}
{
  "branchId": "new-branch-uuid"
}
```

### Retrieving Data

```bash
# Get all users
GET /api/v1/users

# Get specific user
GET /api/v1/users/{user_id}

# Get all operators
GET /api/v1/operators

# Get favorites for a visitor
GET /api/v1/visitors/{visitor_id}/favorites

# Get alert preferences for a visitor
GET /api/v1/visitors/{visitor_id}/alert-preferences
```
