// @ts-types="npm:@types/express"
import express from "npm:express";
// @ts-types="npm:@types/ws"
import { type WebSocket, WebSocketServer } from "npm:ws";
import { authenticateSWIFJWT, verifySWIFJWT } from "./src/server/Farcaster.ts"

import { FiggieGame } from "./src/models/Game/index.ts";
import { PlaySession, Players } from "./src/models/PlaySession/index.ts";

const app = express();
const port = Number(Deno.env.get('PORT') ?? '3000');

app.use(express.json());

const tokenCache = new Map<string, string>(); // address -> jwt

interface Lobby {
  id: string;
  creator: string;
  players: Map<string, WebSocket>;
  timeout?: ReturnType<typeof setTimeout>;
  session?: PlaySession;
}

const lobbies = new Map<string, Lobby>();

app.post('/lobby', authenticateSWIFJWT, (req, res) => {
  const user = (req as any).user as string;
  for (const lobby of lobbies.values()) {
    if (lobby.creator === user) {
      return res.status(400).json({ error: 'Lobby already exists' });
    }
  }
  if (lobbies.size >= 2) {
    return res.status(400).json({ error: 'Lobby limit reached' });
  }
  const lobbyId = crypto.randomUUID();
  const lobby: Lobby = { id: lobbyId, creator: user, players: new Map() };
  lobbies.set(lobbyId, lobby);
  // start game after 60 seconds
  lobby.timeout = setTimeout(() => startGame(lobbyId), 60000);
  return res.json({ lobbyId });
});

const server = app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req: express.Request) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const parts = url.pathname.split('/');
  const lobbyId = parts.length > 2 ? parts[2] : undefined;
  const token = url.searchParams.get('token');
  if (!lobbyId || !token) {
    ws.close();
    return;
  }
  let address: string;

  verifySWIFJWT(token).then((payload) => {
    if (tokenCache.get(payload.address as string) !== token) {
      ws.close();
      return;
    }
    address = payload.address as string;
    const lobby = lobbies.get(lobbyId);
    if (!lobby) {
      ws.close();
      return;
    }
    lobby.players.set(address, ws);

    ws.on('message', (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'close' && address === lobby.creator) {
          closeLobby(lobbyId);
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      lobby.players.delete(address);
    });
  }).catch(() => {
    ws.close();
    return;
  });
});

function closeLobby(lobbyId: string) {
  const lobby = lobbies.get(lobbyId);
  if (!lobby) return;
  for (const [, socket] of lobby.players) {
    socket.send(JSON.stringify({ type: 'closed' }));
    socket.close();
  }
  if (lobby.timeout) clearTimeout(lobby.timeout);
  lobbies.delete(lobbyId);
}

function startGame(lobbyId: string) {
  const lobby = lobbies.get(lobbyId);
  if (!lobby) return;

  const playersObj: Players = {};
  for (const [id, socket] of lobby.players.entries()) {
    playersObj[id] = { id, name: id, socket };
  }

  const game = new FiggieGame(lobbyId, 'Figgie', 'Figgie game');
  game.initGame();
  const session = new PlaySession(lobbyId, game, playersObj);
  session.initializePlayersFundsState();
  session.initializeRandomPlayersCardState();
  lobby.session = session;

  for (const [, socket] of lobby.players) {
    socket.send(JSON.stringify({ type: 'start' }));
  }
}

export { app, server, wss };

