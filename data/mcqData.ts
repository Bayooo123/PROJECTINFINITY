
import { QuizQuestion } from '../types';

export const PREDEFINED_MCQS: Record<string, QuizQuestion[]> = {
  "Law of Contract": [
    {
      topic: "Introduction and Classification of Contracts",
      question: "A contract is defined as a voluntary arrangement between two or more parties that is enforceable at law as a:",
      options: ["Moral commitment", "Binding legal agreement", "Social promise", "Gentleman's agreement"],
      correctAnswerIndex: 1,
      explanation: "A contract is fundamentally a binding legal agreement, which distinguishes it from social promises or moral commitments."
    },
    {
      topic: "Introduction and Classification of Contracts",
      question: "The distinguishing factor between a contract and a mere agreement is the badge of:",
      options: ["Consensus ad idem", "Consideration", "Enforceability", "Sanctity"],
      correctAnswerIndex: 2,
      explanation: "Enforceability at law is the key characteristic that turns an agreement into a contract."
    },
    {
      topic: "Introduction and Classification of Contracts",
      question: "The principle that parties to a contract must honor their obligations under it is known as the:",
      options: ["Will theory of law", "Freedom of Contract", "Objective interpretation", "Sanctity of contract"],
      correctAnswerIndex: 3,
      explanation: "Sanctity of contract is the principle that parties, having duly entered into a contract, must honour their obligations under it."
    },
    {
      topic: "Offer and Invitation to Treat",
      question: "According to the ruling in Pharmaceutical Society of Great Britain v. Boots Cash Chemist, the display of goods on shelves in a self-service shop is considered:",
      options: ["An offer", "An invitation to treat", "A bilateral contract", "A conditional offer"],
      correctAnswerIndex: 1,
      explanation: "The display of goods is an invitation to treat. The customer makes the offer at the till, which the cashier can then accept."
    },
    {
      topic: "Acceptance and Termination",
      question: "The locus classicus case for the principle that a counter offer destroys the original offer is:",
      options: ["Tinn v. Hoffman & Co", "Hyde v. Wrench", "Carlill v. Carbolic Smoke Ball Co.", "Felthouse v. Bindley"],
      correctAnswerIndex: 1,
      explanation: "In Hyde v. Wrench, the plaintiff's offer of £950 was a counter-offer that destroyed the original offer of £1000, preventing him from later accepting it."
    }
  ],
  "Commercial Law": [
     {
      topic: "Agency",
      question: "Which Latin maxim expresses the concept that the principal is bound by the agent's act as if he performed it himself?",
      options: ["Delegatus non potest delegare", "Actus non facit reum nisi mens sit rea", "Qui facit per alium facit per se", "Volenti non fit injuria"],
      correctAnswerIndex: 2,
      explanation: "'Qui facit per alium facit per se' means 'He who acts through another acts himself,' which is the foundation of agency liability."
    },
    {
      topic: "Agency",
      question: "The case of Boston deep sea fishing co. Ansell involved a director accepting secret payments from suppliers. What was the court's decision?",
      options: ["The director was permitted to keep the payments", "The director must account to the company for the bonuses and secret commissions he had received, plus interest.", "The company could only sue the suppliers", "The director was liable for damages but not the return of the bribe"],
      correctAnswerIndex: 1,
      explanation: "An agent has a fiduciary duty to their principal and must not make a secret profit. Therefore, the director had to account for all secret payments received."
    },
    {
      topic: "Hire Purchase",
      question: "According to the Hire Purchase Act 1965, which of the following must a memorandum contain?",
      options: ["A detailed list of the owner's business partners", "A statement of the hire purchase price and cash price of the goods", "A warranty regarding future value of the goods", "A clause allowing immediate termination without liability"],
      correctAnswerIndex: 1,
      explanation: "The Hire Purchase Act 1965 mandates that the memorandum must clearly state both the hire purchase price and the cash price to inform the hirer of the cost of credit."
    }
  ],
  "Criminal Law": [
     {
      topic: "General Principles of Criminal Liability",
      question: "What is the term for a legal person (like a company) being held liable for a criminal offence committed by its employees?",
      options: ["Strict Liability", "Vicarious Liability", "Corporate Liability", "Personal Liability"],
      correctAnswerIndex: 2,
      explanation: "Corporate liability refers to the legal responsibility of a corporation for criminal actions performed by its directors, officers, or employees."
    },
    {
      topic: "Defences (Self-defence, Insanity, Intoxication)",
      question: "The defence of insanity, as established by the M'Naghten rules, requires a 'defect of reason' caused by what?",
      options: ["Intoxication", "A disease of the mind", "Emotional pressure", "A sudden passion"],
      correctAnswerIndex: 1,
      explanation: "The M'Naghten rules specify that the defect of reason must stem from a 'disease of the mind' to be considered for the insanity defence."
    },
    {
      topic: "Sexual Offences",
      question: "Under Section 357 of the Criminal Code, what is the 'actus reus' of rape?",
      options: ["Threat of harm", "Lack of consent", "Unlawful carnal knowledge", "Indecent assault"],
      correctAnswerIndex: 2,
      explanation: "The actus reus (the guilty act) of rape is the act of unlawful carnal knowledge, which involves even the slightest penetration."
    }
  ],
  "Administrative Law": [
    {
      topic: "Theories, Functions, and Sources",
      question: "Which theory of administrative law, labeled by Harlow and Rawlings, centers on CONTROL and views bureaucratic power with deep suspicion?",
      options: ["Green Light Theory", "Amber Light Theory", "Red Light Theory", "Blue Light Theory"],
      correctAnswerIndex: 2,
      explanation: "The Red Light Theory is focused on controlling government power and protecting individual liberties from state encroachment."
    },
    {
      topic: "Legal Implications of Classification and Natural Justice",
      question: "The legal maxim 'Audi Alteram Partem' means:",
      options: ["One must not be a judge in his own case", "Hear the other side", "Delegated powers cannot be further sub-delegated", "Beyond the powers"],
      correctAnswerIndex: 1,
      explanation: "Audi Alteram Partem is a core principle of natural justice, meaning both sides of a dispute must be heard before a decision is made."
    }
  ]
};
