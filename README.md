# Participant Bank Backend Service

Spring Boot backend service for managing Participant Banks and Authentication.

## Features
- **Authentication**: Authenticates user against static credentials, logs into Keycloak (`http://192.168.20.49:9091/realms/acs`), and automatically synchronizes/registers the user record in PostgreSQL (`tbl_users`).
- **Participant Bank CRUD**: Clean JSON endpoints to create, update, retrieve, list, search, and delete participant banks (`tbl_participant_banks`).
- **PostgreSQL Database**: Configured for PostgreSQL with `dev` and `prod` profiles.
- **Logging**: Configured via Logback (`logback-spring.xml`) with rolling file appenders and console logs.
- **Swagger / OpenAPI Documentation**: Available at `http://localhost:9081/swagger-ui.html` and `http://localhost:9081/v3/api-docs` with comprehensive request samples and **only 200 (OK) response samples**.

---

## Git Branches Structure

| Branch Name | Access Token Required | Logo Capability | Description |
| :--- | :--- | :--- | :--- |
| **`branch1-no-auth-no-logo`** | ❌ No | ❌ Optional / Not Required | Open endpoints for rapid frontend testing. Pure JSON CRUD for participant banks. |
| **`branch2-no-auth-with-logo`** | ❌ No | ✅ Full Upload & Storage | Open endpoints with complete logo upload (`POST /api/v1/participants/{id}/logo`), storage, and static serving via `/uploads/logos/**`. |
| **`branch3-auth-with-logo`** | ✅ Yes (Keycloak JWT) | ✅ Full Upload & Storage | Enforces Bearer JWT access token authentication for all protected endpoints except `/api/v1/auth/login` and public assets. |

---

## Configuration Profiles
- **`dev`** (Default):
  - Database: `jdbc:postgresql://localhost:5432/acs_participant_db`
  - Username: `postgres` / Password: `postgres`
  - Hibernate DDL: `update`
- **`prod`**:
  - Database: Configurable via `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
  - Production logging and security settings.

---

## Authentication Details
- **Login Endpoint**: `POST /api/v1/auth/login` (also mapped to `/acs-dev/api/v1/login`)
- **Development credentials**: supplied through `APP_AUTH_STATIC_USERNAME` and
  `APP_AUTH_STATIC_PASSWORD` (defaults are intended for local development only).
- **Keycloak Realm**: configured by the active Spring profile
  (development client ID defaults to `participant-portal`).

---

## Running the Application
```bash
# Build
./gradlew build

# Run in Development mode
./gradlew bootRun --args='--spring.profiles.active=dev'

# Run in Production mode
./gradlew bootRun --args='--spring.profiles.active=prod'
```

Access Swagger UI: `http://localhost:9081/swagger-ui.html`

## Angular Frontend

The Angular login demo is in the `frontend` directory. From that directory, run:

```bash
npm install
npm start
```

Open `http://localhost:4200`. The frontend uses the backend login endpoint
and sends the returned bearer token with protected participant requests. For
local development, configure `APP_AUTH_STATIC_USERNAME`,
`APP_AUTH_STATIC_PASSWORD`, and `KEYCLOAK_CLIENT_ID` before starting the
backend.

The frontend API base URL is configured in
`frontend/src/environments/environment.ts` and replaced by
`environment.prod.ts` for production builds. Production uses the same-origin
`/api/v1` path and requires the gateway to route it to the backend over HTTPS.

The login endpoint returns the backend contract using snake_case token fields:
`access_token`, `refresh_token`, `token_type`, `expires_in`, and
`refresh_expires_in`.
