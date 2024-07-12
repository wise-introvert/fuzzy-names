import { LevDistance } from "./types";
import { calculateLevenshteinDistance } from "./calculate-lev-distance";

const result: LevDistance = calculateLevenshteinDistance(
  "Ryan Gosling",
  "Rian Gossling",
);
console.log(JSON.stringify(result, null, 2));
