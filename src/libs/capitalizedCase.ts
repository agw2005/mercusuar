/**
 * Capitalizes the all the first character of a sentece.
 */
export function capitalizedCase(str: string) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
