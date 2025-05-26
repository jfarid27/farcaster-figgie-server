# Figgie Game Server

This is a basic server boilerplate for the Figgie game built with [Deno](https://deno.land/). It uses Express and the `ws` library via Deno's npm compatibility layer to provide HTTP and WebSocket capabilities.

## Development

```
deno task dev
```

The server exposes a simple HTTP endpoint at `/` and sets up a WebSocket server for real-time communication.
