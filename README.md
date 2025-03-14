# Fuzzy Names - TypeScript Fuzzy Name Matching Library

A powerful TypeScript library for fuzzy name matching that combines Levenshtein distance and phonetic similarity algorithms to provide accurate name matching capabilities.

## Table of Contents
- [Installation](#installation)
- [Core Features](#core-features)
- [API Reference](#api-reference)
  - [search](#search)
  - [calculateMatchMetric](#calculatematchmetric)
  - [calculateLevenshteinDistance](#calculatelevensteindistance)
  - [calculatePhoneticMetric](#calculatephoneticmetric)
  - [normalizeName](#normalizename)
  - [splitNameIntoParts](#splitnameintoparts)
- [Types](#types)
- [Examples](#examples)
- [How it works](#how-it-works)

## Installation

Using npm:
```bash
npm install fuzzy-names
```

Using yarn:
```bash
yarn add fuzzy-names
```

## Core Features

- **Fuzzy Name Matching**: Combines Levenshtein distance and phonetic similarity for accurate name matching
- **Multiple Phonetic Algorithms**: Uses SoundEx, Metaphone, and Double Metaphone for comprehensive phonetic matching
- **Customizable Thresholds**: Configurable distance and phonetic similarity thresholds
- **Flexible Input Handling**: Works with both string arrays and object arrays with custom paths
- **Name Normalization**: Handles special characters, diacritics, and various name formats
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## API Reference

### search

The main function for finding the best matching name in a list.

```typescript
function search<T = MatchItem>(
  input: string,
  matchList: Array<T>,
  options?: Partial<Options>
): T | null
```

##### Parameters

- `input: string`
  - The name string to search for within the matchList
  - Properties:
    - Can be a full name or partial name
    - Is case-insensitive
    - Can include special characters, diacritics, or extra spaces
    - Can handle various name formats (Western, Eastern, with prefixes/suffixes)
  - Examples:
    ```typescript
    search("John Doe")              // Basic full name
    search("Dr. John A. Doe Jr.")   // Name with prefix and suffix
    search("josé garcía")           // Name with diacritics
    search("  Mary   Jane  ")       // Name with extra spaces
    ```

- `matchList: Array<T>`
  - An array of items to search through
  - Properties:
    - Can be an array of strings: `string[]`
    - Can be an array of objects: `Array<T>`
    - For objects, use `matchPath` in options to specify the path to the name property
    - Generic type `T` allows for any object structure
  - Examples:
    ```typescript
    // Simple string array
    const stringList = [
      "John Doe",
      "Jane Smith",
      "Bob Johnson"
    ];

    // Object array with direct name property
    const objectList = [
      { name: "John Doe", id: 1 },
      { name: "Jane Smith", id: 2 }
    ];

    // Object array with nested name property
    const nestedList = [
      { user: { profile: { name: "John Doe" }, id: 1 } },
      { user: { profile: { name: "Jane Smith" }, id: 2 } }
    ];
    ```

- `options?: Partial<Options>`
  - Optional configuration object that customizes the search behavior
  - Properties:
    - `matchPath: ReadonlyArray<number | string>`
      - Specifies the path to the name property in objects
      - Required when searching through object arrays
      - Can handle nested paths
      - Empty array for direct string matching
      - Examples:
        ```typescript
        // Direct name property
        search("John", objects, { matchPath: ["name"] })

        // Nested name property
        search("John", nested, { matchPath: ["user", "profile", "name"] })

        // Array index access
        search("John", arrays, { matchPath: ["names", 0] })
        ```

    - `threshold: { distance?: number, phonetics?: number }`
      - Fine-tunes the matching sensitivity
      - `distance` property:
        - Default value: 10
        - Maximum allowed Levenshtein distance
        - Higher values allow more character differences
        - Lower values require closer string matches
        - Recommended ranges:
          - 1-2 for strict matching
          - 3-5 for moderate matching
          - 6-10 for loose matching
      - `phonetics` property:
        - Default value: 1
        - Minimum required phonetic similarity score
        - Range: 0-9 (3 points per matching algorithm)
        - Higher values require stronger phonetic matches
        - Recommended ranges:
          - 1-2 for basic matching
          - 3-5 for moderate matching
          - 6-9 for strict matching
      - Examples:
        ```typescript
        // Strict matching
        search("John", names, {
          threshold: {
            distance: 2,    // Allow only minor typos
            phonetics: 6    // Require strong phonetic match
          }
        })

        // Loose matching
        search("John", names, {
          threshold: {
            distance: 8,    // Allow more character differences
            phonetics: 2    // Accept weaker phonetic matches
          }
        })

        // Balanced matching
        search("John", names, {
          threshold: {
            distance: 5,    // Moderate character differences
            phonetics: 4    // Moderate phonetic similarity
          }
        })
        ```

#### Returns
- The best matching item from the list, or `null` if no match is found
  - For string arrays: returns the matching string
  - For object arrays: returns the entire matching object
  - Matches are ranked by:
    1. Phonetic similarity (higher is better)
    2. Levenshtein distance (lower is better)

#### Example
```typescript
const people = [
  { name: "John Doe", id: 1 },
  { name: "Jane Smith", id: 2 }
];

const result = search("Jon Doe", people, {
  matchPath: ["name"],
  threshold: { distance: 2, phonetics: 1 }
});
// Returns: { name: "John Doe", id: 1 }
```

### calculateMatchMetric

Calculates both Levenshtein distance and phonetic similarity between two names.

```typescript
function calculateMatchMetric(
  queryName: string,
  corpusName: string
): MatchMetric
```

#### Parameters
- `queryName`: The input name to compare
- `corpusName`: The name to compare against

#### Returns
- Object containing Levenshtein distance and phonetic metric scores

#### Example
```typescript
const metric = calculateMatchMetric("John Doe", "Jon Doe");
// Returns: {
//   levDistance: { firstName: 1, lastName: 0, middleName: 0, total: 1 },
//   phoneticsMetric: 6
// }
```

### calculateLevenshteinDistance

Calculates the Levenshtein distance between two names, broken down by name parts.

```typescript
function calculateLevenshteinDistance(
  queryName: string,
  corpusName: string
): LevDistance
```

#### Parameters
- `queryName`: The input name to compare
- `corpusName`: The name to compare against

#### Returns
- Object containing distance scores for first name, middle name, last name, and total

#### Example
```typescript
const distance = calculateLevenshteinDistance("John A Doe", "Jon B Doe");
// Returns: {
//   firstName: 1,
//   middleName: 1,
//   lastName: 0,
//   total: 2
// }
```

### calculatePhoneticMetric

Calculates phonetic similarity between two names using multiple algorithms.

```typescript
function calculatePhoneticMetric(
  inputName: string,
  corpusName: string,
  options?: CalculatePhoneticsMetricOptions
): number
```

#### Parameters
- `inputName`: The input name to compare
- `corpusName`: The name to compare against
- `options`: Optional configuration
  - `returnAsPercentage`: Return score as percentage instead of raw number

#### Returns
- Numeric score indicating phonetic similarity (higher is more similar)

#### Example
```typescript
const score = calculatePhoneticMetric("John Doe", "Jon Doe");
// Returns: 6 (or 100 if returnAsPercentage is true)
```

### normalizeName

Normalizes a name string by removing special characters and standardizing format.

```typescript
function normalizeName(name: string): string
```

#### Parameters
- `name`: The name string to normalize

#### Returns
- Normalized name string

#### Example
```typescript
const normalized = normalizeName("  John   Döe-Smith  ");
// Returns: "john doe smith"
```

### splitNameIntoParts

Splits a full name into its constituent parts.

```typescript
function splitNameIntoParts(name: string): NameParts
```

#### Parameters
- `name`: The full name to split

#### Returns
- Object containing firstName, lastName, and middleNames array

#### Example
```typescript
const parts = splitNameIntoParts("John Alan Doe");
// Returns: {
//   firstName: "john",
//   lastName: "doe",
//   middleNames: ["alan"]
// }
```

## Types

### NameParts
```typescript
interface NameParts {
  firstName: string;
  lastName: string;
  middleNames: string[];
}
```

### LevDistance
```typescript
interface LevDistance {
  firstName: number;
  middleName: number;
  lastName: number;
  total: number;
}
```

### MatchMetric
```typescript
interface MatchMetric {
  levDistance: LevDistance;
  phoneticsMetric: number;
}
```

### Options
```typescript
type Options = {
  readonly matchPath: ReadonlyArray<number | string>;
  readonly threshold: {
    phonetics?: number;
    distance?: number;
  };
}
```

## Examples

### Basic String Matching
```typescript
import { search } from 'fuzzy-names';

const names = ["John Doe", "Jane Smith", "Bob Johnson"];
const result = search("Jon Doe", names);
// Returns: "John Doe"
```

### Object Matching with Custom Path
```typescript
import { search } from 'fuzzy-names';

const users = [
  { user: { name: "John Doe", id: 1 } },
  { user: { name: "Jane Smith", id: 2 } }
];

const result = search("Jon Doe", users, {
  matchPath: ["user", "name"]
});
// Returns: { user: { name: "John Doe", id: 1 } }
```

### Handling Special Characters
```typescript
import { search } from 'fuzzy-names';

const names = [
  { name: "José García" },
  { name: "François Dubois" }
];

const result = search("Jose Garcia", names, {
  matchPath: ["name"]
});
// Returns: { name: "José García" }
```

### Custom Thresholds
```typescript
import { search } from 'fuzzy-names';

const names = ["John Doe", "Jonathan Doe", "Jon Doe"];
const result = search("Johnny Doe", names, {
  threshold: {
    distance: 5,    // Allow more character differences
    phonetics: 2    // Require stronger phonetic similarity
  }
});
// Returns: "Jonathan Doe"
```

## How It Works

The core functionality of this library revolves around the `search` function, which implements a sophisticated name matching algorithm combining both edit distance and phonetic similarity measures. This dual approach allows for highly accurate name matching that can handle variations in spelling, pronunciation, and formatting.

### Search Algorithm Overview

The search process follows these steps:

1. **Name Normalization**: Input names are normalized by removing special characters, converting to lowercase, and standardizing spacing.
2. **Name Part Splitting**: Names are split into first, middle, and last name components for granular comparison.
3. **Distance Calculation**: Levenshtein distance is computed for each name part.
4. **Phonetic Matching**: Multiple phonetic algorithms are applied for pronunciation-based matching.
5. **Score Combination**: Results are combined and weighted to determine the best match.

### Underlying Algorithms

#### Levenshtein Distance

The Levenshtein distance algorithm measures the minimum number of single-character edits required to change one string into another. For example:

- "John" to "Jon" has a distance of 1 (one deletion)
- "Smith" to "Smyth" has a distance of 1 (one substitution)
- "Catherine" to "Katherine" has a distance of 1 (one substitution)

The library calculates this distance separately for each name part (first, middle, last) to provide more accurate matching for full names.

#### SoundEx

SoundEx is a phonetic algorithm that indexes names by sound as pronounced in English. It generates a code that remains the same for similar-sounding names:

1. Keeps the first letter
2. Converts remaining letters to numbers:
   - 1 = B, F, P, V
   - 2 = C, G, J, K, Q, S, X, Z
   - 3 = D, T
   - 4 = L
   - 5 = M, N
   - 6 = R

For example:
- "Robert" and "Rupert" both encode to "R163"
- "Smith" and "Smythe" both encode to "S530"

#### Metaphone

Metaphone improves upon SoundEx by using more sophisticated rules that better handle English pronunciation patterns. It considers letter combinations and their positions:

- Handles combinations like "PH" (sounds like "F")
- Accounts for silent letters
- Considers word beginnings and endings differently

For example:
- "Philip" and "Filip" both encode to "FLP"
- "Catherine" and "Kathryn" both encode to "K0RN"

#### Double Metaphone

Double Metaphone further enhances the Metaphone algorithm by:

1. Providing primary and alternative encodings for names
2. Better handling international name variations
3. Supporting multiple cultural pronunciation patterns

This is particularly useful for names that might have different pronunciations or cultural origins. For example:
- "Zhang" might encode to both "JNG" and "CSNG"
- "Michael" might encode to both "MKL" and "MXL"

### Scoring and Matching Process

The search function combines these algorithms in the following way:

1. **Initial Filtering**:
   - Normalizes all names in the search corpus
   - Applies basic string matching optimizations

2. **Distance Scoring**:
   - Calculates Levenshtein distance for each name part
   - Applies weightings based on name part importance
   - Filters out matches exceeding the distance threshold

3. **Phonetic Matching**:
   - Applies all three phonetic algorithms
   - Counts matching algorithms for each name part
   - Generates a phonetic similarity score (0-9, 3 points per algorithm)

4. **Final Ranking**:
   - Combines distance and phonetic scores
   - Prioritizes matches with high phonetic similarity
   - Uses Levenshtein distance as a tiebreaker
   - Returns the best match above the threshold

This multi-algorithm approach provides robust matching that can handle:
- Common spelling variations
- Phonetic similarities
- Typographical errors
- Cultural name variations
- Different name formats
