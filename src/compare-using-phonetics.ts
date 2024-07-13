import natural from "natural";

import { normalizeName } from './normalize'

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
