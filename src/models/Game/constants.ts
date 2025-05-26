import { shuffle } from '../../Library/randomization.ts';

export enum Suits {
    HEARTS = 'hearts',
    DIAMONDS = 'diamonds',
    CLUBS = 'clubs',
    SPADES = 'spades'
}

export const COLOR_PAIRS = {
    [Suits.HEARTS]: Suits.DIAMONDS,
    [Suits.DIAMONDS]: Suits.HEARTS,
    [Suits.CLUBS]: Suits.SPADES,
    [Suits.SPADES]: Suits.CLUBS
}

export function generateRandomSuits(): Suits[] {
    const suits = Object.values(Suits);
    return shuffle(suits);
}