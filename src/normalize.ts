import { deburr } from "lodash";

export const normalizeName = (name: string): string =>
  deburr(name)
    .toLowerCase()
    .replace(/[ ]{2,}/gi, " ")
    .replace(/[-]{1,}/gi, " ")
    .replace(/[^a-zA-Z ]/g, "")
    .trim();
