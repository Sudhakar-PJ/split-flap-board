import { CHARACTERS } from "../utils/constants";

/**
 * Returns the next character in the continuous mechanical split-flap loop.
 */
export function getNextCharacter(currentChar: string): string {
  const currentIndex = CHARACTERS.indexOf(currentChar.toUpperCase());
  if (currentIndex === -1) {
    return CHARACTERS[0];
  }
  const nextIndex = (currentIndex + 1) % CHARACTERS.length;
  return CHARACTERS[nextIndex];
}

/**
 * Calculates the exact step sequence array from target start character to end character.
 * Simulates real mechanical single-direction wheel rotation.
 */
export function getFlapSequence(startChar: string, targetChar: string): string[] {
  const start = (startChar || " ").toUpperCase();
  const target = (targetChar || " ").toUpperCase();

  let startIndex = CHARACTERS.indexOf(start);
  if (startIndex === -1) startIndex = 0;

  let targetIndex = CHARACTERS.indexOf(target);
  if (targetIndex === -1) targetIndex = 0;

  if (startIndex === targetIndex) {
    return [start];
  }

  const sequence: string[] = [start];
  let curr = startIndex;

  while (curr !== targetIndex) {
    curr = (curr + 1) % CHARACTERS.length;
    sequence.push(CHARACTERS[curr]);
  }

  return sequence;
}

/**
 * Calculates total number of flips needed between start and target.
 */
export function getFlapStepCount(startChar: string, targetChar: string): number {
  return getFlapSequence(startChar, targetChar).length - 1;
}
