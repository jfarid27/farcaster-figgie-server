import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assert } from "@std/assert";

import { PlaySession, Players, PlayerCardState, PlayerFundsState } from "../index.ts";
import { FiggieGame } from "../../Game/index.ts";
import { Suits } from "../../Game/constants.ts";
import { createMockPlayers } from "./common.ts";
import { shuffle } from "../../../Library/randomization.ts";
import { InsufficientCardsError, InsufficientFundsError } from "../errors.ts";

describe("PlaySession Trading", () => {
    let playSession: PlaySession;
    let game: FiggieGame;

    const players: Players = createMockPlayers();

    beforeEach(() => {
      game = new FiggieGame("test", "test", "test");
      game.initGame();
      playSession = new PlaySession("test", game, players);
      playSession.initializeRandomPlayersCardState();
      playSession.initializePlayersFundsState();
    });

    describe("initialization", () => {
        it("should initialize the players funds", () => {
            expect(playSession.getPlayersFundsState()).toEqual({
                "test": playSession.DEFAULT_STARTING_FUNDS,
                "test2": playSession.DEFAULT_STARTING_FUNDS,
                "test3": playSession.DEFAULT_STARTING_FUNDS,
                "test4": playSession.DEFAULT_STARTING_FUNDS,
            });
        });
    });

    describe("trading", () => {
        let oldCardState: PlayerCardState | InsufficientCardsError;
        let oldFundsState: PlayerFundsState | InsufficientFundsError;
        let availableSuits = shuffle(Object.values(Suits));
        let tradedSuit = availableSuits[0];
        const tradedAmount = 5;
        beforeEach(() => {
            oldCardState = playSession.getPlayersCardState();
            oldFundsState = playSession.getPlayersFundsState();
            assert(!(oldCardState instanceof InsufficientCardsError));
            assert(!(oldFundsState instanceof InsufficientFundsError));
            oldCardState = structuredClone(oldCardState);
            oldFundsState = structuredClone(oldFundsState);
            let maxShuffles = 5;
            while (oldCardState["test"][tradedSuit] === 0 && maxShuffles > 0) {
                availableSuits = shuffle(availableSuits);
                tradedSuit = availableSuits[0];
                maxShuffles--;
            }
            playSession.swapCardForFunds("test", "test2", tradedSuit, tradedAmount);
        });
        it("should update the funds state", () => {
            const currentFundsState = playSession.getPlayersFundsState();
            assert(!(currentFundsState instanceof InsufficientFundsError));
            assert(!(oldFundsState instanceof InsufficientFundsError));
            expect(currentFundsState["test"]).toEqual(oldFundsState["test"] + tradedAmount);
            expect(currentFundsState["test2"]).toEqual(oldFundsState["test2"] - tradedAmount);
        });
        it("should update the card state", () => {
            const currentCardState = playSession.getPlayersCardState();
            assert(!(currentCardState instanceof InsufficientCardsError));
            assert(!(oldCardState instanceof InsufficientCardsError));
            expect(currentCardState["test"][tradedSuit]).toEqual(oldCardState["test"][tradedSuit] - 1);
            expect(currentCardState["test2"][tradedSuit]).toEqual(oldCardState["test2"][tradedSuit] + 1);
        });
    });
});