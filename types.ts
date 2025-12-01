
export interface UserProfile {
  name: string;
  university: string;
  level: string;
  courses: string[];
  hasOnboarded: boolean;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  PRACTICE = 'PRACTICE',
  STUDY = 'STUDY',
  BLOG = 'BLOG',
  PROFILE = 'PROFILE'
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

export const COURSE_STRUCTURE: Record<string, { compulsory: string[], electives: string[] }> = {
  "100 Level": {
    compulsory: ["Legal Method", "Nigerian Legal System"],
    electives: ["Logic and Philosophic Thought", "Introduction to Sociology", "Use of English"]
  },
  "200 Level": {
    compulsory: ["Law of Contract", "Administrative Law", "Constitutional Law", "Nigerian Legal System"],
    electives: ["Legal Method"]
  },
  "300 Level": {
    compulsory: ["Criminal Law", "Law of Torts", "Commercial Law"],
    electives: ["Banking Law", "Intellectual Property Law", "Oil and Gas Law I"]
  },
  "400 Level": {
    compulsory: ["Land Law", "Equity and Trusts", "Evidence"],
    electives: ["Oil and Gas Law II", "Taxation Law", "Environmental Law"]
  },
  "500 Level": {
    compulsory: ["Company Law", "Jurisprudence", "Law of Partnership"],
    electives: ["Industrial Law", "Shipping & Admiralty Law", "Public International Law", "Conveyancing"]
  },
  "Law School": {
    compulsory: ["Civil Litigation", "Criminal Litigation", "Corporate Law Practice", "Property Law Practice", "Professional Ethics"],
    electives: []
  }
};

export const LAW_COURSES = [
  "Constitutional Law",
  "Criminal Law",
  "Law of Contract",
  "Law of Torts",
  "Land Law",
  "Equity and Trusts",
  "Commercial Law",
  "Evidence",
  "Jurisprudence",
  "Company Law",
  "Legal Method",
  "Nigerian Legal System",
  "Law of Partnership",
  "Administrative Law"
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
    "Separation of Powers",
    "Rule of Law",
    "Federalism in Nigeria",
    "Human Rights (Chapter IV)",
    "Executive Powers",
    "Legislative Powers",
    "Judicial Powers",
    "Locus Standi",
    "Supremacy of the Constitution"
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
    "Land Use Act 1978",
    "Customary Land Tenure",
    "Right of Occupancy",
    "Governor's Consent",
    "Mortgages",
    "Leases and Tenancy",
    "Easements and Profits"
  ],
  "Equity and Trusts": [
    "Maxims of Equity",
    "Equitable Remedies",
    "Creation of Trusts",
    "Duties of Trustees",
    "Charitable Trusts",
    "Resulting and Constructive Trusts",
    "Administration of Estates"
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
