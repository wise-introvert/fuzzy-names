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
