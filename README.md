## Overview
This TypeScript module provides a fuzzy search function that matches an input string against a list of items, using both string distance and phonetic similarity. The function is designed to be customizable with thresholds and match paths, making it versatile for various use cases.

## Features
- **String Distance Calculation**: Uses Levenshtein distance to measure the similarity between the input string and potential matches.
- **Phonetic Similarity**: Compares the phonetic similarity of strings to enhance matching accuracy.
- **Customizable Matching Options**: Supports custom match paths within objects and configurable thresholds for distance and phonetics.
- **Sorting**: Matches are sorted by phonetic similarity (descending) and string distance (ascending) to prioritize the best matches.

## Installation
Using npm:
```bash
$ npm install fuzzy-names
```
Using yarn:
```bash
$ yarn add fuzzy-names
```

## Usage
#### Importing
First, import the search function along with any required types:

```typescript
import { search } from "./search";
import type { MatchItem, Options } from "./types";
```

#### Example

```typescript
// Example match list
const matchList = [
  { name: "John Doe", id: 1 },
  { name: "Jane Smith", id: 2 },
  { name: "Johnny Appleseed", id: 3 },
];

// Search for a match
const result = search("John", matchList, {
  matchPath: ["name"],
  threshold: {
    distance: 2,
    phonetics: 1,
  },
});

console.log(result); // { name: "John Doe", id: 1 }
```

#### Parameters

- `input` (`string`): The string to search for within the matchList.
- `matchList` (`Array<T>`): An array of items to search through. Each item can be a string or an object.
- `options` (`Partial<Options>`): An optional object to customize the search behavior.
    - `matchPath` (`Array<string>`): Specifies the path within the objects in matchList to search against.
    - `threshold`:
        - `distance` (`number`): The maximum allowed Levenshtein distance for a match.
        - `phonetics` (`number`): The minimum required phonetic similarity score.

#### Return Value
- Returns the best matching item from `matchList` that meets the specified thresholds, or `null` if no suitable match is found.

#### Options
##### Default Options
The function uses the following default options if none are provided:

```typescript
const DEFAULT_DISTANCE_THRESHOLD = 10;
const DEFAULT_PHONETICS_THRESHOLD = 1;

const defaultOptions = {
  matchPath: [],
  threshold: {
    phonetics: DEFAULT_PHONETICS_THRESHOLD,
    distance: DEFAULT_DISTANCE_THRESHOLD,
  },
};
```

##### Customizing Options
You can override the default options by providing a custom options object:

```typescript
const customOptions = {
  matchPath: ["name"],
  threshold: {
    distance: 2,
    phonetics: 1,
  },
};
```