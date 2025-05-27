import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

import { FiggieGame } from "./index.ts";
import { COLOR_PAIRS } from "./constants.ts";
import { InvalidGameStateError } from "./errors.ts";
import { assert } from "@std/assert";

describe("FiggieGame", () => {
    let game: FiggieGame;
    beforeEach(() => {
        game = new FiggieGame("test", "test", "test");
    });
    it("should construct the game state correctly", () => {
        expect(game.getGameId()).toBe("test");
    });
    describe("initializing the game", () => {
        beforeEach(() => {
            game.initGame();
        });

        it("should initialize the game state", () => {
            const gameState = game.getGameState();
            assert(!(gameState instanceof InvalidGameStateError));
            expect(gameState.suits.length).toBe(4);
            expect(gameState.goalSuit).toBeDefined();
            expect(gameState.commonSuit).toBeDefined();
            expect(gameState.cardState).toBeDefined();
        });
        it("should initialize the correct goal and common suit colors", () => {
            const gameState = game.getGameState();
            assert(!(gameState instanceof InvalidGameStateError));
            expect(gameState.goalSuit).toBe(COLOR_PAIRS[gameState.commonSuit]);
        });
    });
});