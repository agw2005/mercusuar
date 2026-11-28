/**
 * Capitalizes the first character of a string and converts the rest to lowercase.
 */
export function sentenceCase(str: string) {
  if (!str) return "";
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
}
