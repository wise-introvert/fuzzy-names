import { get, orderBy } from "lodash";

import { calculateMatchMetric } from "./calculate-match-metric";
import { normalizeName } from "./normalize";
import type { MatchMetric } from "./types";

export type MatchItem = Record<string, unknown> | string;

export type Options = {
  readonly matchPath: ReadonlyArray<number | string>;
};

export type ScoreProcessorOutput<T = MatchItem> = {
  input: string;
  corpus: T;
  matchMetric: MatchMetric;
};

const fillDefaultOptions = (options?: Partial<Options>): Options => {
  const optionsWithDefaultValues: Options = {
    matchPath: [],
    ...options,
  };

  return optionsWithDefaultValues;
};

const getMatchItemStr = <T = MatchItem>(
  matchItem: T,
  matchPath: Options["matchPath"],
): string => {
  const matchItemStr =
    matchPath.length > 0
      ? matchPath.reduce<unknown>((acc, prop) => {
          // @ts-expect-error skip redundant type check
          return acc?.[prop];
        }, matchItem)
      : matchItem;
  if (typeof matchItemStr !== "string") return "";
  return matchItemStr;
};

const matchItemProcessor = <T = MatchItem>(
  matchItem: T,
  options: Options,
): string => {
  const { matchPath } = options;

  const matchItemStr = getMatchItemStr<T>(matchItem, matchPath);

  return normalizeName(matchItemStr);
};

export const search = <T = MatchItem>(
  input: string,
  matchList: Array<T>,
  options?: Partial<Options>,
): Array<T> | T | null => {
  const optionsWithDefaultValues: Options = fillDefaultOptions(options);

  const scoreProcessor = (matchItem: T): ScoreProcessorOutput<T> => ({
    input,
    corpus: matchItem,
    matchMetric: calculateMatchMetric(
      input,
      matchItemProcessor<T>(matchItem, optionsWithDefaultValues),
    ),
  });

  const matches: Array<ScoreProcessorOutput<T>> = matchList.map(scoreProcessor);

  const sortedFuzzyMatches: Array<ScoreProcessorOutput<T>> = orderBy(
    matches,
    ["matchMetric.levDistance.total", "matchMetric.phoneticsMetric"],
    ["asc", "desc"],
  );

  return get(sortedFuzzyMatches, "[0].corpus", null);
};
