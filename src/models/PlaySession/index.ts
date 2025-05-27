import { FiggieGame } from "../Game/index.ts";
import { Suits } from "../Game/constants.ts";

export class InvalidPlayerNumberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlayerNumberError";
  }
}

export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
  socket: WebSocket;
}

export type Players = Record<PlayerId, Player>;

export type PlayerFundsState = Record<PlayerId, number>;

export type CardState = {
  [key in Suits]: number;
}

export type PlayerCardState = Record<PlayerId, CardState>;

export class PlaySession {

  private playersCardState?: PlayerCardState;
  private playersFundsState?: PlayerFundsState;

  constructor(
    public id: string,
    public game: FiggieGame,
    public players: Players,
  ) {
    this.playersFundsState = Object.fromEntries(
      Object.keys(this.players).map((playerId) => [playerId, 0]),
    ) as PlayerFundsState;
  }

  public getGame(): FiggieGame | undefined {
    return this.game;
  }

  public getPlayers(): Players {
    return this.players;
  }

  public initializeRandomPlayersCardState(): void {

    if (Object.keys(this.players).length > 5 || Object.keys(this.players).length < 4) {
      throw new InvalidPlayerNumberError("Invalid number of players");
    }

    const availableCards = Object.assign({}, this.game.getGameState().cardState);

    this.playersCardState = Object.fromEntries(
      Object.keys(this.players).map((playerId) => [playerId, {
        [Suits.CLUBS]: 0,
        [Suits.DIAMONDS]: 0,
        [Suits.HEARTS]: 0,
        [Suits.SPADES]: 0,
      }]),
    ) as PlayerCardState;

    let totalCards = Object.values(availableCards).reduce((acc, curr) => acc + curr, 0);
    let hardLimit = 40;

    const players = Object.keys(this.players);
    let currentPlayerIndex = 0;

    while (totalCards > 0 && hardLimit > 0) {
      const playerId = players[currentPlayerIndex];

      // Select a random suit from available cards that are above 0
      const gameSuits = Object.keys(availableCards) as Suits[];
      const availableSuits = gameSuits.filter((suit) => availableCards[suit] > 0);
      let selectedSuit: Suits | null = null;
      let limit = 0;
      while (!selectedSuit && limit < 50) { // Prevent infinite loop
        const randomSuit = availableSuits[Math.floor(Math.random() * availableSuits.length)];
        if (availableCards[randomSuit] > 0) {
          selectedSuit = randomSuit;
        }
        limit++;
      }

      if (!selectedSuit) {
        throw new Error("No suit selected after 50 attempts");
      }

      this.playersCardState[playerId][selectedSuit]++;
      availableCards[selectedSuit]--;
      totalCards--;
      currentPlayerIndex++;
      if (currentPlayerIndex >= players.length) {
        currentPlayerIndex = 0;
      }
      hardLimit--;
    }

  }


  public getPlayersCardState(): PlayerCardState {
    if (!this.playersCardState) {
      throw new Error("Players card state not initialized");
    }
    return this.playersCardState;
  }

  public getPlayersFundsState(): PlayerFundsState {
    if (!this.playersFundsState) {
      throw new Error("Players funds state not initialized");
    }
    return this.playersFundsState;
  }
}
