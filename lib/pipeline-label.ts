/** Split long pipeline stage names for compact labels (chart, badges, etc.) */
export function splitStageLabel(value: string): string[] {
  if (!value) return [];

  if (value.includes(" - ")) {
    return value.split(" - ").map((part) => part.trim());
  }

  const words = value.trim().split(/\s+/);
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }

  if (value.length > 16) {
    return [value];
  }

  return [value];
}
