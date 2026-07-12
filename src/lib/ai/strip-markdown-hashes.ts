/** Retire les dièses markdown (# ## ###) en début de ligne. */
export function stripMarkdownHashes(text: string) {
  return text
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, "")
    .replace(/^[ \t]{0,3}#{1,6}[ \t]*$/gm, "")
    .trim();
}
