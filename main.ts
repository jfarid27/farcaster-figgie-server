import express from "npm:express";
import { WebSocketServer } from "npm:ws";

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
  res.send('Server is running');
});

const server = app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Echo message back to client
    ws.send(message.toString());
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

export { app, server, wss };

