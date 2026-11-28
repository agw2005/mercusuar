/**
 * Replaces underscores in a snake_case string with spaces.
 *
 * @param input - The snake_case string to convert.
 * @returns The string with underscores replaced by spaces.
 */
export const snakeToSpaces = (input: string): string => {
  return input.replace(/_/g, " ");
};
