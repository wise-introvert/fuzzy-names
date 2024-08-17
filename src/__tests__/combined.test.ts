import {
  type LevDistance,
  type NameParts,
  type CalculatePhoneticsMetricOptions,
  calculateLevenshteinDistance,
  calculateMatchMetric,
  calculatePhoneticMetric,
  normalizeName,
  search,
  splitNameIntoParts,
} from "..";

describe("calculateLevenshteinDistance", () => {
  it("should calculate correct Levenshtein distance for similar names", () => {
    const result = calculateLevenshteinDistance("John Doe", "Jon Doe");
    expect(result).toEqual({
      firstName: 1,
      lastName: 0,
      middleName: 0,
      total: 1,
    });
  });

  it("should calculate correct Levenshtein distance for different names", () => {
    const result = calculateLevenshteinDistance("Alice Smith", "Bob Johnson");
    expect(result).toEqual({
      firstName: 5,
      lastName: 7,
      middleName: 0,
      total: 12,
    });
  });

  it("calculates distance for identical names", () => {
    const result: LevDistance = calculateLevenshteinDistance(
      "John Doe",
      "John Doe",
    );
    expect(result).toEqual({
      firstName: 0,
      lastName: 0,
      middleName: 0,
      total: 0,
    });
  });

  it("calculates distance for completely different names", () => {
    const result: LevDistance = calculateLevenshteinDistance(
      "John Doe",
      "Jane Smith",
    );
    expect(result).toEqual({
      firstName: 3,
      lastName: 5,
      middleName: 0,
      total: 8,
    });
  });

  it("calculates distance for names with different middle names", () => {
    const result: LevDistance = calculateLevenshteinDistance(
      "John A Doe",
      "John B Doe",
    );
    expect(result).toEqual({
      firstName: 0,
      lastName: 0,
      middleName: 1,
      total: 1,
    });
  });

  it("calculates distance for names with multiple middle names", () => {
    const result: LevDistance = calculateLevenshteinDistance(
      "John A B Doe",
      "John C D Doe",
    );
    expect(result).toEqual({
      firstName: 0,
      lastName: 0,
      middleName: 2,
      total: 2,
    });
  });

  it("calculates distance for names with missing parts", () => {
    const result: LevDistance = calculateLevenshteinDistance(
      "John Doe",
      "John",
    );
    expect(result).toEqual({
      firstName: 0,
      lastName: 3,
      middleName: 0,
      total: 3,
    });
  });

  it("calculates distance for names with extra parts", () => {
    const result: LevDistance = calculateLevenshteinDistance(
      "John",
      "John Doe",
    );
    expect(result).toEqual({
      firstName: 0,
      lastName: 3,
      middleName: 0,
      total: 3,
    });
  });

  it("calculates distance for names with multiple middle names in different order", () => {
    const result: LevDistance = calculateLevenshteinDistance(
      "John A B Doe",
      "John B A Doe",
    );
    expect(result).toEqual({
      firstName: 0,
      lastName: 0,
      middleName: 2,
      total: 2,
    });
  });
});

describe("calculateMatchMetric", () => {
  it("should calculate correct match metric for similar names", () => {
    const result = calculateMatchMetric("John Doe", "Jon Doe");
    expect(result).toHaveProperty("levDistance");
    expect(result).toHaveProperty("phoneticsMetric");
    expect(result.levDistance.total).toBe(1);
    expect(result.phoneticsMetric).toBeGreaterThan(0);
  });

  it("should calculate correct match metric for different names", () => {
    const result = calculateMatchMetric("Alice Smith", "Bob Johnson");
    expect(result).toHaveProperty("levDistance");
    expect(result).toHaveProperty("phoneticsMetric");
    expect(result.levDistance.total).toBe(12);
    expect(result.phoneticsMetric).toBe(0);
  });
});

describe("calculatePhoneticMetric", () => {
  it("should calculate correct phonetic metric for similar names", () => {
    const result = calculatePhoneticMetric("John Doe", "Jon Doe");
    expect(result).toBeGreaterThan(0);
  });

  it("should calculate correct phonetic metric for different names", () => {
    const result = calculatePhoneticMetric("Alice Smith", "Bob Johnson");
    expect(result).toBe(0);
  });

  it("calculates phonetic metric for identical names", () => {
    const result = calculatePhoneticMetric("John Doe", "John Doe");
    expect(result).toBe(6);
  });

  it("calculates phonetic metric for completely different names", () => {
    const result = calculatePhoneticMetric("Fardeen Panjwani", "Jane Smith");
    expect(result).toBe(0); // No matches
  });

  it("calculates phonetic metric for names with similar sounds", () => {
    const result = calculatePhoneticMetric("John Doe", "Jon Dough");
    expect(result).toBeGreaterThan(0); // Should have some matches due to similar phonetics
  });

  it("calculates phonetic metric for names with different middle names", () => {
    const result = calculatePhoneticMetric("John A Doe", "John B Doe");
    expect(result).toBe(6); // First and last names match on all 3 phonetic algorithms
  });

  it("calculates phonetic metric for names with multiple middle names", () => {
    const result = calculatePhoneticMetric("John A B Doe", "John A C Doe");
    expect(result).toBe(6); // First and last names match on all 3 phonetic algorithms
  });

  it("calculates phonetic metric with percentage option", () => {
    const options: CalculatePhoneticsMetricOptions = {
      returnAsPercentage: true,
    };
    const result = calculatePhoneticMetric("John Doe", "John Doe", options);
    expect(result).toBe(100.0); // 100% match
  });

  it("calculates phonetic metric for names with extra spaces", () => {
    const result = calculatePhoneticMetric("  John   Doe  ", "John Doe");
    expect(result).toBe(6); // Should normalize and match all parts
  });

  it("calculates phonetic metric for names with diacritics", () => {
    const result = calculatePhoneticMetric(
      "José María López",
      "Jose Maria Lopez",
    );
    expect(result).toBe(9); // Should normalize and match all parts
  });

  it("calculates phonetic metric for names with only first names", () => {
    const result = calculatePhoneticMetric("John", "Jon");
    expect(result).toBe(3); // Only first name matches on all 3 phonetic algorithms
  });

  it("calculates phonetic metric for names with only last names", () => {
    const result = calculatePhoneticMetric("Doe", "Dough");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(3);
  });
});

describe("normalizeName", () => {
  it("should normalize a name with special characters and extra spaces", () => {
    const result = normalizeName("  John   Döe-Smith  ");
    expect(result).toBe("john doe smith");
  });

  it("should normalize a name with numbers and punctuation", () => {
    const result = normalizeName("Alice123!@#$%^&*()_+{}|:\"<>?[]';,./");
    expect(result).toBe("alice");
  });
});

describe("splitNameIntoParts", () => {
  it("splits a single name into first name with empty last and middle names", () => {
    const result: NameParts = splitNameIntoParts("John");
    expect(result).toEqual({
      firstName: "john",
      lastName: "",
      middleNames: [],
    });
  });

  it("splits a two-part name into first and last name with empty middle names", () => {
    const result: NameParts = splitNameIntoParts("John Doe");
    expect(result).toEqual({
      firstName: "john",
      lastName: "doe",
      middleNames: [],
    });
  });

  it("splits a three-part name into first, middle, and last names", () => {
    const result: NameParts = splitNameIntoParts("John Michael Doe");
    expect(result).toEqual({
      firstName: "john",
      lastName: "doe",
      middleNames: ["michael"],
    });
  });

  it("splits a name with multiple middle names", () => {
    const result: NameParts = splitNameIntoParts("John Michael Smith Doe");
    expect(result).toEqual({
      firstName: "john",
      lastName: "doe",
      middleNames: ["michael", "smith"],
    });
  });

  it("handles names with extra spaces correctly", () => {
    const result: NameParts = splitNameIntoParts("  John   Doe  ");
    expect(result).toEqual({
      firstName: "john",
      lastName: "doe",
      middleNames: [],
    });
  });

  it("removes empty middle names after filtering", () => {
    const result: NameParts = splitNameIntoParts("John    Doe");
    expect(result).toEqual({
      firstName: "john",
      lastName: "doe",
      middleNames: [],
    });
  });

  it("handles names with diacritics and special characters", () => {
    const result: NameParts = splitNameIntoParts("José María López");
    expect(result).toEqual({
      firstName: "jose",
      lastName: "lopez",
      middleNames: ["maria"],
    });
  });

  it("returns an empty structure for an empty input", () => {
    const result: NameParts = splitNameIntoParts("");
    expect(result).toEqual({
      firstName: "",
      lastName: "",
      middleNames: [],
    });
  });
});

describe("search", () => {
  const sampleList = [
    { name: "John Doe", age: 30 },
    { name: "Jane Smith", age: 25 },
    { name: "Bob Johnson", age: 45 },
    { name: "Alice Brown", age: 35 },
    { name: "Charlie Davis", age: 50 },
  ];

  it("should find an exact match", () => {
    const result = search("John Doe", sampleList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "John Doe", age: 30 });
  });

  it("should find a close match with a typo", () => {
    const result = search("Jon Doe", sampleList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "John Doe", age: 30 });
  });

  it("should return null for no close matches", () => {
    const result = search("Xavier Young", sampleList, { matchPath: ["name"] });
    expect(result).toBeNull();
  });

  it("should work with an empty matchPath", () => {
    const stringList = ["John Doe", "Jane Smith", "Bob Johnson"];
    const result = search("Jon Doe", stringList);
    expect(result).toBe("John Doe");
  });

  it("should handle case insensitivity", () => {
    const result = search("john DOE", sampleList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "John Doe", age: 30 });
  });

  it("should handle extra spaces", () => {
    const result = search("  Jane    Smith  ", sampleList, {
      matchPath: ["name"],
    });
    expect(result).toEqual({ name: "Jane Smith", age: 25 });
  });

  it("should handle partial names", () => {
    const result = search("Bob", sampleList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "Bob Johnson", age: 45 });
  });

  it("should work with nested properties", () => {
    const nestedList = [
      { person: { name: "John Doe", age: 30 } },
      { person: { name: "Jane Smith", age: 25 } },
    ];
    const result = search("John Doe", nestedList, {
      matchPath: ["person", "name"],
    });
    expect(result).toEqual({ person: { name: "John Doe", age: 30 } });
  });

  it("should return null for an empty input list", () => {
    const result = search("John Doe", []);
    expect(result).toBeNull();
  });

  it("should handle names with special characters", () => {
    const specialList = [
      { name: "José García" },
      { name: "François Dubois" },
      { name: "Zürich Smith" },
    ];
    const result = search("Jose Garcia", specialList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "José García" });
  });

  it("should handle names with apostrophes", () => {
    const apostropheList = [
      { name: "John O'Connor" },
      { name: "Mary O'Brien" },
    ];
    const result = search("John OConnor", apostropheList, {
      matchPath: ["name"],
    });
    expect(result).toEqual({ name: "John O'Connor" });
  });

  it("should handle hyphenated names", () => {
    const hyphenatedList = [
      { name: "Mary-Jane Watson" },
      { name: "Jean-Claude Van Damme" },
    ];
    const result = search("Mary Jane Watson", hyphenatedList, {
      matchPath: ["name"],
    });
    expect(result).toEqual({ name: "Mary-Jane Watson" });
  });

  it("should handle names with prefixes", () => {
    const prefixList = [
      { name: "Dr. John Smith" },
      { name: "Mr. Bob Johnson" },
    ];
    const result = search("John Smith", prefixList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "Dr. John Smith" });
  });

  it("should handle names with suffixes", () => {
    const suffixList = [{ name: "John Smith Jr." }, { name: "Jane Doe Sr." }];
    const result = search("John Smith", suffixList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "John Smith Jr." });
  });

  it("should handle very long names", () => {
    const longNameList = [
      { name: "John Jacob Jingleheimer Schmidt" },
      { name: "Mary Elizabeth Jennifer George" },
    ];
    const result = search("John Jacob Schmidt", longNameList, {
      matchPath: ["name"],
      threshold: {
          distance: 13
      }
    });
    expect(result).toEqual({ name: "John Jacob Jingleheimer Schmidt" });
  });

  it("should handle names with numbers", () => {
    const numberList = [{ name: "John Doe 2nd" }, { name: "Jane Smith 3rd" }];
    const result = search("John Doe Second", numberList, {
      matchPath: ["name"],
    });
    expect(result).toEqual({ name: "John Doe 2nd" });
  });

  it("should handle very similar names", () => {
    const similarList = [
      { name: "John Doe" },
      { name: "Jon Doe" },
      { name: "John Doh" },
    ];
    const result = search("John Doe", similarList, { matchPath: ["name"] });
    expect(result).toEqual({ name: "John Doe" });
  });

  it("should handle completely different names with same length", () => {
    const differentList = [
      { name: "John Doe" },
      { name: "Mary Sue" },
      { name: "Bob Cat" },
    ];
    const result = search("Tom Fox", differentList, { matchPath: ["name"] });
    expect(result).toBeNull();
  });
});
