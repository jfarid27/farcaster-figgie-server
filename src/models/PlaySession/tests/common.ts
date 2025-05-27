import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

import { PlaySession, Players, PlayerCardState } from "../index.ts";
import { FiggieGame, GameState } from "../../Game/index.ts";
import { Suits } from "../../Game/constants.ts";
import { InvalidPlayerNumberError } from "../errors.ts";


export const createMockPlayers = () => {
    const players: Players = {
      "test": { id: "test", name: "test", socket: {} as WebSocket },
      "test2": { id: "test2", name: "test2", socket: {} as WebSocket },
      "test3": { id: "test3", name: "test3", socket: {} as WebSocket },
      "test4": { id: "test4", name: "test4", socket: {} as WebSocket }
    };

    return players;
};