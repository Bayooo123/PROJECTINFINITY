export interface InsightCategory {
    title: string;
    insights: string[];
}

export interface CourseInsight {
    course: string;
    level?: string;
    tips: string[];
    keyCases?: string[];
    keySections?: string[];
}

export const GENERAL_STRATEGIES: InsightCategory[] = [
    {
        title: "Study Strategies and Method",
        insights: [
            "Attend all classes and pay attention: Exam questions are often based on scenarios painted in class.",
            "Align textbooks with the lecturer's thought process: Lecturers grade based on marking schemes reflecting their classroom teachings.",
            "Prioritize specific areas: Focus on key areas likely to appear in exams rather than reading everything like a novel.",
            "Start early: Especially for slow readers, to allow for multiple reviews and zoning out important areas.",
            "Pay attention to emphasized cases: Read full judgments for cases lecturers mention repeatedly. For others, focus on the holding.",
            "Create and follow a reading schedule: Ensure all courses (especially 4-unit ones) are covered.",
            "Be realistic with rest: Rest when exhausted, but avoid overindulging in tiredness."
        ]
    },
    {
        title: "Success Factors",
        insights: [
            "Mindset: Maintain unflinching faith and avoid negative discussions ('company of mysteries').",
            "Consistency: Put in work daily and across semesters, maintaining discipline to remove distractions.",
            "Self-Knowledge: Identify your peak reading times and personal learning style (audio, visual, or discussion-based)."
        ]
    }
];

export const COURSE_SPECIFIC_INSIGHTS: CourseInsight[] = [
    {
        course: "Law of Contract",
        level: "200 Level",
        tips: [
            "Focus more on cases than sections of law.",
            "Identify key cases for Offer/Acceptance, Consideration, and Intention to Create Legal Relations."
        ],
        keyCases: [
            "Orient Bank v Palante International (Offer/Acceptance)",
            "Currie v Misa (Consideration)",
            "Sociedad Petrolifera Española v Madam UBA and Sons (Intention)"
        ]
    },
    {
        course: "Constitutional Law",
        level: "200 Level",
        tips: [
            "Master the provisions of the Constitution.",
            "Contrast constitutional and military regimes using specific cases."
        ],
        keySections: ["Section 4", "Section 5", "Section 6", "Section 58", "Section 59 (Budget)"],
        keyCases: ["Lakanmi v Attorney General of Western Nigeria"]
    },
    {
        course: "Criminal Law",
        level: "Upper Class",
        tips: [
            "Pay attention to defenses to rape (intoxication and consent).",
            "Attempted murder is highly probable; identify the specific statutory provision."
        ],
        keySections: ["Section 320 of the Criminal Code (Attempted Murder)"]
    },
    {
        course: "Commercial Transactions",
        level: "Upper Class",
        tips: ["Focus on market overt and its exceptions, and passing of property."]
    },
    {
        course: "Land Law",
        level: "Upper Class",
        tips: [
            "High priority: Customary land tenure, family land, and tenancy.",
            "Effect of Land Use Act on customary tenure (Abua and Yakubu principle)."
        ],
        keyCases: ["Abua v Yakubu"]
    },
    {
        course: "Human Rights",
        level: "Upper Class",
        tips: ["Know sections 33 to 44 of the Constitution (Right to life, dignity, personal liberty, etc.)"],
        keySections: ["Sections 33-44"]
    }
];

export const EXAM_STRATEGIES: InsightCategory[] = [
    {
        title: "Answering Questions",
        insights: [
            "Answer the question asked, not the one you think they are asking.",
            "Essay Questions: Use a catchy introduction, lay the background, and ensure the conclusion ties back to the question.",
            "Problem Questions: If asked to 'advise', your conclusion must contain advice.",
            "Frame issues specifically to reflect the names and events in the question, not generically.",
            "Convert problem questions into essay discussions of the relevant crime/topic generally after listing issues."
        ]
    },
    {
        title: "Time Management",
        insights: [
            "Limit each question to 30 minutes; if incomplete, move on and return later.",
            "Start by scanning all questions and jotting down remembered cases for each on the first page."
        ]
    },
    {
        title: "Anxiety Management",
        insights: [
            "Once notes are ready, close your mind to other people's conflicting information.",
            "Avoid congregating in front of the hall or discussing answers immediately after the exam.",
            "Remind yourself that you have done your part and failure is not an option."
        ]
    }
];
