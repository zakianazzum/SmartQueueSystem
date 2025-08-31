# Institution and Branch API Documentation

This document describes all the available APIs for managing institutions, institution types, and branches in the Smart Queue System.

## Base URL
All APIs are prefixed with `/api/v1`

## Authentication
All endpoints require proper authentication (to be implemented based on your authentication system).

## Institution Types

### Get All Institution Types
- **URL**: `GET /institution-types`
- **Description**: Retrieve all institution types
- **Response**: List of institution types
- **Example Response**:
```json
[
  {
    "institutionTypeId": "uuid",
    "institutionType": "Hospital"
  },
  {
    "institutionTypeId": "uuid",
    "institutionType": "Bank"
  }
]
```

### Get Institution Type by ID
- **URL**: `GET /institution-types/{institution_type_id}`
- **Description**: Retrieve a specific institution type by ID
- **Parameters**: `institution_type_id` (string) - The ID of the institution type
- **Response**: Institution type object
- **Example Response**:
```json
{
  "institutionTypeId": "uuid",
  "institutionType": "Hospital"
}
```

### Create Institution Type
- **URL**: `POST /institution-types`
- **Description**: Create a new institution type
- **Request Body**:
```json
{
  "institutionType": "New Institution Type"
}
```
- **Response**: Created institution type object

### Update Institution Type
- **URL**: `PUT /institution-types/{institution_type_id}`
- **Description**: Update an existing institution type
- **Parameters**: `institution_type_id` (string) - The ID of the institution type
- **Request Body**:
```json
{
  "institutionType": "Updated Institution Type"
}
```
- **Response**: Updated institution type object

### Delete Institution Type
- **URL**: `DELETE /institution-types/{institution_type_id}`
- **Description**: Delete an institution type
- **Parameters**: `institution_type_id` (string) - The ID of the institution type
- **Response**:
```json
{
  "message": "Institution type deleted successfully"
}
```

## Institutions

### Get All Institutions
- **URL**: `GET /institutions`
- **Description**: Retrieve all institutions with their related data
- **Response**: List of institutions with branches, institution types, and administrators
- **Example Response**:
```json
[
  {
    "institutionId": "uuid",
    "institutionTypeId": "uuid",
    "administratorId": "uuid",
    "name": "City General Hospital",
    "institutionDescription": "A general hospital serving the city",
    "institutionType": {
      "institutionTypeId": "uuid",
      "institutionType": "Hospital"
    },
    "administrator": {
      "userId": "uuid",
      "name": "John Doe",
      "email": "john.doe@hospital.com"
    },
    "branches": [
      {
        "branchId": "uuid",
        "institutionId": "uuid",
        "name": "Main Branch",
        "branchDescription": "Main hospital building",
        "address": "123 Main St",
        "serviceHours": "24/7",
        "serviceDescription": "Emergency and general care",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "capacity": 500,
        "totalCrowdCount": 150
      }
    ]
  }
]
```

### Get Institution by ID
- **URL**: `GET /institutions/{institution_id}`
- **Description**: Retrieve a specific institution by ID
- **Parameters**: `institution_id` (string) - The ID of the institution
- **Response**: Institution object with all related data

### Create Institution
- **URL**: `POST /institutions`
- **Description**: Create a new institution (branches must be added separately)
- **Request Body**:
```json
{
  "institutionTypeId": "uuid",
  "administratorId": "uuid",
  "name": "New Institution",
  "institutionDescription": "Description of the institution"
}
```
- **Response**: Created institution object

### Update Institution
- **URL**: `PUT /institutions/{institution_id}`
- **Description**: Update an existing institution
- **Parameters**: `institution_id` (string) - The ID of the institution
- **Request Body**:
```json
{
  "name": "Updated Institution Name",
  "institutionDescription": "Updated description"
}
```
- **Response**: Updated institution object

### Delete Institution
- **URL**: `DELETE /institutions/{institution_id}`
- **Description**: Delete an institution
- **Parameters**: `institution_id` (string) - The ID of the institution
- **Response**:
```json
{
  "message": "Institution deleted successfully"
}
```

## Branches

### Get All Branches
- **URL**: `GET /branches`
- **Description**: Retrieve all branches with crowd count data
- **Response**: List of branches
- **Example Response**:
```json
[
  {
    "branchId": "uuid",
    "institutionId": "uuid",
    "name": "Main Branch",
    "branchDescription": "Main hospital building",
    "address": "123 Main St",
    "serviceHours": "24/7",
    "serviceDescription": "Emergency and general care",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "capacity": 500,
    "totalCrowdCount": 150
  }
]
```

### Get Branch by ID
- **URL**: `GET /branches/{branch_id}`
- **Description**: Retrieve a specific branch by ID
- **Parameters**: `branch_id` (string) - The ID of the branch
- **Response**: Branch object with crowd count

### Get Branches by Institution ID
- **URL**: `GET /institutions/{institution_id}/branches`
- **Description**: Retrieve all branches for a specific institution
- **Parameters**: `institution_id` (string) - The ID of the institution
- **Response**: List of branches belonging to the institution

### Create Branch
- **URL**: `POST /branches`
- **Description**: Create a new branch (requires valid institution ID)
- **Request Body**:
```json
{
  "institutionId": "uuid",
  "name": "New Branch",
  "branchDescription": "Description of the branch",
  "address": "456 Branch St",
  "serviceHours": "9 AM - 5 PM",
  "serviceDescription": "Branch services",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "capacity": 200
}
```
- **Response**: Created branch object
- **Validation**: The `institutionId` must reference an existing institution

### Update Branch
- **URL**: `PUT /branches/{branch_id}`
- **Description**: Update an existing branch
- **Parameters**: `branch_id` (string) - The ID of the branch
- **Request Body**:
```json
{
  "name": "Updated Branch Name",
  "address": "Updated Address",
  "capacity": 300
}
```
- **Response**: Updated branch object

### Delete Branch
- **URL**: `DELETE /branches/{branch_id}`
- **Description**: Delete a branch
- **Parameters**: `branch_id` (string) - The ID of the branch
- **Response**:
```json
{
  "message": "Branch deleted successfully"
}
```

## Legacy Endpoint

### Get All Institutions (Legacy Format)
- **URL**: `GET /institutions/all`
- **Description**: Legacy endpoint that returns institutions in the old response format
- **Response**: List of institutions in legacy format (maintained for backward compatibility)

## Error Responses

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request (e.g., invalid institution ID when creating branch)
- **404**: Not Found (e.g., institution/branch not found)
- **500**: Internal Server Error

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Important Notes

1. **Branch Creation**: A branch can only be created if it has a valid institution ID. The institution must exist before creating branches.

2. **Institution Creation**: Creating an institution only adds a record to the Institution table. Branches must be added separately using the branch creation API.

3. **Crowd Count**: The `totalCrowdCount` field is calculated dynamically from the crowd data and represents the current total crowd count for each branch.

4. **UUID Generation**: All IDs are automatically generated as UUIDs when creating new records.

5. **Relationships**: The APIs maintain proper relationships between institutions, branches, institution types, and administrators.

## Usage Examples

### Creating a Complete Institution Setup

1. **Create Institution Type**:
```bash
POST /api/v1/institution-types
{
  "institutionType": "Hospital"
}
```

2. **Create Institution**:
```bash
POST /api/v1/institutions
{
  "institutionTypeId": "generated-uuid",
  "administratorId": "admin-uuid",
  "name": "City General Hospital",
  "institutionDescription": "A general hospital serving the city"
}
```

3. **Create Branch**:
```bash
POST /api/v1/branches
{
  "institutionId": "institution-uuid",
  "name": "Main Branch",
  "address": "123 Main St",
  "serviceHours": "24/7",
  "capacity": 500
}
```

### Retrieving Institution Data

```bash
# Get all institutions
GET /api/v1/institutions

# Get specific institution
GET /api/v1/institutions/{institution_id}

# Get all branches for an institution
GET /api/v1/institutions/{institution_id}/branches

# Get all branches
GET /api/v1/branches

# Get specific branch
GET /api/v1/branches/{branch_id}
```
