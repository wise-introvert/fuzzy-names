import { distance } from "./utils/lev";

import { LevDistance, NameParts } from "./types";
import { splitNameIntoParts } from "./split";

export const calculateLevenshteinDistance = (
  queryName: string,
  corpusName: string,
): LevDistance => {
  const queryNameParts: NameParts = splitNameIntoParts(queryName);
  const corpusNameParts: NameParts = splitNameIntoParts(corpusName);

  const firstNameDistance: number = distance(
    queryNameParts.firstName,
    corpusNameParts.firstName,
  );
  const lastNameDistance: number = distance(
    queryNameParts.lastName,
    corpusNameParts.lastName,
  );

  let middleNameDistance: number = distance(
    queryNameParts.middleNames.join(" "),
    corpusNameParts.middleNames.join(" "),
  );

  const totalDistance: number =
    firstNameDistance + lastNameDistance + middleNameDistance;

  return {
    firstName: firstNameDistance,
    lastName: lastNameDistance,
    middleName: middleNameDistance,
    total: totalDistance,
  };
};
