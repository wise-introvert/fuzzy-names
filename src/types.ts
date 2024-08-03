export interface NameParts {
  firstName: string;
  lastName: string;
  middleNames: string[];
}

export interface LevDistance {
  firstName: number;
  middleName: number;
  lastName: number;
  total: number;
}

export interface CalculatePhoneticsMetricOptions {
  returnAsPercentage?: boolean;
}

export interface MatchMetric {
  levDistance: LevDistance;
  phoneticsMetric: number;
}

export type MatchItem = Record<string, unknown> | string;

export type Options = {
  readonly matchPath: ReadonlyArray<number | string>;
};

export type ScoreProcessorOutput<T = MatchItem> = {
  input: string;
  corpus: T;
  matchMetric: MatchMetric;
};
