export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[ ]{2,}/gi, " ")
    .replace(/[^a-zA-Z ]/g, "")
    .trim();
