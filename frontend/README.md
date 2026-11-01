# Participant Bank Portal Frontend

This Angular frontend uses the Spring Boot participant-bank REST API. The API
base URL is configured in `src/environments/environment.ts`, with a production
file replacement in `src/environments/environment.prod.ts`.

Participant banks are loaded from PostgreSQL through
`GET /api/v1/participants`. Creating, editing, and deleting participants call
the corresponding backend endpoints, so changes persist after a page reload.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/`. In development, the login screen authenticates
through `POST http://localhost:9081/api/v1/auth/login` using the configured
backend credentials. The returned access token is kept in `sessionStorage` for
the browser session and is attached only to participant API requests as a
bearer token.

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
