# API Documentation

Base URL: `http://localhost:8080`
Authentication: `Bearer <JWT>` for admin-only endpoints

## Auth

### POST `/auth/login`
Login and receive a JWT token.

Request body:
```json
{
  "username": "ADMIN_USERNAME",
  "password": "ADMIN_PASSWORD"
}
```

Response:
- `200 OK` with JWT token as plain string

---

## Properties (Public GET, Admin for write)

### GET `/properties`
List properties (paginated).

Query params:
- `page` (default `0`)
- `size` (default `15`)

Example:
`GET /properties?page=0&size=15`

### GET `/properties/{id}`
Get property by ID.

### GET `/properties/by-deal-type/{value}`
Filter by `dealType`.

Example:
`GET /properties/by-deal-type/ReSale`

### GET `/properties/by-stage/{value}`
Filter by `projectStage`.

Example:
`GET /properties/by-stage/UnderConstruction`

### GET `/properties/by-type/{value}`
Filter by `projectType`.

Example:
`GET /properties/by-type/RESIDENTIAL`

### GET `/properties/by-unit-type/{value}`
Filter by `unitType`.

Example:
`GET /properties/by-unit-type/THREE_BHK`

### POST `/properties` (Admin)
Create a property.

Request body:
```json
{
  "devName": "Demo Dev",
  "projectName": "Demo Project",
  "projectType": "RESIDENTIAL",
  "launchTime": "2025",
  "launchPrice": "100000",
  "unitType": "2 BHK",
  "projectStage": "UnderConstruction",
  "location": "City",
  "dealType": "FreshUnit",
  "unitSize": 1200,
  "unitNumber": 101,
  "floorNumber": 5,
  "ownerName": "Owner",
  "ownerAddress": "Address",
  "currentPrice": 120000,
  "askingPrice": 130000,
  "notes": "Test"
}
```

### PUT `/properties/{id}` (Admin)
Update all fields of a property.

Request body:
```json
{
  "devName": "Dev Updated",
  "projectName": "Project Updated",
  "projectType": "COMMERCIAL",
  "launchTime": "2026",
  "launchPrice": "150000",
  "unitType": "3 BHK",
  "projectStage": "UnderConstruction",
  "location": "Updated City",
  "dealType": "ReSale",
  "unitSize": 1600,
  "unitNumber": 202,
  "floorNumber": 10,
  "ownerName": "Owner Updated",
  "ownerAddress": "New Address",
  "currentPrice": 155000,
  "askingPrice": 165000,
  "notes": "Full update test"
}
```

### PATCH `/properties/{id}` (Admin)
Partial update.

Request body (example):
```json
{
  "notes": "Patched note"
}
```

### DELETE `/properties/{id}` (Admin)
Delete property by ID.

---

## Buyers (Admin Only)

### GET `/buyers`
List buyers (paginated).

Query params:
- `page` (default `0`)
- `size` (default `15`)

Example:
`GET /buyers?page=0&size=15`

### GET `/buyers/{id}`
Get buyer by ID.

### POST `/buyers`
Create buyer.

Request body:
```json
{
  "leadSource": "Referral",
  "dataAging": "New",
  "clientName": "John",
  "clientNumber": "9999999999",
  "dataSource": "Marketing",
  "clientLocation": "City",
  "clientBudget": "100000",
  "leadRemarks": "Hot",
  "propertyType": "RESIDENTIAL",
  "callingNotes": "Call tomorrow"
}
```

### PUT `/buyers/{id}`
Update buyer.

Request body:
```json
{
  "leadSource": "Referral Updated",
  "dataAging": "Old",
  "clientName": "Client Updated",
  "clientNumber": "8888888888",
  "dataSource": "Client_Site_visit",
  "clientLocation": "Updated City",
  "clientBudget": "200000",
  "leadRemarks": "Follow up",
  "propertyType": "COMMERCIAL",
  "callingNotes": "Full update test"
}
```

### PATCH `/buyers/{id}`
Partial update.

Request body (example):
```json
{
  "callingNotes": "Patched note"
}
```

### DELETE `/buyers/{id}`
Delete buyer by ID.

---

## Enums (Allowed Values)

### `ProjectType`
- `RESIDENTIAL`
- `COMMERCIAL`

### `ProjectStage`
- `UnderConstruction`
- `RTMI`
- `pre_Leased`
- `NearToPossession`

### `UnitType`
- `STUDIO_APARTMENT`
- `TWO_BHK`
- `TWO_POINT_FIVE_BHK`
- `THREE_BHK`
- `THREE_POINT_FIVE_BHK`
- `FOUR_BHK`
- `FOUR_POINT_FIVE_BHK`
- `FIVE_BHK`
- `PENTHOUSE`
- `DUPLEX_PENTHOUSE`
- `TRIPLEX_PENTHOUSE`
- `VILLA`
- `DDJAY_PLOT`
- `PLOT`

### `DealType`
- `FreshUnit`
- `ReSale`

### `DataSource`
- `Marketing`
- `Client_Site_visit`
