
export interface UserProfile {
  name: string;
  university: string;
  level: string;
  semester: string;
  courses: string[];
  hasOnboarded: boolean;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  PRACTICE = 'PRACTICE',
  IRAC = 'IRAC',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  SUGGESTIONS = 'SUGGESTIONS',
  ADMIN_SUGGESTIONS = 'ADMIN_SUGGESTIONS',
  EDIT_COURSES = 'EDIT_COURSES',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  imageUrl: string;
  content?: string; // Added optional content field
  author?: string;
  date?: string;
}

export const COURSE_STRUCTURE: Record<string, {
  'First Semester': { compulsory: string[]; electives: string[] };
  'Second Semester': { compulsory: string[]; electives: string[] };
}> = {
  "100 Level": {
    'First Semester': {
      compulsory: ["Legal Methods I", "Use of English", "Philosophy, Logic & Philosophy of Science"],
      electives: ["Introduction to Political Science", "Elements of English Grammar & Usage", "Introduction to Sociology", "Introduction to Psychology I", "Introduction to Poetry"]
    },
    'Second Semester': {
      compulsory: ["Legal Methods II", "English Grammar Usage: Lexis and Structure"],
      electives: ["Introduction to Psychology II", "Nigerian Societies, Cultures and Heritage", "Introduction to the Novel", "Introduction to African Societies and Culture"]
    }
  },
  "200 Level": {
    'First Semester': {
      compulsory: ["Constitutional Law I", "Law of Contract I", "Nigerian Legal System I", "Administrative Law I"],
      electives: ["Basic Computer Studies", "General African Studies"]
    },
    'Second Semester': {
      compulsory: ["Constitutional Law II", "Law of Contract II", "Nigerian Legal System II", "Administrative Law II"],
      electives: ["Introduction to Information Processing"]
    }
  },
  "300 Level": {
    'First Semester': {
      compulsory: ["Criminal Law I", "Law of Torts I", "Law of Commercial Transactions I"],
      electives: ["Entrepreneurship and Corporate Governance", "Family Law I", "Gender and the Law I", "Human Rights and Civil Liberties I", "Law & Religion I", "Law of Intellectual Property I", "Terrorism & National Security Law I"]
    },
    'Second Semester': {
      compulsory: ["Criminal Law II", "Law of Torts II", "Law of Commercial Transactions II"],
      electives: ["Customary Law", "Family Law II", "Gender and the Law II", "Human Rights and Civil Liberties II", "Law & Religion II", "Law of Intellectual Property II", "Terrorism & National Security Law II", "Mineral and Water Resources Law"]
    }
  },
  "400 Level": {
    'First Semester': {
      compulsory: ["Land Law I", "Principles of Equity"],
      electives: ["Conflict of Laws I", "Environmental Law I", "Health Law I", "Law of Banking and Related Instruments I", "Law of Insurance I", "Law of Personal Taxation", "Law of Restitution I", "Petroleum & Energy Law I"]
    },
    'Second Semester': {
      compulsory: ["Land Law II", "Legal Research & Writing", "Law of Trusts"],
      electives: ["Conflict of Laws II", "Environmental Law II", "Health Law II", "Housing Law", "Law of Banking and Related Instruments II", "Law of Business Taxation", "Law of Insurance II", "Law of Restitution II", "Entertainment Law", "Petroleum & Energy Law II"]
    }
  },
  "500 Level": {
    'First Semester': {
      compulsory: ["Company Law and Other Organizations", "Jurisprudence and Legal Theory I", "Law of Evidence I"],
      electives: ["Conveyancing", "Criminology", "Industrial Law", "International Trade Law", "Public International Law"]
    },
    'Second Semester': {
      compulsory: ["Jurisprudence and Legal Theory II", "Law of Evidence II", "Project / Long Essay"],
      electives: ["Administration of Estates", "Child Law", "Planning Law", "Shipping and Admiralty Law I", "Shipping and Admiralty Law II"]
    }
  },
  "Law School": {
    'First Semester': {
      compulsory: ["Civil Litigation", "Criminal Litigation", "Corporate Law Practice"],
      electives: []
    },
    'Second Semester': {
      compulsory: ["Property Law Practice", "Professional Ethics"],
      electives: []
    }
  }
};

export const LAW_COURSES = [
  // Core / Compulsory
  "Legal Method",
  "Nigerian Legal System",
  "Law of Contract",
  "Constitutional Law",
  "Law of Commercial Transactions",
  "Criminal Law",
  "Law of Torts",
  "Legal Research and Writing",
  "Land Law",
  "Equity and Trusts",
  "Company Law",
  "Jurisprudence and Legal Theory",
  "Law of Evidence",

  // Electives
  "Islamic Law",
  "Gender and the Law",
  "Law and Religion",
  "Intellectual Property Law",
  "Terrorism and National Security Law",
  "Mineral and Water Resources Law",
  "Family Law",
  "Human Rights and Civil Liberties",
  "Environmental Law",
  "Law of Banking",
  "Law of Insurance",
  "Entertainment Law",
  "Conflict of Laws",
  "Petroleum and Energy Law",
  "Health Law",
  "Housing Law",
  "Law of Restitution",
  "Advertising Law",
  "Taxation Law",
  "Industrial Law",
  "Shipping and Admiralty Law",
  "Public International Law",
  "International Trade Law",
  "Criminology",
  "Conveyancing",
  "Law of Succession",
  "Planning Law",
  "Child Law",

  // Law School
  "Civil Litigation",
  "Criminal Litigation",
  "Corporate Law Practice",
  "Property Law Practice",
  "Professional Ethics"
];

export const COURSE_TOPICS: Record<string, string[]> = {
  "Company Law": [
    "Corporate Affairs Commission",
    "Formation of Companies",
    "Capacity and Powers of the Company",
    "Re-registration of Companies",
    "Company Promoters",
    "Exercise of Powers for and on Behalf of the Company",
    "Pre-incorporation Contracts",
    "Membership of the Company",
    "Company Meetings",
    "Company Audit",
    "Partnership",
    "Business Name",
    "Company Secretary",
    "Company Shares and Share Capital",
    "Creation of Debenture and Debenture Stock",
    "Company Directors",
    "Duties of Directors",
    "Minority Protection",
    "Financial Statements and Accounts",
    "Annual Reports",
    "Company Voluntary Arrangements",
    "Administration of Companies",
    "Company Receivers and Managers",
    "Winding Up of Companies",
    "Arrangement and Compromise",
    "Netting",
    "Incorporated Trustees",
    "Administrative Proceedings Committee",
    "History of Company Law (UK & Nigeria)",
    "Scope and Sources of Company Law",
    "Business Facilitation"
  ],
  "Constitutional Law": [
    "Constitution, Constitutional Law and Constitutionalism",
    "Constitutional Concepts (Rule of Law & Supremacy)",
    "Constitutional Concepts (Separation of Powers & Rights)",
    "Constitutional History and Interpretation",
    "The Legislature",
    "The Executive",
    "The Judiciary",
    "Federalism and Local Government",
    "Electoral System and Constitutional History (Advanced)"
  ],
  "Criminal Law": [
    "General Principles of Criminal Liability",
    "Parties to an Offence",
    "Homicide (Murder & Manslaughter)",
    "Offences Against Property (Stealing, Robbery)",
    "Defences (Self-defence, Insanity, Intoxication)",
    "Assault and Battery",
    "Sexual Offences",
    "Corruption and Financial Crimes"
  ],
  "Law of Contract": [
    "Introduction and Classification of Contracts",
    "Offer and Invitation to Treat",
    "Acceptance and Termination",
    "Consideration",
    "Promissory Estoppel and Legal Relations",
    "Terms of a Contract",
    "Exclusion Clauses and Capacity",
    "Privity of Contract",
  ],
  "Law of Torts": [
    "Negligence",
    "Defamation",
    "Trespass to Person",
    "Trespass to Land",
    "Nuisance",
    "Vicarious Liability",
    "Occupiers Liability",
    "Strict Liability (Rylands v Fletcher)"
  ],
  "Land Law": [
    "Land Law as Property: Introduction",
    "Land Rights",
    "Customary Land Tenure System",
    "Customary Land Transactions",
    "Land Use Act",
    "Estates in Land",
    "Concept of Settlement",
    "Co-ownership"
  ],
  "Equity and Trusts": [
    "Meaning, Nature, Origin, and Reception of Equity",
    "Maxims of Equity",
    "Nature of Equitable Interest and Doctrine of Notice",
    "Assignment of Choses in Action",
    "Injunction",
    "Specific Performance"
  ],
  "Commercial Law": [
    "Agency",
    "Hire Purchase",
    "Sale of Goods",
    "Insurance Law",
    "Negotiable Instruments",
    "Carriage of Goods by Sea"
  ],
  "Evidence": [
    "Relevancy and Admissibility",
    "Burden and Standard of Proof",
    "Hearsay Evidence",
    "Confessions",
    "Competence and Compellability",
    "Examination of Witnesses",
    "Documentary Evidence"
  ],
  "Jurisprudence": [
    "Nature and Definition of Law",
    "Natural Law School",
    "Legal Positivism",
    "Sociological School",
    "Historical School",
    "Realist School",
    "Law and Morality",
    "African Customary Law"
  ],
  "Nigerian Legal System": [
    "Introduction and Theories of Law",
    "Classification and Sources of Law",
    "Case Law and Stare Decisis",
    "Local Enactments and Legislation",
    "Rules of Statutory Interpretation",
    "Customary Law and Validity",
    "Islamic Law and International Law",
    "Internal Conflict of Laws",
    "Judicial Hierarchy and Additional Topics"
  ],
  "Law of Partnership": [
    "Nature of Partnership",
    "Creation of Partnership",
    "Relationship between Partners",
    "Relationship between Partners and Third Parties",
    "Dissolution of Partnership",
    "Limited Liability Partnership (LLP)"
  ],
  "Administrative Law": [
    "Introduction and Relationship with Constitutional Law",
    "Theories, Functions, and Sources",
    "Classification of Administrative Powers",
    "Legal Implications of Classification and Natural Justice",
    "Delegated Legislation and Ultra Vires",
    "Rule Making Procedures",
    "Control of Administrative Powers",
    "Local Government",
    "Public Service and Civil Service",
  ]
};

export const LEARNING_FACTS = [
  {
    title: "Spacing Effect",
    content: "Distributed practice (spacing out your study sessions) yields better long-term retention than massed practice (cramming)."
  },
  {
    title: "Active Recall",
    content: "Testing yourself on material forces your brain to retrieve information, strengthening neural pathways more than simply re-reading notes."
  },
  {
    title: "Dual Coding",
    content: "Combining verbal information with visuals (like diagrams or flowcharts) helps store information in two ways, doubling the chance of retrieval."
  },
  {
    title: "Elaborative Interrogation",
    content: "Asking 'Why is this true?' and generating an explanation connects new facts to existing knowledge, making memories stronger."
  },
  {
    title: "Interleaving",
    content: "Mixing different topics or types of problems during a study session improves your ability to distinguish between concepts."
  },
  {
    title: "Metacognition",
    content: "Thinking about your own thinking—assessing what you know and what you don't—is crucial for effective self-directed learning."
  },
  {
    title: "Generation Effect",
    content: "Information is better remembered if it is generated from your own mind rather than simply read."
  },
  {
    title: "Mnemonic Devices",
    content: "Using patterns of letters, ideas, or associations (like acronyms) can help you remember facts or lists."
  },
  {
    title: "Pomodoro Technique",
    content: "Using timed intervals (e.g., 25 minutes of work followed by a 5-minute break) can maintain high levels of focus and prevent mental fatigue."
  },
  {
    title: "Feynman Technique",
    content: "Explaining a concept in simple terms (as if to a child) reveals gaps in your understanding."
  }
];


// END OF FILE
