import natural from "natural";
import { get } from 'lodash';

import { normalizeName } from './normalize'
import { NameParts, CalculatePhoneticsMetricOptions } from "./types";
import { splitNameIntoParts } from "./split";

const soundEx: natural.SoundEx = new natural.SoundEx();
const metaphone: natural.Metaphone = new natural.Metaphone();
const dm: natural.DoubleMetaphone = new natural.DoubleMetaphone();

export const isSoundExMatch = (input: string, corpus: string): boolean => {
    input = normalizeName(input);
    corpus = normalizeName(corpus);

    return soundEx.compare(input, corpus)
}

export const isMetaphoneMatch = (input: string, corpus: string): boolean => {
    input = normalizeName(input);
    corpus = normalizeName(corpus);

    return metaphone.compare(input, corpus)
}

export const isDoubleMetaphoneMatch = (input: string, corpus: string): boolean => {
    input = normalizeName(input);
    corpus = normalizeName(corpus);

    return dm.compare(input, corpus)
}

export const calculatePhoneticMetric = (inputName: string, corpusName: string, options?: CalculatePhoneticsMetricOptions): number => {
    const inputNameParts: NameParts = splitNameIntoParts(inputName);
    const corpusNameParts: NameParts = splitNameIntoParts(corpusName);
    const returnAsPercentage: boolean = get(options, 'returnAsPercentage', false)

    const results: boolean[] = [
        isSoundExMatch(corpusNameParts.firstName, inputNameParts.firstName),
        isMetaphoneMatch(corpusNameParts.firstName, inputNameParts.firstName),
        isDoubleMetaphoneMatch(corpusNameParts.firstName, inputNameParts.firstName),
        isSoundExMatch(corpusNameParts.middleNames.join(" "), inputNameParts.middleNames.join(" ")),
        isMetaphoneMatch(corpusNameParts.middleNames.join(" "), inputNameParts.middleNames.join(" ")),
        isDoubleMetaphoneMatch(corpusNameParts.middleNames.join(" "), inputNameParts.middleNames.join(" ")),
        isSoundExMatch(corpusNameParts.lastName, inputNameParts.lastName),
        isMetaphoneMatch(corpusNameParts.lastName, inputNameParts.lastName),
        isDoubleMetaphoneMatch(corpusNameParts.lastName, inputNameParts.lastName),
    ]

    const metric: number = results.filter((result: boolean): boolean => result).length

    return returnAsPercentage ? parseFloat(((metric / 9) * 100).toFixed(2)) : metric
}
