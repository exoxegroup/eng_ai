-- AlterTable
ALTER TABLE "public"."sessions" ADD COLUMN     "ai_initiated_refinements" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ai_refined_prompt" TEXT,
ADD COLUMN     "ai_solution" TEXT,
ADD COLUMN     "engagement_rationale" TEXT,
ADD COLUMN     "intelligence_rationale" TEXT,
ADD COLUMN     "original_prompt" TEXT,
ADD COLUMN     "satisfaction_survey_interactions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_emotional_engagement_score" TEXT NOT NULL DEFAULT '1',
ADD COLUMN     "user_initiated_refinements" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_intelligence_score" TEXT NOT NULL DEFAULT '1',
ADD COLUMN     "user_location" TEXT;
