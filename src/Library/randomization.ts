/**
 * Mathy randomization functions.
 */

/**
 * Creates a new array with the elements of the input array in random order.
 * Uses the Fisher-Yates algorithm.
 * @param array - The array to shuffle
 * @returns A new array with the elements in random order
 */
export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [shuffled[currentIndex], shuffled[randomIndex]] = [
            shuffled[randomIndex], shuffled[currentIndex]
        ];
    }

    return shuffled;
}