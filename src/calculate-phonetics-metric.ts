import natural from "natural";
import every from "lodash.every";
import get from "lodash.get";
import isEmpty from "lodash.isempty";
import negate from "lodash.negate";

import { normalizeName } from "./normalize";
import { NameParts, CalculatePhoneticsMetricOptions } from "./types";
import { splitNameIntoParts } from "./split";

const soundEx: natural.SoundEx = new natural.SoundEx();
const metaphone: natural.Metaphone = new natural.Metaphone();
const dm: natural.DoubleMetaphone = new natural.DoubleMetaphone();

const isSoundExMatch = (input: string, corpus: string): boolean => {
  input = normalizeName(input);
  corpus = normalizeName(corpus);

  return soundEx.compare(input, corpus);
};

const isMetaphoneMatch = (input: string, corpus: string): boolean => {
  input = normalizeName(input);
  corpus = normalizeName(corpus);

  return metaphone.compare(input, corpus);
};

const isDoubleMetaphoneMatch = (input: string, corpus: string): boolean => {
  input = normalizeName(input);
  corpus = normalizeName(corpus);

  return dm.compare(input, corpus);
};

export const calculatePhoneticMetric = (
  inputName: string,
  corpusName: string,
  options?: CalculatePhoneticsMetricOptions,
): number => {
  const returnAsPercentage: boolean = get(options, "returnAsPercentage", false);

  const inputNameParts: NameParts = splitNameIntoParts(inputName);
  const corpusNameParts: NameParts = splitNameIntoParts(corpusName);
  const inputMiddleName: string = inputNameParts.middleNames.join(" ");
  const corpusMiddleName: string = corpusNameParts.middleNames.join(" ");

  const shouldCheckMiddleNames: boolean = every(
    [inputMiddleName, corpusMiddleName],
    negate(isEmpty),
  );
  const shouldCheckFirstNames: boolean = every(
    [inputNameParts.firstName, corpusNameParts.firstName],
    negate(isEmpty),
  );
  const shouldCheckLastNames: boolean = every(
    [inputNameParts.lastName, corpusNameParts.lastName],
    negate(isEmpty),
  );

  const results: boolean[] = [
    ...(shouldCheckFirstNames
      ? [
          isSoundExMatch(corpusNameParts.firstName, inputNameParts.firstName),
          isMetaphoneMatch(corpusNameParts.firstName, inputNameParts.firstName),
          isDoubleMetaphoneMatch(
            corpusNameParts.firstName,
            inputNameParts.firstName,
          ),
        ]
      : [false, false, false]),
    ...(shouldCheckMiddleNames
      ? [
          isSoundExMatch(
            corpusNameParts.middleNames.join(" "),
            inputNameParts.middleNames.join(" "),
          ),
          isMetaphoneMatch(
            corpusNameParts.middleNames.join(" "),
            inputNameParts.middleNames.join(" "),
          ),
          isDoubleMetaphoneMatch(
            corpusNameParts.middleNames.join(" "),
            inputNameParts.middleNames.join(" "),
          ),
        ]
      : [false, false, false]),
    ...(shouldCheckLastNames
      ? [
          isSoundExMatch(corpusNameParts.lastName, inputNameParts.lastName),
          isMetaphoneMatch(corpusNameParts.lastName, inputNameParts.lastName),
          isDoubleMetaphoneMatch(
            corpusNameParts.lastName,
            inputNameParts.lastName,
          ),
        ]
      : [false, false, false]),
  ];

  const metric: number = results.filter(
    (result: boolean): boolean => result,
  ).length;
  const numberOfParts: number = [
    shouldCheckFirstNames,
    shouldCheckMiddleNames,
    shouldCheckLastNames,
  ].filter((value: boolean): boolean => value).length;

  return returnAsPercentage
    ? parseFloat(((metric / (numberOfParts * 3)) * 100).toFixed(2))
    : metric;
};
