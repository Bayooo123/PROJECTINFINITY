import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const trunc = (s: string | null | undefined, max: number) =>
  s ? s.slice(0, max) : '';

export interface IRACComponentScore {
  score: number;
  max: number;
  feedback: string;
}

export interface IRACEntryAssessment {
  number: number;
  issue: IRACComponentScore;
  rule: IRACComponentScore;
  application: IRACComponentScore;
  conclusion: IRACComponentScore;
  total: number;
}

export interface IRACAssessment {
  entries: IRACEntryAssessment[];
  overall: {
    score: number;
    max: number;
    verdict: 'Distinction' | 'Credit' | 'Pass' | 'Fail';
    summary: string;
  };
}

type SubmissionEntry = {
  number: number;
  issue: string;
  rule: string;
  authorities: string[];
  application: string;
  conclusion: string;
};

export const assessIRACSubmission = async (
  scenario: string,
  instruction: string,
  keyIssues: string | null,
  entries: SubmissionEntry[]
): Promise<IRACAssessment | null> => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Truncate all inputs aggressively to save tokens
  const scenarioSnip = trunc(scenario, 500);
  const instructionSnip = trunc(instruction, 200);
  const keyIssuesSnip = trunc(keyIssues, 300);

  const studentWork = entries.map(e =>
    `[Issue ${e.number}] I:${trunc(e.issue, 200)} R:${trunc(e.rule, 200)} Auth:${e.authorities.slice(0, 3).join(',')} A:${trunc(e.application, 200)} C:${trunc(e.conclusion, 150)}`
  ).join('\n');

  const prompt = `Nigerian law IRAC assessment. Score strictly. Return JSON only.

SCENARIO: ${scenarioSnip}
INSTRUCTION: ${instructionSnip}
KEY ISSUES: ${keyIssuesSnip || 'Not provided'}

STUDENT:
${studentWork}

Scoring per issue: Issue/2, Rule/3, Application/4, Conclusion/1. Total/10.
Verdict: Distinction=8-10, Credit=6-7, Pass=5, Fail=0-4.
Feedback: max 12 words per component.

JSON format:
{"entries":[{"number":1,"issue":{"score":0,"max":2,"feedback":"..."},"rule":{"score":0,"max":3,"feedback":"..."},"application":{"score":0,"max":4,"feedback":"..."},"conclusion":{"score":0,"max":1,"feedback":"..."},"total":0}],"overall":{"score":0,"max":10,"verdict":"Fail","summary":"2 sentence summary."}}`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (response.content[0] as { type: string; text: string }).text.trim();
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(clean) as IRACAssessment;
  } catch (error) {
    console.error('IRAC Claude assessment error:', error);
    return null;
  }
};
