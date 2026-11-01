# Participant Bank Portal Frontend

This Angular frontend uses the Spring Boot participant-bank REST API running on
`http://localhost:9081`.

Participant banks are loaded from PostgreSQL through
`GET /api/v1/participants`. Creating, editing, and deleting participants call
the corresponding backend endpoints, so changes persist after a page reload.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/`. The login screen authenticates through
`POST http://localhost:9081/api/v1/auth/login` using the configured Keycloak
credentials. The returned access token is kept in `sessionStorage` for the
browser session and is attached to participant API requests as a bearer token.
For the development backend, use `admin` / `Password@123` unless those
credentials have been changed in Keycloak.

Start the backend first:

```bash
docker compose up --build
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```
