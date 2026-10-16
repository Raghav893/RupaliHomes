# Property Platform Backend

Spring Boot backend for buying, selling, and renting properties with JWT authentication and role-based access control.

## Tech Stack
- Spring Boot
- Java 17
- Spring Security + JWT
- Spring Data JPA (Hibernate)
- PostgreSQL (Supabase)
- Maven

## Roles
- SUPER_ADMIN: manage admins and view dashboard analytics
- ADMIN: manage properties, purchases, rentals
- PUBLIC: browse available properties (no auth)

## Endpoints

### Auth
- POST `/auth/register`
- POST `/auth/login`

### Public
- GET `/properties`
- GET `/properties/{id}`

Filters for `/properties`:
- `type` (SALE or RENT)
- `minPrice` / `maxPrice`
- `minRent` / `maxRent`
- `location`
- pagination: `page`, `size`
- sorting: `sortBy`, `sortDir`

### Admin (role ADMIN)
- POST `/admin/properties`
- PUT `/admin/properties/{id}`
- DELETE `/admin/properties/{id}`
- POST `/admin/properties/{id}/purchase`
- POST `/admin/properties/{id}/rent`

### Super Admin (role SUPER_ADMIN)
- POST `/super-admin/admins`
- GET `/super-admin/admins`
- DELETE `/super-admin/admins/{id}`
- GET `/super-admin/dashboard`

## Configuration
Set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`, and `APP_JWT_SECRET` in the runtime environment.
The password and JWT secret are required and are not embedded in the application.
Set `APP_SEED_ENABLED=false` in production to disable default admin and demo data
creation. See [the VPS deployment guide](../deploy/vps/README.md).

## Build & Run
- `./mvnw clean package`
- `./mvnw test`
- `./mvnw spring-boot:run`

## OpenAPI
An `openapi.yaml` file is included in `src/main/resources` as a starting point.
