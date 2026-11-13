import test from "node:test";
import assert from "node:assert/strict";
import { ScoringEngineService } from "../../src/services/scoring.service";

test("Scoring Engine: Question Score Mapping", () => {
  assert.strictEqual(ScoringEngineService.getScoreForResponse("YES"), 100);
  assert.strictEqual(ScoringEngineService.getScoreForResponse("APPLIED"), 50);
  assert.strictEqual(ScoringEngineService.getScoreForResponse("NO"), 0);
  assert.strictEqual(ScoringEngineService.getScoreForResponse("NOT_SURE"), 0);
  assert.strictEqual(ScoringEngineService.getScoreForResponse("NOT_APPLICABLE"), null);
});

test("Scoring Engine: Category Score Calculation", () => {
  // 5 questions: YES(100), YES(100), APPLIED(50), NO(0), YES(100) -> 350 / 5 = 70.00
  const responses = ["YES", "YES", "APPLIED", "NO", "YES"] as const;
  const result = ScoringEngineService.calculateCategoryScore(responses);
  assert.strictEqual(result.applicableQuestions, 5);
  assert.strictEqual(result.scoredQuestions, 5);
  assert.strictEqual(result.score, 70);
});

test("Scoring Engine: Category Score Excludes NOT_APPLICABLE", () => {
  // 4 questions: YES(100), NOT_APPLICABLE, APPLIED(50), NO(0) -> 150 / 3 = 50.00
  const responses = ["YES", "NOT_APPLICABLE", "APPLIED", "NO"] as const;
  const result = ScoringEngineService.calculateCategoryScore(responses);
  assert.strictEqual(result.applicableQuestions, 3);
  assert.strictEqual(result.score, 50);
});

test("Scoring Engine: Inapplicable Category Returns Null Score", () => {
  // All NOT_APPLICABLE
  const responses = ["NOT_APPLICABLE", "NOT_APPLICABLE"] as const;
  const result = ScoringEngineService.calculateCategoryScore(responses);
  assert.strictEqual(result.applicableQuestions, 0);
  assert.strictEqual(result.score, null);
});

test("Scoring Engine: Overall Score Calculation with 3 Applicable Categories", () => {
  // TM: 80, Patent: 60, Copyright: 100 -> (80 + 60 + 100) / 3 = 80.00
  const categoryScores = [
    { category: "TRADEMARK", score: 80, isApplicable: true },
    { category: "PATENT", score: 60, isApplicable: true },
    { category: "COPYRIGHT", score: 100, isApplicable: true },
  ];
  const overall = ScoringEngineService.calculateOverallScore(categoryScores);
  assert.strictEqual(overall.overallScore, 80);
  assert.strictEqual(overall.applicableCategoriesCount, 3);
  assert.strictEqual(overall.classification, "Advanced");
});

test("Scoring Engine: Overall Score Excludes NOT_APPLICABLE Category", () => {
  // Startup is pure SaaS: Patent is NOT_APPLICABLE
  // TM: 80, Patent: N/A, Copyright: 90 -> (80 + 90) / 2 = 85.00
  const categoryScores = [
    { category: "TRADEMARK", score: 80, isApplicable: true },
    { category: "PATENT", score: null, isApplicable: false },
    { category: "COPYRIGHT", score: 90, isApplicable: true },
  ];
  const overall = ScoringEngineService.calculateOverallScore(categoryScores);
  assert.strictEqual(overall.overallScore, 85);
  assert.strictEqual(overall.applicableCategoriesCount, 2);
  assert.strictEqual(overall.classification, "Strong IP Readiness");
});

test("Scoring Engine: Edge Case - All Categories Inapplicable", () => {
  const categoryScores = [
    { category: "TRADEMARK", score: null, isApplicable: false },
    { category: "PATENT", score: null, isApplicable: false },
    { category: "COPYRIGHT", score: null, isApplicable: false },
  ];
  const overall = ScoringEngineService.calculateOverallScore(categoryScores);
  assert.strictEqual(overall.overallScore, 0);
  assert.strictEqual(overall.applicableCategoriesCount, 0);
  assert.strictEqual(overall.classification, "Initial");
});

test("Scoring Engine: Classification Tiers", () => {
  assert.strictEqual(ScoringEngineService.classifyScore(0), "Initial");
  assert.strictEqual(ScoringEngineService.classifyScore(20), "Initial");
  assert.strictEqual(ScoringEngineService.classifyScore(20.5), "Developing");
  assert.strictEqual(ScoringEngineService.classifyScore(40), "Developing");
  assert.strictEqual(ScoringEngineService.classifyScore(40.1), "Intermediate");
  assert.strictEqual(ScoringEngineService.classifyScore(60), "Intermediate");
  assert.strictEqual(ScoringEngineService.classifyScore(60.1), "Advanced");
  assert.strictEqual(ScoringEngineService.classifyScore(80), "Advanced");
  assert.strictEqual(ScoringEngineService.classifyScore(80.1), "Strong IP Readiness");
  assert.strictEqual(ScoringEngineService.classifyScore(100), "Strong IP Readiness");
});

