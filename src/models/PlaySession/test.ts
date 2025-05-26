import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

import { PlaySession, Players, PlayerCardState } from "./index.ts";
import { FiggieGame } from "../Game/index.ts";
import { Suits } from "../Game/constants.ts";


describe("PlaySession", () => {
  let playSession: PlaySession;
  let game: FiggieGame;

  const players: Players = {
    "test": { id: "test", name: "test", socket: {} as WebSocket },
    "test2": { id: "test2", name: "test2", socket: {} as WebSocket },
    "test3": { id: "test3", name: "test3", socket: {} as WebSocket },
    "test4": { id: "test4", name: "test4", socket: {} as WebSocket }
  };

  beforeEach(() => {
    game = new FiggieGame("test", "test", "test");
    game.initGame();
    playSession = new PlaySession("test", game, players);
  });

  describe("initializeRandomPlayersCardState", () => {
    let cardState: Record<string, PlayerCardState>;
    beforeEach(() => {
      playSession.initializeRandomPlayersCardState();
      cardState = playSession.getPlayersCardState();
    });
    it("should initialize the players card state correctly", () => {
      expect(cardState).toBeDefined();
      expect(cardState["test"]).toBeDefined();
      expect(cardState["test2"]).toBeDefined();
      expect(cardState["test3"]).toBeDefined();
      expect(cardState["test4"]).toBeDefined();
    });
    describe("suit distribution", () => {
        it("the common suit should have 12 cards", () => {
            const commonSuit = playSession.getGame()?.getGameState().commonSuit;
            expect(commonSuit).toBeDefined();
            if (!commonSuit) return;
            const total = cardState["test"][commonSuit] +
                cardState["test2"][commonSuit] +
                cardState["test3"][commonSuit] +
                cardState["test4"][commonSuit];
            expect(total).toBe(12);
        });

    });
    describe("player checks", () => {
      it("total cards should be 40", () => {
        expect(Object.values(cardState["test"]).reduce((acc, curr) => acc + curr, 0)).toBe(10);
        expect(Object.values(cardState["test2"]).reduce((acc, curr) => acc + curr, 0)).toBe(10);
        expect(Object.values(cardState["test3"]).reduce((acc, curr) => acc + curr, 0)).toBe(10);
        expect(Object.values(cardState["test4"]).reduce((acc, curr) => acc + curr, 0)).toBe(10);
      });
      it("player 1", () => {
        expect(cardState["test"][Suits.CLUBS], "player 1 clubs").toBe(2);
        expect(cardState["test"][Suits.DIAMONDS], "player 1 diamonds").toBe(1);
        expect(cardState["test"][Suits.HEARTS], "player 1 hearts").toBe(5);
        expect(cardState["test"][Suits.SPADES], "player 1 spades").toBe(2);
      });
      it("player 2", () => {
        expect(cardState["test2"][Suits.CLUBS], "player 2 clubs").toBe(1);
        expect(cardState["test2"][Suits.DIAMONDS], "player 2 diamonds").toBe(2);
        expect(cardState["test2"][Suits.HEARTS], "player 2 hearts").toBe(4);
        expect(cardState["test2"][Suits.SPADES], "player 2 spades").toBe(3);
      });
      it("player 3", () => {
        expect(cardState["test3"][Suits.CLUBS], "player 3 clubs").toBe(2);
        expect(cardState["test3"][Suits.DIAMONDS], "player 3 diamonds").toBe(2);
        expect(cardState["test3"][Suits.HEARTS], "player 3 hearts").toBe(2);
        expect(cardState["test3"][Suits.SPADES], "player 3 spades").toBe(4);
      });
      it("player 4", () => {
        expect(cardState["test4"][Suits.CLUBS], "player 4 clubs").toBe(3);
        expect(cardState["test4"][Suits.DIAMONDS], "player 4 diamonds").toBe(3);
        expect(cardState["test4"][Suits.HEARTS], "player 4 hearts").toBe(3);
        expect(cardState["test4"][Suits.SPADES], "player 4 spades").toBe(1);
      });
    });
  });
  
});