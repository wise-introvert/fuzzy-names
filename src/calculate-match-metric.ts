import { calculateLevenshteinDistance } from './calculate-lev-distance'
import { calculatePhoneticMetric } from './calculate-phonetics-metric'
import type { MatchMetric, LevDistance } from './types'

export const calculateMatchMetric = (queryName: string, corpusName: string): MatchMetric => {
    const phoneticsMetric: number = calculatePhoneticMetric(queryName, corpusName)
    const levDistance: LevDistance = calculateLevenshteinDistance(queryName, corpusName)

    return {
        levDistance,
        phoneticsMetric
    }
}
