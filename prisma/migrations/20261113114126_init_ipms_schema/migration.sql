-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STARTUP', 'CIE_ADMIN', 'REVIEWER');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'RESUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResponseValue" AS ENUM ('YES', 'NO', 'APPLIED', 'NOT_APPLICABLE', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'NUMBER', 'DATE', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('STARTUP_REPORT', 'CIE_ANALYTICS_REPORT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" UUID NOT NULL,
    "startup_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "founder_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT NOT NULL,
    "startup_stage" TEXT NOT NULL,
    "incorporation_date" DATE,
    "registration_number" TEXT,
    "description" TEXT NOT NULL,
    "product_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_members" (
    "id" UUID NOT NULL,
    "startup_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "member_role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "startup_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ip_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_questionnaires" (
    "id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_questions" (
    "id" UUID NOT NULL,
    "questionnaire_id" UUID NOT NULL,
    "category_id" UUID,
    "question_text" TEXT NOT NULL,
    "description" TEXT,
    "question_type" "QuestionType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL,
    "scoring_config" JSONB,
    "conditional_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ip_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_assessments" (
    "id" UUID NOT NULL,
    "startup_id" UUID NOT NULL,
    "questionnaire_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_responses" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "response" "ResponseValue" NOT NULL,
    "text_value" TEXT,
    "justification" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_applicability" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "startup_applicable" BOOLEAN NOT NULL,
    "startup_remarks" TEXT,
    "reviewer_applicable" BOOLEAN,
    "reviewer_remarks" TEXT,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "assessment_applicability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_scores" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "category_id" UUID,
    "score" DECIMAL(5,2) NOT NULL,
    "applicable_questions" INTEGER NOT NULL,
    "scored_questions" INTEGER NOT NULL,
    "is_overridden" BOOLEAN NOT NULL DEFAULT false,
    "override_reason" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_records" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "general_remarks" TEXT,
    "trademark_remarks" TEXT,
    "patent_remarks" TEXT,
    "copyright_remarks" TEXT,
    "recommendations" TEXT,
    "previous_status" "AssessmentStatus",
    "new_status" "AssessmentStatus" NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_schedules" (
    "id" UUID NOT NULL,
    "startup_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_records" (
    "id" UUID NOT NULL,
    "report_code" TEXT NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "startup_id" UUID,
    "assessment_id" UUID,
    "generated_by" UUID NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filters" JSONB,

    CONSTRAINT "report_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "startups_startup_code_key" ON "startups"("startup_code");

-- CreateIndex
CREATE INDEX "startups_name_idx" ON "startups"("name");

-- CreateIndex
CREATE INDEX "startups_industry_idx" ON "startups"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "startup_members_user_id_key" ON "startup_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "startup_members_startup_id_user_id_key" ON "startup_members"("startup_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ip_categories_code_key" ON "ip_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ip_questionnaires_version_key" ON "ip_questionnaires"("version");

-- CreateIndex
CREATE INDEX "ip_questions_questionnaire_id_display_order_idx" ON "ip_questions"("questionnaire_id", "display_order");

-- CreateIndex
CREATE INDEX "ip_questions_category_id_idx" ON "ip_questions"("category_id");

-- CreateIndex
CREATE INDEX "ip_assessments_startup_id_status_idx" ON "ip_assessments"("startup_id", "status");

-- CreateIndex
CREATE INDEX "ip_assessments_submitted_at_idx" ON "ip_assessments"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ip_assessments_startup_id_version_key" ON "ip_assessments"("startup_id", "version");

-- CreateIndex
CREATE INDEX "ip_responses_assessment_id_idx" ON "ip_responses"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "ip_responses_assessment_id_question_id_key" ON "ip_responses"("assessment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_applicability_assessment_id_category_id_key" ON "assessment_applicability"("assessment_id", "category_id");

-- CreateIndex
CREATE INDEX "ip_scores_assessment_id_idx" ON "ip_scores"("assessment_id");

-- CreateIndex
CREATE INDEX "review_records_assessment_id_idx" ON "review_records"("assessment_id");

-- CreateIndex
CREATE INDEX "review_records_reviewer_id_idx" ON "review_records"("reviewer_id");

-- CreateIndex
CREATE INDEX "review_schedules_startup_id_scheduled_date_idx" ON "review_schedules"("startup_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "review_schedules_reviewer_id_status_idx" ON "review_schedules"("reviewer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "report_records_report_code_key" ON "report_records"("report_code");

-- CreateIndex
CREATE INDEX "report_records_generated_at_idx" ON "report_records"("generated_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_questions" ADD CONSTRAINT "ip_questions_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "ip_questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_questions" ADD CONSTRAINT "ip_questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ip_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_assessments" ADD CONSTRAINT "ip_assessments_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_assessments" ADD CONSTRAINT "ip_assessments_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "ip_questionnaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_responses" ADD CONSTRAINT "ip_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ip_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_responses" ADD CONSTRAINT "ip_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "ip_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_applicability" ADD CONSTRAINT "assessment_applicability_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ip_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_applicability" ADD CONSTRAINT "assessment_applicability_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ip_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_scores" ADD CONSTRAINT "ip_scores_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ip_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_scores" ADD CONSTRAINT "ip_scores_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ip_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_records" ADD CONSTRAINT "review_records_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ip_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_records" ADD CONSTRAINT "review_records_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ip_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_records" ADD CONSTRAINT "report_records_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_records" ADD CONSTRAINT "report_records_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ip_assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_records" ADD CONSTRAINT "report_records_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
