import { distance } from "fastest-levenshtein";

import { LevDistance, NameParts } from "./types";
import { splitNameIntoParts } from "./split";

/**
 * Calculates the Levenshtein distance between the names from the query and the corpus.
 *
 * The function splits both the query and the corpus names into parts (first name, middle names, and last name),
 * then computes the Levenshtein distance for each part individually and sums them up to provide a total distance.
 *
 * @param {string} queryName - The name to be queried, typically the name to compare against the corpus.
 * @param {string} corpusName - The name from the corpus to compare with the query name.
 * @returns {LevDistance} An object containing the Levenshtein distances for first name, last name, middle names,
 *                        and the total distance.
 */
export const calculateLevenshteinDistance = (
  queryName: string,
  corpusName: string,
): LevDistance => {
  // Split the query and corpus names into parts (first name, middle names, last name)
  const queryNameParts: NameParts = splitNameIntoParts(queryName);
  const corpusNameParts: NameParts = splitNameIntoParts(corpusName);

  // Calculate the Levenshtein distance between the first names
  const firstNameDistance: number = distance(
    queryNameParts.firstName,
    corpusNameParts.firstName,
  );

  // Calculate the Levenshtein distance between the last names
  const lastNameDistance: number = distance(
    queryNameParts.lastName,
    corpusNameParts.lastName,
  );

  // Calculate the Levenshtein distance between the middle names (joined into single strings)
  let middleNameDistance: number = distance(
    queryNameParts.middleNames.join(" "),
    corpusNameParts.middleNames.join(" "),
  );

  // Calculate the total distance as the sum of first, middle, and last name distances
  const totalDistance: number =
    firstNameDistance + lastNameDistance + middleNameDistance;

  // Return an object containing all the calculated distances
  return {
    firstName: firstNameDistance,
    lastName: lastNameDistance,
    middleName: middleNameDistance,
    total: totalDistance,
  };
};
