import { UserRole, AssessmentStatus, ResponseValue, QuestionType, ReviewDecision, ReviewStatus, ReportType } from "@prisma/client";

// Re-export Prisma Enums for client & server domain usage
export {
  UserRole,
  AssessmentStatus,
  ResponseValue,
  QuestionType,
  ReviewDecision,
  ReviewStatus,
  ReportType,
};

// Standardized API Response Contracts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  timestamp: string;
}

// Authenticated User Context Interface
export interface AuthUserContext {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  startupId?: string | null;
  startupCode?: string | null;
  startupName?: string | null;
}

// IP Category Codes
export type IpCategoryCode = "TRADEMARK" | "PATENT" | "COPYRIGHT";

// Score Classification Tiers
export type ScoreClassification =
  | "Initial"
  | "Developing"
  | "Intermediate"
  | "Advanced"
  | "Strong IP Readiness";

// Calculated Score Breakdown
export interface CategoryScoreResult {
  categoryId: string;
  categoryCode: IpCategoryCode;
  categoryName: string;
  score: number;
  applicableQuestions: number;
  scoredQuestions: number;
  isApplicable: boolean;
}

export interface AssessmentScoringSummary {
  assessmentId: string;
  version: number;
  overallScore: number;
  classification: ScoreClassification;
  categoryScores: CategoryScoreResult[];
  applicableCategoriesCount: number;
  calculatedAt: string;
}

