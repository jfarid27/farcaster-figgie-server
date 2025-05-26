import { FiggieGame } from "../Game/index.ts";
import { Suits } from "../Game/constants.ts";

export type Player = {
  id: string;
  name: string;
  socket: WebSocket;
}

export type Players = Record<string, Player>;

export type PlayerCardState = {
    [key in Suits]: number;
}

export class PlaySession {

  private playersCardState?: Record<string, PlayerCardState>;

  constructor(
    public id: string,
    public game: FiggieGame,
    public players: Players,
  ) {
  }

  public getGame(): FiggieGame | undefined {
    return this.game;
  }

  public getPlayers(): Players {
    return this.players;
  }
  public initializeRandomPlayersCardState(): void {

    const availableCards = Object.assign({}, this.game.getGameState().cardState);

    this.playersCardState = Object.fromEntries(
      Object.keys(this.players).map((playerId) => [playerId, {
        [Suits.CLUBS]: 0,
        [Suits.DIAMONDS]: 0,
        [Suits.HEARTS]: 0,
        [Suits.SPADES]: 0,
      }]),
    ) as Record<string, PlayerCardState>;

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
      while (!selectedSuit || limit < 50) { // Prevent infinite loop
        const randomSuit = availableSuits[Math.floor(Math.random() * availableSuits.length)];
        if (availableCards[randomSuit] > 0) {
          selectedSuit = randomSuit;
        }
        limit++;
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


  public getPlayersCardState(): Record<string, PlayerCardState> {
    if (!this.playersCardState) {
      throw new Error("Players card state not initialized");
    }
    return this.playersCardState;
  }
}
