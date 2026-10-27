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

Open `http://localhost:4200/`. The login screen remains a local demo login
using `admin` / `Admin@123`; participant CRUD is connected to the backend API.

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
