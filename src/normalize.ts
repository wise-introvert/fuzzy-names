import deburr from "lodash.deburr";

export const normalizeName = (name: string): string =>
  deburr(name)
    .toLowerCase()
    .replace(/[ ]{2,}/gi, " ")
    .replace(/[-]{1,}/gi, " ")
    .replace(/[^a-zA-Z ]/g, "")
    .trim();
