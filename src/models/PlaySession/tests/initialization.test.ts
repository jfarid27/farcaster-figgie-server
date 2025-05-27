import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

import { PlaySession, Players, PlayerCardState } from "../index.ts";
import { FiggieGame, GameState } from "../../Game/index.ts";
import { Suits } from "../../Game/constants.ts";
import { InsufficientCardsError, InvalidPlayerNumberError } from "../errors.ts";
import { createMockPlayers } from "./common.ts";
import { assert } from "@std/assert";
import { InvalidGameStateError } from "../../Game/errors.ts";

describe("PlaySession Initialization", () => {
  describe("when player number is incorrect", () => {
    describe("initializeRandomPlayersCardState", () => {
      it("should throw an error", () => {
        const players: Players = {
          "test": { id: "test", name: "test", socket: {} as WebSocket },
        };
        const game = new FiggieGame("test", "test", "test");
        game.initGame();
        const playSession = new PlaySession("test", game, players);
        assert(playSession.initializeRandomPlayersCardState() instanceof InvalidPlayerNumberError);
      });
    });
  });
  describe("when player number is correct", () => {
    let playSession: PlaySession;
    let game: FiggieGame;

    const players: Players = createMockPlayers();

    beforeEach(() => {
      game = new FiggieGame("test", "test", "test");
      game.initGame();
      playSession = new PlaySession("test", game, players);
    });

    describe("initializeRandomPlayersCardState", () => {
      let cardState: PlayerCardState | InsufficientCardsError;
      beforeEach(() => {
        playSession.initializeRandomPlayersCardState();
        cardState = playSession.getPlayersCardState();
      });
      it("should initialize the players card state correctly", () => {
        assert(!(cardState instanceof InsufficientCardsError));
        expect(cardState["test"]).toBeDefined();
        expect(cardState["test2"]).toBeDefined();
        expect(cardState["test3"]).toBeDefined();
        expect(cardState["test4"]).toBeDefined();
      });
      describe("suit distribution", () => {
          let commonSuit: Suits;
          let gameState: GameState | InvalidGameStateError;
          beforeEach(() => {
              gameState = playSession.getGame()?.getGameState();
              assert(!(gameState instanceof InvalidGameStateError));
              commonSuit = gameState?.commonSuit;
          });
          it("the common suit should have 12 cards", () => {
              assert(commonSuit);
              assert(!(cardState instanceof InsufficientCardsError));
              const total = cardState["test"][commonSuit] +
                  cardState["test2"][commonSuit] +
                  cardState["test3"][commonSuit] +
                  cardState["test4"][commonSuit];
              expect(total).toBe(12);
          });
          it("suits should have distributed correctly",() => {
              assert(commonSuit && gameState);
              assert(!(cardState instanceof InsufficientCardsError));
              assert(!(gameState instanceof InvalidGameStateError));
              const suitTotals = {
                  [Suits.CLUBS]: 0,
                  [Suits.DIAMONDS]: 0,
                  [Suits.HEARTS]: 0,
                  [Suits.SPADES]: 0,
              };
              
              for (const player in cardState) {
                  for (const suit of gameState.suits) {
                      suitTotals[suit] += cardState[player][suit];
                  }
              }

              const expectedDistribution = [12, 10, 8];
              expect(suitTotals[commonSuit], "common suit should be 12").toBe(12);
              expect(expectedDistribution, "Clubs should be in the distribution").toContain(suitTotals[Suits.CLUBS]);
              expect(expectedDistribution, "Diamonds should be in the distribution").toContain(suitTotals[Suits.DIAMONDS]);
              expect(expectedDistribution, "Hearts should be in the distribution").toContain(suitTotals[Suits.HEARTS]);
              expect(expectedDistribution, "Spades should be in the distribution").toContain(suitTotals[Suits.SPADES]);
          });
          it("should have correct distribution of cards per suit", () => {
              assert(commonSuit && gameState);
              assert(!(cardState instanceof InsufficientCardsError));
              assert(!(gameState instanceof InvalidGameStateError));

              const suitTotals = {
                  [Suits.CLUBS]: 0,
                  [Suits.DIAMONDS]: 0,
                  [Suits.HEARTS]: 0,
                  [Suits.SPADES]: 0,
              };
              
              for (const player in cardState) {
                  for (const suit of gameState.suits) {
                      suitTotals[suit] += cardState[player][suit];
                  }
              }

              const distribution = Object.values(suitTotals).sort((a, b) => b - a);
              expect(distribution).toEqual([12, 10, 10, 8]);
          });
      });
    });
  });
});