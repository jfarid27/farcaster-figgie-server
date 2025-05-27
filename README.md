# Figgie Game Server

This is a basic server boilerplate for the Figgie game built with [Deno](https://deno.land/). It uses Express and the `ws` library via Deno's npm compatibility layer to provide HTTP and WebSocket capabilities.

## Development

```
deno task dev
```

The server exposes a simple HTTP endpoint at `/` and sets up a WebSocket server for real-time communication.

## Configuration

Set the following environment variables to configure the server:

- `PORT` – HTTP port to listen on (defaults to `3000`).
- `JWT_SECRET` – secret used to sign authentication tokens (defaults to `change_me`).

You can provide these variables when running `deno task dev`:

```bash
PORT=8080 JWT_SECRET=mysecret deno task dev
```
