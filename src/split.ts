import get from "lodash.get";
import isEmpty from "lodash.isempty";

import { normalizeName } from "./normalize";
import { NameParts } from "./types";

export const splitNameIntoParts = (name: string): NameParts => {
  name = normalizeName(name);

  const parts: string[] = name.split(" ");

  const firstName: string = get(parts, "[0]", "");
  if (parts.length == 1) {
    return {
      firstName,
      lastName: "",
      middleNames: [],
    };
  }

  const lastName: string = get(parts, `[${parts.length - 1}]`, "");
  if (parts.length == 2) {
    return {
      firstName,
      lastName,
      middleNames: [],
    };
  }

  const middleNames: string[] = parts
    .filter(
      (_, index: number): boolean => !(index == 0 || index == parts.length - 1),
    )
    .filter((value: string): boolean => !isEmpty(value.replace(/ /gi, "")));

  const nameParts: NameParts = {
    firstName,
    lastName,
    middleNames,
  };

  return nameParts;
};
