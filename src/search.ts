import { get, orderBy } from "lodash";

import { calculateMatchMetric } from "./calculate-match-metric";
import { normalizeName } from "./normalize";
import type { MatchItem, Options, ScoreProcessorOutput } from "./types";

const DEFAULT_DISTANCE_THRESHOLD: number = 10;
const DEFAULT_PHONETICS_THRESHOLD: number = 0;

const fillDefaultOptions = (options?: Partial<Options>): Options => {
  const optionsWithDefaultValues: Options = {
    matchPath: [],
    threshold: {
        phonetics: DEFAULT_PHONETICS_THRESHOLD,
        distance: DEFAULT_DISTANCE_THRESHOLD
    },
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
  if (matchList.length <= 0) {
    return null;
  }

  const optionsWithDefaultValues: Options = fillDefaultOptions(options);

  const scoreProcessor = (matchItem: T): ScoreProcessorOutput<T> => ({
    input,
    corpus: matchItem,
    matchMetric: calculateMatchMetric(
      input,
      matchItemProcessor<T>(matchItem, optionsWithDefaultValues),
    ),
  });

  const distanceThreshold: number = get(options, "threshold.distance", DEFAULT_DISTANCE_THRESHOLD)
  const phoneticsThreshold: number = get(options, "threshold.phonetics", DEFAULT_PHONETICS_THRESHOLD)

  const matches: Array<ScoreProcessorOutput<T>> = matchList.map(scoreProcessor).filter((match: ScoreProcessorOutput<T>): boolean => {
      const matchTotalDistance: number = get(match, "matchMetric.levDistance.total")
      const matchPhoneticsScore: number = get(match, "matchMetric.phoneticsMetric")

      return matchTotalDistance <= distanceThreshold && matchPhoneticsScore >= phoneticsThreshold
  })

  if(matches.length <= 0) {
      return null
  }

  const sortedFuzzyMatches: Array<ScoreProcessorOutput<T>> = orderBy(
    matches,
    ["matchMetric.phoneticsMetric", "matchMetric.levDistance.total"],
    ["desc", "asc"],
  );
  const bestMatch: ScoreProcessorOutput<T> = get(sortedFuzzyMatches, "[0]");

  if (bestMatch.matchMetric.phoneticsMetric <= 0) {
    return null;
  }

  return get(bestMatch, "corpus", null);
};
