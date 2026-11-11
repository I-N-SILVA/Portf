/**
 * Splits copy on *asterisks* into plain and accented runs, so a headline in
 * the translation files can mark the one word that turns italic.
 * "people *actually* use" → [{text:"people ",accent:false},{text:"actually",accent:true},…]
 */
export function accentRuns(text: string): { text: string; accent: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*")
        ? { text: part.slice(1, -1), accent: true }
        : { text: part, accent: false },
    );
}

/** The same text with the markers removed, for aria-labels and metadata. */
export function plain(text: string): string {
  return text.replace(/\*/g, "");
}
