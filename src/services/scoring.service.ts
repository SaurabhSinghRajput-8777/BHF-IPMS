import { ScoreClassification, IpCategoryCode } from "@/types";

export interface CategoryScoreCalculation {
  score: number | null;
  applicableQuestions: number;
  scoredQuestions: number;
}

export interface OverallScoreCalculation {
  overallScore: number;
  applicableCategoriesCount: number;
  classification: ScoreClassification;
}

export class ScoringEngineService {
  /**
   * Maps an individual question response value to its numeric score.
   * YES: 100
   * APPLIED: 50
   * NO: 0
   * NOT_SURE: 0
   * NOT_APPLICABLE: null (Excluded)
   */
  static getScoreForResponse(response: string): number | null {
    switch (response) {
      case "YES":
        return 100;
      case "APPLIED":
        return 50;
      case "NO":
      case "NOT_SURE":
        return 0;
      case "NOT_APPLICABLE":
        return null;
      default:
        return 0;
    }
  }

  /**
   * Calculates category score as the percentage of points scored over applicable questions.
   */
  static calculateCategoryScore(responses: readonly string[]): CategoryScoreCalculation {
    let totalScore = 0;
    let applicableCount = 0;
    let scoredCount = 0;

    for (const r of responses) {
      const score = this.getScoreForResponse(r);
      if (score !== null) {
        totalScore += score;
        applicableCount++;
        scoredCount++;
      }
    }

    if (applicableCount === 0) {
      return {
        score: null,
        applicableQuestions: 0,
        scoredQuestions: 0,
      };
    }

    const categoryScore = Math.round((totalScore / applicableCount) * 100) / 100;

    return {
      score: categoryScore,
      applicableQuestions: applicableCount,
      scoredQuestions: scoredCount,
    };
  }

  /**
   * Calculates the overall IP maturity score across all verified applicable categories.
   */
  static calculateOverallScore(
    categoryScores: Array<{
      category: IpCategoryCode | string;
      score: number | null;
      isApplicable: boolean;
    }>
  ): OverallScoreCalculation {
    const applicable = categoryScores.filter((c) => c.isApplicable && c.score !== null);

    if (applicable.length === 0) {
      return {
        overallScore: 0,
        applicableCategoriesCount: 0,
        classification: "Initial",
      };
    }

    const sumScores = applicable.reduce((acc, curr) => acc + (curr.score ?? 0), 0);
    const overallScore = Math.round((sumScores / applicable.length) * 100) / 100;
    const classification = this.classifyScore(overallScore);

    return {
      overallScore,
      applicableCategoriesCount: applicable.length,
      classification,
    };
  }

  /**
   * Classifies an IP maturity score into institutional tiers.
   */
  static classifyScore(score: number): ScoreClassification {
    if (score <= 20) return "Initial";
    if (score <= 40) return "Developing";
    if (score <= 60) return "Intermediate";
    if (score <= 80) return "Advanced";
    return "Strong IP Readiness";
  }
}

