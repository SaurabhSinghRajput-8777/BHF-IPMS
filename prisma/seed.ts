import { PrismaClient, UserRole, QuestionType } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Bennett Hatchery IPMS database seeding...");

  // 1. Password Hashing
  const defaultPassword = "BennettPassword2026!";
  const passwordHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  // 2. Seed Default IP Categories
  console.log("📁 Seeding IP Categories...");
  const trademarkCategory = await prisma.ipCategory.upsert({
    where: { code: "TRADEMARK" },
    update: {},
    create: {
      code: "TRADEMARK",
      name: "Trademark",
      description: "Brand identity, logos, wordmarks, Nice classification, and trademark registration.",
      isActive: true,
    },
  });

  const patentCategory = await prisma.ipCategory.upsert({
    where: { code: "PATENT" },
    update: {},
    create: {
      code: "PATENT",
      name: "Patent",
      description: "Inventions, technical novelties, prior art evaluations, patent applications, and grants.",
      isActive: true,
    },
  });

  const copyrightCategory = await prisma.ipCategory.upsert({
    where: { code: "COPYRIGHT" },
    update: {},
    create: {
      code: "COPYRIGHT",
      name: "Copyright",
      description: "Original software code, algorithms, creative literature, and employee/founder IP assignment.",
      isActive: true,
    },
  });

  // 3. Seed Initial Questionnaire (v1)
  console.log("📝 Seeding IP Questionnaire Version 1...");
  const questionnaireV1 = await prisma.ipQuestionnaire.upsert({
    where: { version: 1 },
    update: {},
    create: {
      version: 1,
      title: "Bennett Hatchery Standard IP Assessment Questionnaire v1.0",
      description: "Comprehensive institutional questionnaire evaluating Trademark, Patent, and Copyright readiness.",
      isActive: true,
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    },
  });

  // Helper to upsert questions
  const questionsData = [
    // General IP Questions
    {
      categoryId: null,
      questionText: "Does your startup own or develop any proprietary intellectual property?",
      description: "Foundational assessment of proprietary inventions, software, or brand assets.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 1,
    },
    {
      categoryId: null,
      questionText: "Have you previously applied for any form of formal IP protection?",
      description: "Check if prior filings have been submitted in India or internationally.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 2,
    },
    {
      categoryId: null,
      questionText: "Does your startup currently hold any registered intellectual property?",
      description: "Official granted patents, registered trademarks, or copyright registration certificates.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 3,
    },
    {
      categoryId: null,
      questionText: "Have you executed formal IP ownership assignment agreements with all founders, employees, and contractors?",
      description: "Legal verification that all created IP belongs to the corporate incubation entity.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 4,
    },
    {
      categoryId: null,
      questionText: "Are you interested in obtaining professional legal and patent agent assistance through Bennett Hatchery CIE?",
      description: "Identifies institutional support requirements for incubation planning.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 5,
    },

    // Trademark Questions
    {
      categoryId: trademarkCategory.id,
      questionText: "Does your startup have a registered or established distinct brand name?",
      description: "The primary commercial trade name representing your product or service.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 10,
    },
    {
      categoryId: trademarkCategory.id,
      questionText: "Does your startup possess an original logo / visual device mark?",
      description: "Original graphic or stylized typography representing the venture.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 11,
    },
    {
      categoryId: trademarkCategory.id,
      questionText: "Have you conducted a formal trademark availability and conflict search on the Indian IP Office portal?",
      description: "Public trademark database search across relevant classes.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 12,
    },
    {
      categoryId: trademarkCategory.id,
      questionText: "Have you formally identified the relevant Nice Classification classes for your goods/services?",
      description: "Identifying goods/services classes (e.g. Class 9, Class 42).",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 13,
    },
    {
      categoryId: trademarkCategory.id,
      questionText: "Have you filed a trademark registration application with the Trade Marks Registry?",
      description: "Application filed and official TM application number issued.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 14,
    },
    {
      categoryId: trademarkCategory.id,
      questionText: "Has your trademark application been approved, advertised, or formally registered?",
      description: "Status verified with Certificate of Registration.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 15,
    },

    // Patent Questions
    {
      categoryId: patentCategory.id,
      questionText: "Has your startup developed a novel technical invention or engineered process?",
      description: "Determining existence of patentable subject matter.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 20,
    },
    {
      categoryId: patentCategory.id,
      questionText: "Does your product involve an inventive step that is not obvious to a person skilled in the art?",
      description: "Non-obviousness criteria under Patent Law.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 21,
    },
    {
      categoryId: patentCategory.id,
      questionText: "Have you conducted a preliminary prior-art search across patent databases (Google Patents, WIPO, USPTO)?",
      description: "Verification that the invention has not been previously published or patented.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 22,
    },
    {
      categoryId: patentCategory.id,
      questionText: "Have you maintained strict non-disclosure (NDA) and avoided public disclosure before filing?",
      description: "Crucial for preserving absolute novelty before patent application.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 23,
    },
    {
      categoryId: patentCategory.id,
      questionText: "Have you filed a provisional or complete patent application?",
      description: "Provisional or complete specification submitted to the Patent Office.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 24,
    },
    {
      categoryId: patentCategory.id,
      questionText: "Has a patent been granted by any government patent authority?",
      description: "Official Letters Patent document received.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 25,
    },

    // Copyright Questions
    {
      categoryId: copyrightCategory.id,
      questionText: "Has your startup developed original proprietary software, database structures, or source code?",
      description: "Software source code is legally protected under copyright as literary work.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 30,
    },
    {
      categoryId: copyrightCategory.id,
      questionText: "Do you maintain a version-controlled repository verifying dates of creation and authorship?",
      description: "Git commit history or timestamped repository establishing authorship.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 31,
    },
    {
      categoryId: copyrightCategory.id,
      questionText: "Are founder and employee intellectual property assignment agreements executed and archived?",
      description: "Ensures company owns the source code rather than individual developers.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 32,
    },
    {
      categoryId: copyrightCategory.id,
      questionText: "Have you applied for formal copyright registration for software source code or creative assets?",
      description: "Filing with the Copyright Office (Diary Number generated).",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 33,
    },
    {
      categoryId: copyrightCategory.id,
      questionText: "Has formal copyright registration been granted with a Registration Certificate?",
      description: "Official registration certificate issued by the Registrar of Copyrights.",
      questionType: QuestionType.SINGLE_CHOICE,
      displayOrder: 34,
    },
  ];

  for (const q of questionsData) {
    const existing = await prisma.ipQuestion.findFirst({
      where: {
        questionnaireId: questionnaireV1.id,
        displayOrder: q.displayOrder,
      },
    });

    if (!existing) {
      await prisma.ipQuestion.create({
        data: {
          questionnaireId: questionnaireV1.id,
          categoryId: q.categoryId,
          questionText: q.questionText,
          description: q.description,
          questionType: q.questionType,
          displayOrder: q.displayOrder,
          isRequired: true,
          scoringConfig: {
            YES: 100,
            APPLIED: 50,
            NO: 0,
            NOT_SURE: 0,
            NOT_APPLICABLE: null,
          },
        },
      });
    }
  }

  // 4. Seed Users: CIE Admin, Reviewer, Startup Founder
  console.log("👤 Seeding Institutional Accounts...");

  // A. CIE Admin
  await prisma.user.upsert({
    where: { email: "admin@bennett.edu.in" },
    update: { passwordHash },
    create: {
      name: "Dr. Incubation Director",
      email: "admin@bennett.edu.in",
      passwordHash,
      role: UserRole.CIE_ADMIN,
      isActive: true,
    },
  });

  const sidharthPasswordHash = await argon2.hash("sidharth@bhf2026", {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  await prisma.user.upsert({
    where: { email: "sidharth.tripathy@bennett.edu.in" },
    update: { passwordHash: sidharthPasswordHash, role: UserRole.CIE_ADMIN, name: "Sidharth Tripathy", isActive: true },
    create: {
      name: "Sidharth Tripathy",
      email: "sidharth.tripathy@bennett.edu.in",
      passwordHash: sidharthPasswordHash,
      role: UserRole.CIE_ADMIN,
      isActive: true,
    },
  });

  // B. Reviewer
  await prisma.user.upsert({
    where: { email: "reviewer@bennett.edu.in" },
    update: { passwordHash },
    create: {
      name: "Prof. Intellectual Property Lead",
      email: "reviewer@bennett.edu.in",
      passwordHash,
      role: UserRole.REVIEWER,
      isActive: true,
    },
  });

  // C. Startup Founder
  const founderUser = await prisma.user.upsert({
    where: { email: "founder@novatrace.io" },
    update: { passwordHash },
    create: {
      name: "Alex Sharma",
      email: "founder@novatrace.io",
      passwordHash,
      role: UserRole.STARTUP,
      isActive: true,
    },
  });

  // 5. Seed Demo Incubated Startup
  console.log("🚀 Seeding Demo Incubated Startup (NovaTrace AI)...");
  const startup = await prisma.startup.upsert({
    where: { startupCode: "BH-2026-001" },
    update: {},
    create: {
      startupCode: "BH-2026-001",
      name: "NovaTrace AI Solutions",
      founderName: "Alex Sharma",
      email: "founder@novatrace.io",
      contactNumber: "+91 98765 43210",
      website: "https://novatrace.io",
      industry: "Artificial Intelligence / Enterprise SaaS",
      startupStage: "Early Revenue",
      incorporationDate: new Date("2024-03-15"),
      registrationNumber: "U72900UP2024PTC199876",
      description: "NovaTrace AI builds automated visual inspection and deep-learning defect detection software for industrial electronics manufacturing.",
      productDescription: "Real-time edge computing vision models and cloud anomaly detection pipeline.",
    },
  });

  // Link founder user to startup
  await prisma.startupMember.upsert({
    where: { userId: founderUser.id },
    update: {},
    create: {
      startupId: startup.id,
      userId: founderUser.id,
      memberRole: "Founder & CEO",
    },
  });

  console.log("✅ Seeding completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Default Seed Accounts (Password: BennettPassword2026!):");
  console.log("1. CIE Admin: admin@bennett.edu.in");
  console.log("2. Reviewer: reviewer@bennett.edu.in");
  console.log("3. Startup:  founder@novatrace.io (Startup: BH-2026-001)");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

