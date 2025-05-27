import express from "npm:express";
import { WebSocketServer } from "npm:ws";
import jwt from "npm:jsonwebtoken";
import { verifyMessage } from "npm:ethers";

import { FiggieGame } from "./src/models/Game/index.ts";
import { PlaySession, Players } from "./src/models/PlaySession/index.ts";

const app = express();
const port = Number(Deno.env.get('PORT') ?? '3000');

app.use(express.json());

const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'change_me';

// Simple in-memory caches
const tokenCache = new Map<string, string>(); // address -> jwt

interface Lobby {
  id: string;
  creator: string;
  players: Map<string, WebSocket>;
  timeout?: ReturnType<typeof setTimeout>;
  session?: PlaySession;
}

const lobbies = new Map<string, Lobby>();

// Verify the Farcaster sign in message using ethers
async function verifySignInMessage(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  try {
    const recovered = verifyMessage(message, signature);
    return recovered.toLowerCase() === address.toLowerCase();
  } catch (_err) {
    return false;
  }
}

// POST /login - verify message and issue JWT
app.post('/login', async (req, res) => {
  const { message, signature, address } = req.body ?? {};
  if (!message || !signature || !address) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const ok = await verifySignInMessage(message, signature, address);
  if (!ok) {
    return res.status(401).json({ error: 'Verification failed' });
  }
  const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });
  tokenCache.set(address, token);
  return res.json({ token });
});

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { address: string };
    if (tokenCache.get(payload.address) !== token) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    (req as any).user = payload.address;
    next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /lobby - create a lobby, limit to one per user and max two lobbies
app.post('/lobby', authenticate, (req, res) => {
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

wss.on('connection', (ws, req) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const parts = url.pathname.split('/');
  const lobbyId = parts.length > 2 ? parts[2] : undefined;
  const token = url.searchParams.get('token');
  if (!lobbyId || !token) {
    ws.close();
    return;
  }
  let address: string;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { address: string };
    if (tokenCache.get(payload.address) !== token) {
      ws.close();
      return;
    }
    address = payload.address;
  } catch (_err) {
    ws.close();
    return;
  }
  const lobby = lobbies.get(lobbyId);
  if (!lobby) {
    ws.close();
    return;
  }
  lobby.players.set(address, ws);

  ws.on('message', (data) => {
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

