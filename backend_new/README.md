# Property Platform Backend

Spring Boot backend for buying, selling, and renting properties with JWT authentication and role-based access control.

## Tech Stack
- Spring Boot
- Java 21 (note: current `pom.xml` is unchanged)
- Spring Security + JWT
- Spring Data JPA (Hibernate)
- MySQL
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
Update `src/main/resources/application.properties` for database credentials and JWT secret.

## Build & Run
- `./mvnw clean package`
- `./mvnw test`
- `./mvnw spring-boot:run`

## OpenAPI
An `openapi.yaml` file is included in `src/main/resources` as a starting point.
