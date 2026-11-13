import { prisma } from "@/lib/prisma";

export class QuestionnaireService {
  /**
   * Returns the currently active questionnaire with all questions ordered by displayOrder.
   */
  static async getActiveQuestionnaire() {
    return prisma.ipQuestionnaire.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Returns questions for a specific category within a questionnaire.
   */
  static async getQuestionsByCategory(questionnaireId: string, categoryId: string) {
    return prisma.ipQuestion.findMany({
      where: { questionnaireId, categoryId, isActive: true },
      orderBy: { displayOrder: "asc" },
      include: { category: true },
    });
  }

  /**
   * Returns all active IP categories.
   */
  static async getCategories() {
    return prisma.ipCategory.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });
  }
}

