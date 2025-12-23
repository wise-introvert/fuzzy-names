# Comprehensive Project Plan: IndianNames Fuzzy Search Library
## A Modern, Optimized TypeScript Implementation

---

## Executive Summary

This document outlines a complete redesign and reimplementation of a fuzzy search library specifically optimized for Indian names. The new library will:

- **Leverage dual matching strategies**: Levenshtein distance + Phonetic matching
- **Support multiple data structures**: Flat arrays, nested objects, database records
- **Provide production-grade performance**: Optimized algorithms, lazy evaluation, caching
- **Offer developer-friendly API**: Inspired by FuseJS with Indian-name-specific enhancements
- **Enable deep customization**: Configurable weights, scoring, and matching strategies
- **Work everywhere**: Browser, Node.js, Electron, React Native

---

## Part 1: Foundation & Concepts

### 1.1 Problem Statement & Challenges

Indian names present unique challenges for fuzzy matching:

**Challenge 1: Multiple Transliterations**
```
Hindi: राज (raj)
Valid English spellings: Raj, Raaj, Rajh, Raj
```
Same sound, different spellings. Traditional edit distance fails here.

**Challenge 2: Phonetic Similarities**
```
Riyaz vs Riaz
Pronounced identically, spelled differently
Levenshtein distance: 1
But they sound exactly the same!
```

**Challenge 3: Name Structures**
- Single names: `Raj`
- Full names: `Raj Kumar Singh`
- Compound names: `Sri Devi` (both words form the given name)
- Suffixes/Prefixes: `Dr. Raj Kumar`, `Raj Kumar Jr.`

**Challenge 4: Name Variations**
- Vowel elongation: `Suresh` vs `Sureesh`
- Spelling variants: `Krupa` vs `Krupa`
- Gender forms: `Anit` vs `Anita`

### 1.2 Understanding Levenshtein Distance

**What it is:** The minimum number of single-character edits (insertions, deletions, substitutions) needed to transform one string into another.

**Why it works:**
- Simple and language-agnostic
- Handles typos and spelling variations well
- Computationally efficient with optimization

**Example:**
```
"Raj" → "Raj Kumar"
Operations: 1 insertion of space, 5 insertions of letters
Distance: 6

"Rajesh" → "Raj"  
Operations: 4 deletions
Distance: 4
```

**Algorithm (Dynamic Programming):**

```
For strings s1 (length m) and s2 (length n):

1. Create a matrix of size (m+1) × (n+1)
2. Initialize first row: [0, 1, 2, 3, ..., n]
3. Initialize first column: [0, 1, 2, 3, ..., m]
4. For each cell (i, j):
   - If s1[i-1] == s2[j-1]: cost = 0
   - Else: cost = 1
   - dp[i][j] = min(
       dp[i-1][j] + 1,      // deletion
       dp[i][j-1] + 1,      // insertion
       dp[i-1][j-1] + cost  // substitution
     )
5. Return dp[m][n]
```

**Example walkthrough:**

```
    ""  A   J   E   E   T
""   0   1   2   3   4   5
A    1   0   1   2   3   4
J    2   1   0   1   2   3
E    3   2   1   0   1   2
E    4   3   2   1   0   1
T    5   4   3   2   1   0

Distance: 0 (strings are identical)
```

**Time Complexity:** O(m × n) where m, n are string lengths
**Space Complexity:** O(m × n) or O(min(m, n)) with optimization

**Optimization: Two-row optimization**

Instead of storing the full m×n matrix, keep only the previous and current rows:

```typescript
const lev = (a: string, b: string): number => {
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  
  let prev = Array.from({ length: longer.length + 1 }, (_, i) => i);
  let curr = [0];
  
  for (let i = 1; i <= shorter.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= longer.length; j++) {
      const cost = shorter[i - 1] === longer[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,      // insertion
        prev[j] + 1,          // deletion
        prev[j - 1] + cost    // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  
  return prev[longer.length];
};
```

**When Levenshtein Fails:**
```
"Kumar" vs "Kumaar"     → Distance: 1 ✓ (good)
"Riyaz" vs "Riaz"       → Distance: 1 ✓ (good)
"Suresh" vs "Sureesh"   → Distance: 1 ✓ (good)
```

Levenshtein works well for these cases! But it struggles with:
```
"Kunnal" vs "Kunnaal"  → Distance: 1
"Kunnal" vs "Kunal"    → Distance: 1
```

Both have the same distance, but phonetically they're different from the original.

### 1.3 Understanding Phonetic Matching for Indian Names

**What is phonetic matching?**
Converting a word to a phonetic code based on how it's *pronounced*, then comparing codes instead of spellings.

**Why it's crucial for Indian names:**
```
Riyaz (Ree-az) vs Riaz (Ree-az)
Same pronunciation, different spelling
Levenshtein: 1 (close but not "same sound")
Phonetic: Same code = "Identical sounds"
```

**Concept 1: Sound Grouping**

Indian languages have consonant families. Sounds that are phonetically similar should be grouped:

```
Velar (k sound family):
क (ka), ख (kha), ग (ga), घ (gha), ङ (nga)
In English: K, KH, G, GH, NG → All belong to velar group

Dental (t sound family):
त (ta), थ (tha), द (da), ध (dha), न (na)
In English: T, TH, D, DH, N → All belong to dental group

Sibilant (s sound family):
स (sa), ष (sha), श (sa), ज्ञ (gya)
In English: S, SH, X → Sibilant group
```

**Concept 2: Vowel Normalization**

Vowel length doesn't change meaning in Indian names:

```
Long vowels: A, E, I, O, U
Short vowels: a, e, i, o, u

Should be treated as equivalent:
Raj = Raaj
Suresh = Sureesh
Anita = Aneeta
```

**Concept 3: The IndicSoundex Algorithm**

This is a modified Soundex algorithm designed for Indian languages.

**How IndicSoundex works:**

```
Step 1: Normalize the input
  - Convert to lowercase
  - Remove non-alphabetic characters
  - Group vowels (a/aa/e/ee → single code)

Step 2: Keep first character
  - Don't encode it, just note it

Step 3: Encode remaining characters
  - Assign phonetic codes to consonants based on sound families
  
Step 4: Remove consecutive duplicates
  - ka, kha → both map to "K"
  - So "KK" → "K"

Step 5: Remove vowel codes (0s)
  - Vowels are marked as 0 (no consonant sound)
  - Remove them from the result

Step 6: Pad to fixed length
  - Return code of consistent length (e.g., 5 characters)
```

**Character Mapping for English Romanized Names:**

Based on sound families (adapted from IndicSoundex):

```
Vowels (Vowel Normalization): a, e, i, o, u, y → 0
  - All mapped to 0, then removed from final code

Bilabial (lip sounds): b, p, f, v → 1
Velar (throat sounds): k, g, q → 2
Dental (tongue-teeth): t, d, s, z → 3
Palatal (roof of mouth): c, j, x → 4
Nasal (through nose): m, n, ng → 5
Liquid (flowing): l, r → 6
Fricative (forced air): h, sh → 7
Other consonants: w → 8
```

**Example: IndicSoundex Implementation**

```typescript
const indicSoundex = (name: string): string => {
  // Normalize
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('');
  
  if (normalized.length === 0) return '';
  
  const charMap: { [key: string]: string } = {
    'a': '0', 'e': '0', 'i': '0', 'o': '0', 'u': '0', 'y': '0',
    'b': '1', 'p': '1', 'f': '1', 'v': '1',
    'k': '2', 'g': '2', 'q': '2',
    't': '3', 'd': '3', 's': '3', 'z': '3',
    'c': '4', 'j': '4', 'x': '4',
    'm': '5', 'n': '5',
    'l': '6', 'r': '6',
    'h': '7',
    'w': '8'
  };
  
  // Keep first character
  let code = normalized[0];
  let lastCode = charMap[normalized[0]] || '0';
  
  // Encode remaining characters
  for (let i = 1; i < normalized.length; i++) {
    const currentCode = charMap[normalized[i]] || '0';
    
    // Skip consecutive duplicates
    if (currentCode !== lastCode && currentCode !== '0') {
      code += currentCode;
    }
    lastCode = currentCode;
  }
  
  // Pad to length 5
  code = (code + '00000').substring(0, 5);
  return code;
};
```

**Examples:**

```
indicSoundex("Riyaz")
→ Normalize: "riyaz"
→ Codes: r(6) i(0) y(0) a(0) z(3)
→ Keep first: "R"
→ Process rest: R + 6 (from i/y/a skip) + 3 (from z)
→ Wait, let me trace through the algorithm...

Actually:
- Position 0: 'r' → keep as 'R', lastCode = '6'
- Position 1: 'i' → code = '0', skip (vowel)
- Position 2: 'y' → code = '0', skip (vowel)
- Position 3: 'a' → code = '0', skip (vowel)
- Position 4: 'z' → code = '3', lastCode was '0', add it
→ Result: "R3000"

indicSoundex("Riaz")
→ Normalize: "riaz"
- Position 0: 'r' → 'R', lastCode = '6'
- Position 1: 'i' → '0', skip
- Position 2: 'a' → '0', skip
- Position 3: 'z' → '3', add it
→ Result: "R3000"

Both map to "R3000"! ✓ Phonetic matching works!
```

**Concept 4: Weighted Hybrid Matching**

Real-world usage requires balancing both approaches:

```
Score = (w₁ × levenshtein_score) + (w₂ × phonetic_score)

where:
- w₁ = weight for string similarity (default: 0.4)
- w₂ = weight for phonetic similarity (default: 0.6)
- Both scores normalized to 0-1 range

For Indian names, phonetic should be weighted higher
because names that sound the same are more likely
to be matches than names that are spelled similarly.
```

**Example comparison:**

```
Query: "Riyaz"
Candidates: ["Riaz", "Riyash", "Rizwan", "Rahul"]

Query phonetic code: R3000 (riyaz → soundex)

Candidate 1: "Riaz"
  - Levenshtein: 1 (edit distance)
  - Phonetic: 0 (both map to R3000)
  - Combined: 0.4 × (5-1)/5 + 0.6 × 1.0 = 0.32 + 0.6 = 0.92

Candidate 2: "Riyash"
  - Levenshtein: 1 (one character different)
  - Phonetic: close but not identical
  - Combined: moderate score

Candidate 3: "Rizwan"
  - Levenshtein: 3
  - Phonetic: similar start
  - Combined: lower score

Candidate 4: "Rahul"
  - Levenshtein: 4
  - Phonetic: different
  - Combined: lowest score
```

---

## Part 2: Architecture & Design

### 2.1 Core Architecture Overview

**Layered Design Pattern:**

```
┌─────────────────────────────────────────┐
│         Public API Layer                │
│  (search, searchOne, searchMany)        │
├─────────────────────────────────────────┤
│    Search Engine & Scoring Layer        │
│  (ranking, filtering, caching)          │
├─────────────────────────────────────────┤
│    Matching Algorithms Layer            │
│  (levenshtein, phonetic, hybrid)        │
├─────────────────────────────────────────┤
│    Tokenization & Normalization Layer   │
│  (cleaning, splitting, normalization)   │
├─────────────────────────────────────────┤
│         Data Structure Layer            │
│  (indexing, caching, storage)           │
└─────────────────────────────────────────┘
```

### 2.2 Core Components

#### A. Normalizer Module
**Responsibility:** Clean and prepare input for matching

```typescript
interface NormalizeOptions {
  preserveCase: boolean;
  removeDiacritics: boolean;
  removeHyphen: boolean;
  removeTitles: boolean;
}

class Normalizer {
  normalize(input: string, options: NormalizeOptions): string
  tokenize(input: string): string[]
  removeTitles(input: string): string
  normalizeSeparators(input: string): string
}
```

**Functionality:**
- Remove titles: "Dr. Raj Kumar" → "Raj Kumar"
- Normalize spaces: "Raj  Kumar" → "Raj Kumar"
- Remove special characters: "Raj-Kumar" → "Raj Kumar" (optional)
- Lowercase conversion
- Diacritic removal (if any Hindi characters slip in)

#### B. Phonetic Module
**Responsibility:** Generate phonetic codes for names

```typescript
interface PhoneticOptions {
  algorithm: 'indic-soundex' | 'metaphone' | 'custom';
  caseSensitive: boolean;
  normalizeLongVowels: boolean;
}

class PhoneticMatcher {
  encode(name: string): string
  compare(name1: string, name2: string): number // 0-1 similarity score
  isSimilar(name1: string, name2: string, threshold?: number): boolean
}
```

**Algorithms to implement:**
1. **IndicSoundex** (primary): For Indian name phonetics
2. **Metaphone** (secondary): General English phonetics
3. **Custom algorithm**: Specialized for common Indian name patterns

#### C. Distance Module
**Responsibility:** Calculate string similarity

```typescript
interface DistanceOptions {
  maxDistance?: number; // Early termination optimization
  caseSensitive: boolean;
  algorithm: 'levenshtein' | 'jaro-winkler' | 'damerau-levenshtein';
}

class DistanceMatcher {
  distance(str1: string, str2: string): number
  similarity(str1: string, str2: string): number // 0-1
  isSimilar(str1: string, str2: string, threshold: number): boolean
}
```

**Algorithms:**
1. **Levenshtein** (primary): For direct spelling matching
2. **Damerau-Levenshtein**: Handles transpositions ("ae" vs "ea")
3. **Jaro-Winkler**: Weights matches based on position

#### D. Scoring Module
**Responsibility:** Combine different matching strategies

```typescript
interface ScoringWeights {
  phonetic: number;        // Default: 0.6
  levenshtein: number;     // Default: 0.4
  sequenceBonus: number;   // Default: 0.1
  prefixBonus: number;     // Default: 0.05
  exactMatchBonus: number; // Default: 0.2
}

interface ScoreResult {
  score: number;           // 0-1
  breakdown: {
    phonetic: number;
    levenshtein: number;
    bonuses: { [key: string]: number };
  };
}

class Scorer {
  score(
    query: string,
    candidate: string,
    weights: ScoringWeights
  ): ScoreResult
  
  normalizeScore(rawScore: number, min: number, max: number): number
}
```

**Scoring Logic:**

```typescript
// Pseudo-code for hybrid scoring
function score(query: string, candidate: string, weights: ScoringWeights): number {
  // Base scores
  const phoneticScore = phonetic.compare(query, candidate);
  const levenScore = 1 - (distance.distance(query, candidate) / Math.max(query.length, candidate.length));
  
  // Bonuses
  let bonus = 0;
  
  // Prefix bonus: reward matching starts
  if (candidate.startsWith(query)) bonus += weights.prefixBonus;
  
  // Exact match bonus
  if (query === candidate) bonus += weights.exactMatchBonus;
  
  // Sequence bonus: reward consecutive matching characters
  const matchSequence = countConsecutiveMatches(query, candidate);
  bonus += weights.sequenceBonus * (matchSequence / query.length);
  
  // Combined score
  const combined = (weights.phonetic * phoneticScore) + (weights.levenshtein * levenScore);
  return Math.min(1, combined + bonus);
}
```

#### E. Index & Cache Module
**Responsibility:** Optimize repeated searches

```typescript
interface IndexEntry {
  original: string;
  normalized: string;
  phonetic: string;
  tokens: string[];
  metadata?: any;
}

class SearchIndex {
  addEntry(value: string, metadata?: any): void
  addEntries(values: string[]): void
  clear(): void
  
  // For search optimization
  getPhoneticMatches(query: string): IndexEntry[]
  getPrefixMatches(query: string): IndexEntry[]
  getTokenMatches(query: string): IndexEntry[]
}

class ResultCache {
  set(query: string, results: SearchResult[]): void
  get(query: string): SearchResult[] | null
  clear(): void
}
```

#### F. Search Engine Module
**Responsibility:** Orchestrate the search process

```typescript
interface SearchOptions {
  keys?: string[];                    // For nested objects
  threshold?: number;                 // Min score (0-1)
  limit?: number;                     // Max results
  includeScore?: boolean;             // Include scoring breakdown
  includeMatches?: boolean;           // Include match positions
  shouldSort?: boolean;               // Sort by score
  weights?: ScoringWeights;
  useIndex?: boolean;                 // Use caching
  searchPath?: 'exact' | 'prefix' | 'fuzzy' | 'auto'; // Search type
}

interface SearchResult<T> {
  item: T;
  score: number;
  matches?: MatchInfo[];
  ranking?: number;
}

class SearchEngine<T> {
  constructor(dataset: T[], options?: SearchOptions)
  
  search(query: string): SearchResult<T>[]
  searchOne(query: string): SearchResult<T> | null
  searchMany(queries: string[]): SearchResult<T>[][]
  
  update(dataset: T[]): void
  setOptions(options: Partial<SearchOptions>): void
}
```

### 2.3 Data Type Support

**The library should handle:**

```typescript
// 1. Simple arrays of strings
const names = ["Rajesh", "Riyaz", "Rahul"];
const result = searcher.search("Riyaz");

// 2. Arrays of objects
const people = [
  { name: "Rajesh Kumar", age: 30 },
  { name: "Riyaz Ali", age: 25 }
];
const result = searcher.search("Riyaz", { keys: ["name"] });

// 3. Nested objects
const records = [
  {
    person: {
      firstName: "Rajesh",
      lastName: "Kumar"
    },
    occupation: "Engineer"
  }
];
const result = searcher.search("Rajesh", { 
  keys: ["person.firstName", "person.lastName"] 
});

// 4. Multiple fields combined
const result = searcher.search("Raj Kumar", { 
  keys: [
    { name: "firstName", weight: 0.7 },
    { name: "lastName", weight: 0.3 }
  ] 
});

// 5. Custom object extractors
const result = searcher.search("Raj Kumar", {
  keys: [(item) => `${item.firstName} ${item.lastName}`]
});
```

### 2.4 Search Strategies

The library should support different search strategies:

**1. Exact Match** (fastest)
```typescript
Exact string equality
Useful for: Prefixes, complete names
```

**2. Prefix Match** (fast)
```typescript
Candidate starts with query
"Ra" matches "Rajesh"
Useful for: Autocomplete, typeahead
```

**3. Fuzzy Match** (balanced)
```typescript
Levenshtein + Phonetic hybrid
Default mode for name matching
```

**4. Phonetic Match** (specialized)
```typescript
Only phonetic similarity
For: Finding sound-alikes regardless of spelling
```

**5. Token Match** (structured)
```typescript
Full-name matching with tokenization
"Raj Kumar" matches {"firstName": "Raj", "lastName": "Kumar"}
```

---

## Part 3: Implementation Roadmap

### Phase 1: Core Algorithms (Week 1-2)

**Goals:**
- Implement base algorithms
- Build unit tests
- Validate against Indian name datasets

**Tasks:**

1. **Levenshtein Distance**
   - Implement basic O(mn) version
   - Implement optimized O(min(m,n)) version
   - Add bounded distance optimization
   - Benchmark and document

2. **IndicSoundex**
   - Create character-to-phoneme mapping for English romanization
   - Implement vowel normalization
   - Implement consonant grouping
   - Handle edge cases (single letters, repeated consonants)
   - Test against phonetically similar pairs

3. **Unit Tests**
   - Test with Indian name pairs
   - Test edge cases (empty strings, special characters)
   - Performance benchmarks

**Files:**
```
src/
├── algorithms/
│   ├── levenshtein.ts
│   ├── soundex.ts
│   └── __tests__/
│       ├── levenshtein.test.ts
│       └── soundex.test.ts
```

### Phase 2: Normalization & Preprocessing (Week 2-3)

**Goals:**
- Handle diverse input formats
- Clean data efficiently
- Support internationalization

**Tasks:**

1. **Normalizer Class**
   - Remove titles and honorifics
   - Handle punctuation
   - Normalize whitespace
   - Case handling

2. **Tokenizer**
   - Split full names into components
   - Handle compound names
   - Preserve metadata about token positions

3. **Input Validation**
   - Type checking
   - Data structure validation
   - Error handling

**Files:**
```
src/
├── core/
│   ├── normalizer.ts
│   ├── tokenizer.ts
│   └── validator.ts
```

### Phase 3: Scoring & Matching (Week 3-4)

**Goals:**
- Implement hybrid scoring
- Create flexible matching strategies
- Enable customization

**Tasks:**

1. **Phonetic Matcher**
   - Wrap IndicSoundex
   - Compute phonetic similarity scores
   - Cache phonetic codes

2. **Distance Matcher**
   - Wrap Levenshtein variants
   - Normalize scores to 0-1
   - Support different algorithms

3. **Scorer**
   - Implement weighted hybrid scoring
   - Add bonuses (prefix, exact match, sequence)
   - Provide score breakdowns

4. **Matching Strategies**
   - Exact, Prefix, Fuzzy, Phonetic, Token
   - Strategy selector logic

**Files:**
```
src/
├── matchers/
│   ├── phonetic.ts
│   ├── distance.ts
│   ├── strategies/
│   │   ├── exact.ts
│   │   ├── prefix.ts
│   │   ├── fuzzy.ts
│   │   └── phonetic.ts
│   └── scorer.ts
```

### Phase 4: Indexing & Caching (Week 4-5)

**Goals:**
- Optimize repeated searches
- Support large datasets
- Enable real-time search

**Tasks:**

1. **Search Index**
   - Build indexes for normalized names
   - Build phonetic code index
   - Build prefix trees for autocomplete

2. **Result Cache**
   - Implement LRU cache
   - Cache invalidation strategy
   - Memory management

3. **Performance Optimization**
   - Lazy evaluation
   - Early termination with bounds
   - Parallel processing (if applicable)

**Files:**
```
src/
├── indexing/
│   ├── index.ts
│   ├── cache.ts
│   └── trie.ts
```

### Phase 5: Search Engine & API (Week 5-6)

**Goals:**
- Create user-friendly API
- Support multiple data types
- Provide configuration options

**Tasks:**

1. **SearchEngine Class**
   - Data loading and validation
   - Search method orchestration
   - Result ranking and filtering

2. **Public API**
   - `search(query, options)` - search for matches
   - `searchOne(query)` - get best match
   - `searchMany(queries)` - batch search
   - `update(data)` - update dataset

3. **Configuration Management**
   - Default options
   - Per-search options
   - Global settings

**Files:**
```
src/
├── search-engine.ts
├── types.ts
└── index.ts (main export)
```

### Phase 6: Testing & Documentation (Week 6-7)

**Goals:**
- Comprehensive test coverage
- Clear documentation
- Performance benchmarks

**Tasks:**

1. **Unit Tests**
   - All modules covered
   - Edge cases
   - Error scenarios

2. **Integration Tests**
   - End-to-end search scenarios
   - Data type variations
   - Configuration combinations

3. **Performance Tests**
   - Benchmark against dataset sizes
   - Compare with FuseJS
   - Memory profiling

4. **Documentation**
   - API documentation
   - Usage examples
   - Best practices guide
   - Architecture document

**Files:**
```
tests/
├── unit/
├── integration/
└── performance/

docs/
├── API.md
├── GUIDE.md
├── EXAMPLES.md
└── ARCHITECTURE.md
```

### Phase 7: Advanced Features (Week 7-8)

**Goals:**
- Production-ready features
- Developer experience
- Ecosystem integration

**Tasks:**

1. **Advanced Features**
   - Batch processing
   - Streaming results
   - Custom distance functions
   - Plugin system

2. **Developer Experience**
   - TypeScript types
   - JSDoc comments
   - IDE intellisense
   - Error messages

3. **Ecosystem Support**
   - React hooks
   - Vue directives
   - Express middleware
   - GraphQL integration

4. **Build & Distribution**
   - Bundle optimization
   - Multiple formats (ESM, CJS, UMD)
   - Tree-shaking support
   - Minification

---

## Part 4: Detailed Implementation Guide

### 4.1 Setting Up the Project

```bash
# Initialize TypeScript project
mkdir indian-names-fuzzy
cd indian-names-fuzzy

npm init -y
npm install --save-dev typescript ts-node @types/node
npm install --save-dev vitest @vitest/ui
npm install --save-dev prettier eslint
npm install --save-dev esbuild tsup

# Create structure
mkdir src tests docs
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["tests", "node_modules"]
}
```

### 4.2 Building the Levenshtein Distance Algorithm

```typescript
// src/algorithms/levenshtein.ts

export interface LevenshteinOptions {
  maxDistance?: number;
  caseSensitive?: boolean;
}

/**
 * Calculate the Levenshtein distance between two strings
 * Optimized to use O(min(m, n)) space
 * 
 * @param source - First string
 * @param target - Second string
 * @param options - Algorithm options
 * @returns The Levenshtein distance
 * 
 * @example
 * levenshtein("kitten", "sitting"); // 3
 * levenshtein("Rajesh", "Raj"); // 3
 */
export function levenshtein(
  source: string,
  target: string,
  options: LevenshteinOptions = {}
): number {
  const { maxDistance = Infinity, caseSensitive = false } = options;
  
  // Normalize strings
  let src = caseSensitive ? source : source.toLowerCase();
  let tgt = caseSensitive ? target : target.toLowerCase();
  
  // Handle empty strings
  if (src.length === 0) return tgt.length;
  if (tgt.length === 0) return src.length;
  
  // Early exit if difference is too large
  if (Math.abs(src.length - tgt.length) > maxDistance) {
    return maxDistance + 1;
  }
  
  // Ensure src is shorter for space optimization
  if (src.length > tgt.length) {
    [src, tgt] = [tgt, src];
  }
  
  const srcLen = src.length;
  const tgtLen = tgt.length;
  
  // Initialize previous row
  let prev = Array.from({ length: tgtLen + 1 }, (_, i) => i);
  let curr = new Array(tgtLen + 1);
  
  // Fill the matrix row by row
  for (let i = 1; i <= srcLen; i++) {
    curr[0] = i;
    let minVal = i;
    
    for (let j = 1; j <= tgtLen; j++) {
      const cost = src[i - 1] === tgt[j - 1] ? 0 : 1;
      
      curr[j] = Math.min(
        curr[j - 1] + 1,      // insertion
        prev[j] + 1,          // deletion
        prev[j - 1] + cost    // substitution
      );
      
      minVal = Math.min(minVal, curr[j]);
    }
    
    // Early termination if all values exceed max
    if (minVal > maxDistance) {
      return maxDistance + 1;
    }
    
    // Swap rows
    [prev, curr] = [curr, prev];
  }
  
  return prev[tgtLen];
}

/**
 * Calculate normalized similarity (0-1) from Levenshtein distance
 * 
 * @param source - First string
 * @param target - Second string
 * @returns Similarity score from 0 (completely different) to 1 (identical)
 */
export function levenshteinSimilarity(
  source: string,
  target: string,
  options: LevenshteinOptions = {}
): number {
  const distance = levenshtein(source, target, options);
  const maxLen = Math.max(source.length, target.length);
  
  if (maxLen === 0) return 1; // Both empty strings
  
  return 1 - distance / maxLen;
}

/**
 * Check if two strings are similar within a threshold
 */
export function isSimilarLevenshtein(
  source: string,
  target: string,
  threshold: number = 0.7,
  options: LevenshteinOptions = {}
): boolean {
  return levenshteinSimilarity(source, target, options) >= threshold;
}
```

### 4.3 Building the IndicSoundex Algorithm

```typescript
// src/algorithms/soundex.ts

export interface SoundexOptions {
  caseSensitive?: boolean;
  padLength?: number;
  removeVowels?: boolean;
}

/**
 * Character mapping for IndicSoundex
 * Maps English romanization of Indian names to phonetic codes
 * Based on sound families (articulatory phonetics)
 */
const CHAR_MAP: { [key: string]: string } = {
  // Vowels and semi-vowels (0 = vowel sound, ignored in encoding)
  'a': '0', 'e': '0', 'i': '0', 'o': '0', 'u': '0',
  'y': '0', 'w': '0', 'h': '0',
  
  // Bilabial (p, b, v, f) → 1
  'p': '1', 'b': '1', 'f': '1', 'v': '1', 'm': '1',
  
  // Velar (k, g, q) → 2
  'k': '2', 'g': '2', 'q': '2',
  
  // Dental/Alveolar (t, d, s, z) → 3
  't': '3', 'd': '3', 's': '3', 'z': '3', 'n': '3',
  
  // Palatal (c, j, ch, x) → 4
  'c': '4', 'j': '4', 'x': '4',
  
  // Lateral/Rhotic (l, r) → 5
  'l': '5', 'r': '5',
  
  // Fricatives (sh, zh) → 6
  // Note: Need special handling for 'sh' combination
  
  // Default for unmapped characters
};

/**
 * Generate IndicSoundex code for an Indian name
 * 
 * Algorithm:
 * 1. Normalize input (lowercase, remove non-alphabetic)
 * 2. Keep first character as-is
 * 3. Encode remaining characters using phonetic map
 * 4. Remove consecutive duplicate codes
 * 5. Remove vowel codes (0s)
 * 6. Pad to fixed length
 * 
 * @example
 * indicSoundex("Riyaz") // "R3000"
 * indicSoundex("Riaz")  // "R3000"
 * indicSoundex("Rajesh") // "R4300"
 */
export function indicSoundex(
  name: string,
  options: SoundexOptions = {}
): string {
  const { caseSensitive = false, padLength = 5 } = options;
  
  // Normalize input
  let normalized = caseSensitive ? name : name.toLowerCase();
  normalized = normalized.replace(/[^a-z]/g, '');
  
  if (normalized.length === 0) return '';
  
  // Keep first character
  let code = normalized[0].toUpperCase();
  let lastCode = CHAR_MAP[normalized[0]] || '0';
  
  // Encode remaining characters
  for (let i = 1; i < normalized.length; i++) {
    const char = normalized[i];
    
    // Special handling for 'sh', 'ch', 'th' combinations
    if (i < normalized.length - 1) {
      const twoChar = char + normalized[i + 1];
      if (twoChar === 'sh' || twoChar === 'ch' || twoChar === 'th') {
        const combinedCode = mapCombination(twoChar);
        if (combinedCode !== '0' && combinedCode !== lastCode) {
          code += combinedCode;
          lastCode = combinedCode;
          i++; // Skip next character since we processed it
          continue;
        }
      }
    }
    
    const charCode = CHAR_MAP[char] || '0';
    
    // Add to code if it's not a vowel and not a duplicate
    if (charCode !== '0' && charCode !== lastCode) {
      code += charCode;
    }
    
    lastCode = charCode;
  }
  
  // Remove vowel markers and pad
  code = code.replace(/0/g, '');
  
  // Pad to required length
  while (code.length < padLength) {
    code += '0';
  }
  
  return code.substring(0, padLength);
}

/**
 * Map two-character combinations to codes
 */
function mapCombination(combo: string): string {
  const combinationMap: { [key: string]: string } = {
    'sh': '6', 'ch': '4', 'th': '3', 'ph': '1',
    'gh': '2', 'dh': '3', 'kh': '2', 'ng': '5'
  };
  
  return combinationMap[combo] || '0';
}

/**
 * Compare two names using IndicSoundex
 * Returns similarity score 0-1
 */
export function soundexSimilarity(
  name1: string,
  name2: string,
  options: SoundexOptions = {}
): number {
  const code1 = indicSoundex(name1, options);
  const code2 = indicSoundex(name2, options);
  
  if (code1 === code2) return 1.0; // Same phonetic code
  
  // If first characters differ, phonetically very different
  if (code1[0] !== code2[0]) return 0.0;
  
  // Partial match based on common code parts
  let matches = 0;
  for (let i = 0; i < Math.min(code1.length, code2.length); i++) {
    if (code1[i] === code2[i]) matches++;
  }
  
  return matches / Math.max(code1.length, code2.length);
}

/**
 * Check if two names sound similar
 */
export function isSimilarSoundex(
  name1: string,
  name2: string,
  threshold: number = 0.7,
  options: SoundexOptions = {}
): boolean {
  return soundexSimilarity(name1, name2, options) >= threshold;
}
```

### 4.4 Building the Normalizer

```typescript
// src/core/normalizer.ts

export interface NormalizeOptions {
  preserveCase?: boolean;
  removeDiacritics?: boolean;
  removeTitles?: boolean;
  normalizeWhitespace?: boolean;
  removeSpecialChars?: boolean;
}

const COMMON_TITLES = [
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sir', 'madam',
  'shri', 'smt', 'sri', 'bhagwan', 'maharaj',
  'jr', 'sr', 'ii', 'iii', 'iv', 'v'
];

const DIACRITIC_MAP: { [key: string]: string } = {
  'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a',
  'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
  'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
  'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o',
  'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u'
};

export class Normalizer {
  normalize(
    input: string,
    options: NormalizeOptions = {}
  ): string {
    const {
      preserveCase = false,
      removeDiacritics = true,
      removeTitles = true,
      normalizeWhitespace = true,
      removeSpecialChars = true
    } = options;
    
    let result = input;
    
    // Remove titles and honorifics
    if (removeTitles) {
      result = this.removeTitles(result);
    }
    
    // Handle diacritics
    if (removeDiacritics) {
      result = this.removeDiacritics(result);
    }
    
    // Normalize whitespace
    if (normalizeWhitespace) {
      result = result.trim().replace(/\s+/g, ' ');
    }
    
    // Remove special characters (except spaces)
    if (removeSpecialChars) {
      result = result.replace(/[^\w\s]/g, '');
    }
    
    // Case normalization
    if (!preserveCase) {
      result = result.toLowerCase();
    }
    
    return result;
  }
  
  private removeTitles(input: string): string {
    const words = input.split(/\s+/);
    return words
      .filter(word => !COMMON_TITLES.includes(word.toLowerCase()))
      .join(' ')
      .trim();
  }
  
  private removeDiacritics(input: string): string {
    return input.split('').map(char => {
      return DIACRITIC_MAP[char] || char;
    }).join('');
  }
  
  tokenize(input: string): string[] {
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
}
```

### 4.5 Building the Scorer

```typescript
// src/scoring/scorer.ts

import { levenshteinSimilarity } from '../algorithms/levenshtein';
import { soundexSimilarity } from '../algorithms/soundex';

export interface ScoringWeights {
  phonetic?: number;        // Default: 0.6
  levenshtein?: number;     // Default: 0.4
  prefixBonus?: number;     // Default: 0.05
  exactMatchBonus?: number; // Default: 0.15
  sequenceBonus?: number;   // Default: 0.05
}

export interface ScoreBreakdown {
  baseScore: number;
  phoneticScore: number;
  levenScore: number;
  bonuses: { [key: string]: number };
  finalScore: number;
}

export class Scorer {
  private defaultWeights: Required<ScoringWeights> = {
    phonetic: 0.6,
    levenshtein: 0.4,
    prefixBonus: 0.05,
    exactMatchBonus: 0.15,
    sequenceBonus: 0.05
  };
  
  score(
    query: string,
    candidate: string,
    weights: ScoringWeights = {}
  ): ScoreBreakdown {
    const w = { ...this.defaultWeights, ...weights };
    
    // Normalize inputs
    const q = query.toLowerCase();
    const c = candidate.toLowerCase();
    
    // Exact match shortcut
    if (q === c) {
      return {
        baseScore: 1.0,
        phoneticScore: 1.0,
        levenScore: 1.0,
        bonuses: { exactMatch: w.exactMatchBonus },
        finalScore: 1.0
      };
    }
    
    // Calculate base scores
    const phoneticScore = soundexSimilarity(q, c);
    const levenScore = levenshteinSimilarity(q, c);
    const baseScore = (w.phonetic * phoneticScore) + (w.levenshtein * levenScore);
    
    // Calculate bonuses
    const bonuses: { [key: string]: number } = {};
    
    if (c.startsWith(q)) {
      bonuses.prefix = w.prefixBonus;
    }
    
    if (q === c) {
      bonuses.exactMatch = w.exactMatchBonus;
    }
    
    const sequenceScore = this.getSequenceBonus(q, c);
    if (sequenceScore > 0) {
      bonuses.sequence = w.sequenceBonus * sequenceScore;
    }
    
    const totalBonus = Object.values(bonuses).reduce((a, b) => a + b, 0);
    const finalScore = Math.min(1.0, baseScore + totalBonus);
    
    return {
      baseScore,
      phoneticScore,
      levenScore,
      bonuses,
      finalScore
    };
  }
  
  private getSequenceBonus(query: string, candidate: string): number {
    // Count how many characters appear in order
    let qIdx = 0;
    let matches = 0;
    
    for (let i = 0; i < candidate.length && qIdx < query.length; i++) {
      if (candidate[i] === query[qIdx]) {
        matches++;
        qIdx++;
      }
    }
    
    return qIdx === query.length ? matches / query.length : 0;
  }
}
```

### 4.6 Building the Search Engine

```typescript
// src/search-engine.ts

import { Normalizer } from './core/normalizer';
import { Scorer, ScoringWeights } from './scoring/scorer';

export interface SearchOptions {
  keys?: string[];
  threshold?: number;
  limit?: number;
  includeScore?: boolean;
  shouldSort?: boolean;
  weights?: ScoringWeights;
  caseSensitive?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  refIndex: number;
}

export class SearchEngine<T> {
  private dataset: T[];
  private normalizer: Normalizer;
  private scorer: Scorer;
  private options: SearchOptions;
  
  constructor(dataset: T[], options: SearchOptions = {}) {
    this.dataset = Array.isArray(dataset) ? dataset : [dataset];
    this.normalizer = new Normalizer();
    this.scorer = new Scorer();
    this.options = {
      threshold: 0.3,
      limit: Infinity,
      includeScore: true,
      shouldSort: true,
      caseSensitive: false,
      ...options
    };
  }
  
  search(query: string): SearchResult<T>[] {
    const normalizedQuery = this.normalizer.normalize(query);
    
    const results: SearchResult<T>[] = [];
    
    for (let i = 0; i < this.dataset.length; i++) {
      const item = this.dataset[i];
      const candidates = this.extractSearchText(item);
      
      let maxScore = 0;
      
      for (const candidate of candidates) {
        const normalizedCandidate = this.normalizer.normalize(candidate);
        const breakdown = this.scorer.score(normalizedQuery, normalizedCandidate);
        maxScore = Math.max(maxScore, breakdown.finalScore);
      }
      
      if (maxScore >= (this.options.threshold || 0)) {
        results.push({
          item,
          score: maxScore,
          refIndex: i
        });
      }
    }
    
    // Sort and limit results
    if (this.options.shouldSort) {
      results.sort((a, b) => b.score - a.score);
    }
    
    return results.slice(0, this.options.limit);
  }
  
  searchOne(query: string): SearchResult<T> | null {
    const results = this.search(query);
    return results.length > 0 ? results[0] : null;
  }
  
  private extractSearchText(item: T): string[] {
    if (typeof item === 'string') {
      return [item];
    }
    
    if (typeof item !== 'object' || item === null) {
      return [String(item)];
    }
    
    const { keys } = this.options;
    
    if (!keys || keys.length === 0) {
      return this.flattenObject(item);
    }
    
    const texts: string[] = [];
    
    for (const key of keys) {
      const value = this.getNestedValue(item, key);
      if (value) {
        texts.push(String(value));
      }
    }
    
    return texts;
  }
  
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }
    
    return current;
  }
  
  private flattenObject(obj: any): string[] {
    const texts: string[] = [];
    
    const traverse = (val: any) => {
      if (typeof val === 'string') {
        texts.push(val);
      } else if (typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
          val.forEach(traverse);
        } else {
          Object.values(val).forEach(traverse);
        }
      }
    };
    
    traverse(obj);
    return texts;
  }
}
```

---

## Part 5: Best Practices & Optimization

### 5.1 Performance Optimization Techniques

**1. Early Termination**
```typescript
// For Levenshtein distance
if (Math.abs(source.length - target.length) > maxDistance) {
  return maxDistance + 1; // Exit early
}
```

**2. Memoization/Caching**
```typescript
const cache = new Map<string, ScoreResult>();

function scoreWithCache(q: string, c: string): ScoreResult {
  const key = `${q}|${c}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  
  const result = score(q, c);
  cache.set(key, result);
  return result;
}
```

**3. Indexing for Large Datasets**
```typescript
// Pre-compute phonetic codes
const phoneticsIndex = new Map(
  dataset.map(item => [
    item,
    indicSoundex(item)
  ])
);

// Filter candidates by first character
function getCandidatesByPhonetic(query: string): Item[] {
  const queryCode = indicSoundex(query);
  return dataset.filter(item =>
    phoneticsIndex.get(item)?.[0] === queryCode[0]
  );
}
```

**4. Bounded Distance for Levenshtein**
```typescript
// Only compute values in diagonal stripe
function levDistBounded(s1: string, s2: string, k: number): number {
  if (Math.abs(s1.length - s2.length) > k) return Infinity;
  
  // Only process cells within distance k from diagonal
  // Reduces computation significantly
}
```

**5. Parallel Processing**
```typescript
async function searchParallel(
  query: string,
  workers: number = 4
): Promise<SearchResult<T>[]> {
  // Divide dataset into chunks
  // Process each chunk in parallel worker
  // Merge results
}
```

### 5.2 Handling Edge Cases

**Empty Inputs**
```typescript
if (!query || query.trim().length === 0) {
  return [];
}
```

**Single Character Names**
```typescript
const isSingleChar = (name: string) => name.trim().length === 1;
if (isSingleChar(query) && isSingleChar(candidate)) {
  return query.toLowerCase() === candidate.toLowerCase() ? 1 : 0;
}
```

**Very Long Names**
```typescript
if (name.length > 100) {
  // Consider tokenizing and searching by parts
  const tokens = tokenize(name);
  // Search each token separately
}
```

**Special Characters**
```typescript
const normalized = input
  .replace(/['-]/g, '') // Remove hyphens, apostrophes
  .replace(/\s+/g, ' ') // Normalize spaces
  .toLowerCase();
```

### 5.3 Testing Strategy

**Test Categories:**

1. **Unit Tests**: Individual algorithm tests
```typescript
describe('IndicSoundex', () => {
  it('should produce same code for phonetically identical names', () => {
    expect(indicSoundex('Riyaz')).toBe(indicSoundex('Riaz'));
  });
});
```

2. **Integration Tests**: Full search pipeline
```typescript
describe('SearchEngine', () => {
  it('should find phonetically similar names', () => {
    const engine = new SearchEngine(['Riyaz', 'Riaz', 'Rizwan']);
    const results = engine.search('Riyaz');
    expect(results[0].item).toBe('Riyaz');
  });
});
```

3. **Performance Tests**: Benchmark against FuseJS
```typescript
describe('Performance', () => {
  it('should search 10k names in < 100ms', () => {
    const start = Date.now();
    engine.search('Raj');
    expect(Date.now() - start).toBeLessThan(100);
  });
});
```

4. **Real-world Dataset Tests**
```typescript
// Test against actual Indian name databases
const indianNames = loadDataset('indian-names-100k.json');
const results = engine.search('Rajesh');
// Verify results make sense
```

---

## Part 6: API Reference & Usage Examples

### 6.1 Basic Usage

```typescript
import { SearchEngine } from 'indian-names-fuzzy';

// Simple string array
const names = ['Rajesh Kumar', 'Riyaz Ali', 'Rahul Sharma'];
const engine = new SearchEngine(names);

const results = engine.search('Riyaz');
// Returns: [
//   { item: 'Riyaz Ali', score: 0.98, refIndex: 1 }
// ]
```

### 6.2 Advanced Usage

```typescript
// Search in object arrays
const people = [
  { firstName: 'Rajesh', lastName: 'Kumar' },
  { firstName: 'Riyaz', lastName: 'Ali' }
];

const engine = new SearchEngine(people, {
  keys: ['firstName', 'lastName'],
  threshold: 0.5,
  limit: 10
});

const results = engine.search('Riyaz');
```

### 6.3 Custom Scoring

```typescript
const engine = new SearchEngine(names, {
  weights: {
    phonetic: 0.7,      // Emphasize phonetic similarity
    levenshtein: 0.3,
    prefixBonus: 0.1
  }
});
```

---

## Conclusion

This comprehensive plan provides a structured approach to building a production-ready, optimized fuzzy search library specifically designed for Indian names. By understanding the underlying algorithms and implementing them carefully, you'll create a tool that's both powerful and maintainable.

The key to success lies in:
1. **Understanding the phonetic challenges** of Indian names
2. **Implementing efficient algorithms** with proper optimizations
3. **Testing thoroughly** with real Indian name datasets
4. **Providing a clean API** that's easy to use yet highly customizable

This library will serve as a foundation for accurate name matching in databases, customer systems, and any application dealing with Indian names.

---

## References & Further Learning

### Phonetic Matching
- [LibIndic Soundex Documentation](https://libindic.org/)
- "Phonetic Comparison Algorithm for Indian Languages" - Santhosh Thottingal
- [Microsoft Research on Phonetic Matching](https://www.microsoft.com/en-us/research/)

### String Similarity
- Levenshtein Distance: https://en.wikipedia.org/wiki/Levenshtein_distance
- Jaro-Winkler Distance: https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance

### Search Library Design
- [FuseJS GitHub](https://github.com/krisk/Fuse)
- [ElasticSearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

### Indian Name Challenges
- "Fuzzy Name Conversion of Hindi Names in Police Records" - TEAM SMAASH
- [Indian Namematch PyPI Package](https://pypi.org/project/indian-namematch/)
