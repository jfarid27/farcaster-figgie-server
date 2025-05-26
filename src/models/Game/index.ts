import { Suits, COLOR_PAIRS, generateRandomSuits } from './constants.ts';

type GameState = {
  suits: Suits[];
  goalSuit: Suits;
  commonSuit: Suits;
  cardState: Record<Suits, number>;
}

export class FiggieGame {
  private gameState?: GameState;

  constructor(
    public id: string,
    public name: string,
    public description: string,
  ) {
  }

  public getGameId(): string {
    return this.id;
  }

  public initGame(): void {
    const suits = generateRandomSuits();
    const commonSuit = suits[0];
    const goalSuit = COLOR_PAIRS[commonSuit];

    const cardState = {
      [commonSuit]: 12,
      [suits[1]]: 10,
      [suits[2]]: 10,
      [suits[3]]: 8
    } as Record<Suits, number>;

    this.gameState = {
      suits,
      goalSuit,
      commonSuit,
      cardState
    };
  }

  public getGameState(): GameState {
    if (!this.gameState) {
      throw new Error("Game state not initialized");
    }
    return this.gameState;
  }
}