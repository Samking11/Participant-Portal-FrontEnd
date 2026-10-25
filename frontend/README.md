# Participant Bank Login Demo

This Angular frontend demonstrates a Bootstrap login form with client-side
credential validation and a participant bank list.

Participant banks can be registered at `/participants/new`. New entries are
stored in a shared in-memory Angular service and remain available while the
application is running; they are not persisted after a page reload.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/`. The demo credentials are `admin` /
`Admin@123`. This is a static frontend exercise and does not authenticate
against the backend.

## Build

```bash
npm run build
```

## Test

```bash
npm test
```
