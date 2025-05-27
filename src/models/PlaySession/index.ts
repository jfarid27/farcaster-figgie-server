import { FiggieGame } from "../Game/index.ts";
import { Suits } from "../Game/constants.ts";

import { InvalidPlayerNumberError, InsufficientFundsError, InsufficientCardsError } from "./errors.ts";
import { InvalidGameStateError } from "../Game/errors.ts";

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
  public readonly DEFAULT_STARTING_FUNDS = 350;
  private playersCardState?: PlayerCardState;
  private playersFundsState?: PlayerFundsState;

  constructor(
    public id: string,
    public game: FiggieGame,
    public players: Players,
  ) {
  }

  public getGame(): FiggieGame {
    return this.game;
  }

  public getPlayers(): Players {
    return this.players;
  }

  public initializePlayersFundsState(startingFunds: number = this.DEFAULT_STARTING_FUNDS): PlaySession | InsufficientFundsError {
    this.playersFundsState = Object.fromEntries(
      Object.keys(this.players).map((playerId) => [playerId, startingFunds]),
    ) as PlayerFundsState;
    return this;
  }

  public initializeRandomPlayersCardState(): PlaySession | InvalidPlayerNumberError | InvalidGameStateError {

    if (Object.keys(this.players).length > 5 || Object.keys(this.players).length < 4) {
      return new InvalidPlayerNumberError("Invalid number of players");
    }

    const gameState = this.game.getGameState();
    if (gameState instanceof InvalidGameStateError) {
      return gameState;
    }

    const availableCards = Object.assign({}, gameState.cardState);

    this.playersCardState = Object.fromEntries(
      Object.keys(this.players).map((playerId) => [playerId, {
        [Suits.CLUBS]: 0,
        [Suits.DIAMONDS]: 0,
        [Suits.HEARTS]: 0,
        [Suits.SPADES]: 0,
      }]),
    ) as PlayerCardState;

    let totalCards: number = Object.values(availableCards).reduce((acc, curr) => acc + curr, 0);
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

    return this;
  }

  public getPlayersCardState(): PlayerCardState | InsufficientCardsError {
    if (!this.playersCardState) {
      return new InsufficientCardsError("Players card state not initialized");
    }
    return this.playersCardState;
  }

  public getPlayersFundsState(): PlayerFundsState | InsufficientFundsError {
    if (!this.playersFundsState) {
      return new InsufficientFundsError("Players funds state not initialized");
    }
    return this.playersFundsState;
  }

  public getPlayerFunds(playerId: PlayerId): number | InsufficientFundsError {
    if (!this.playersFundsState) {
      return new InsufficientFundsError("Players funds state not initialized");
    }
    return this.playersFundsState[playerId];
  }

  /**
   * PlayerTo pays PlayerFrom amount of funds for a card of the specifid suit.
   * @param playerFromId - The player to take the card from
   * @param playerToId - The player to give the card to
   * @param suit - The suit of the card to swap
   * @param amount - The amount of funds to swap
   */
  public swapCardForFunds(
    playerFromId: PlayerId,
    playerToId: PlayerId,
    suit: Suits,
    amount: number
  ): PlaySession | InsufficientFundsError | InsufficientCardsError {
    if (!this.playersFundsState) {
      return new InsufficientFundsError("Players funds state not initialized");
    }
    if (!this.playersCardState) {
      return new InsufficientCardsError("Players card state not initialized");
    }
    if (this.playersFundsState[playerFromId] < amount) {
      return new InsufficientFundsError("Player does not have enough funds");
    }
    if (this.playersCardState[playerFromId][suit] < 1) {
      return new InsufficientCardsError("Player does not have enough cards");
    }
    this.playersFundsState[playerFromId] += amount;
    this.playersCardState[playerFromId][suit]--;
    this.playersFundsState[playerToId] -= amount;
    this.playersCardState[playerToId][suit]++;
    return this;
  }
  
}
