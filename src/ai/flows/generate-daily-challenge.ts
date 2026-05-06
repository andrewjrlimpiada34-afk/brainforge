'use server';
/**
 * @fileOverview A Genkit flow for generating personalized daily challenges.
 * Includes fallback logic for API quota exhaustion (429 errors).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDailyChallengeInputSchema = z.object({
  userId: z.string().describe('The unique identifier of the user.'),
  performanceHistory: z.string().describe('A summary of the user\'s past game performance.'),
  gamePreferences: z.string().describe('A summary of the user\'s preferred game types.'),
  unlockedGames: z.array(z.string()).describe('A list of available game IDs.'),
});
export type GenerateDailyChallengeInput = z.infer<typeof GenerateDailyChallengeInputSchema>;

const GenerateDailyChallengeOutputSchema = z.object({
  challengeId: z.string().describe('A unique identifier for this daily challenge.'),
  challengeTitle: z.string().describe('A concise title.'),
  challengeDescription: z.string().describe('A detailed description.'),
  bonusXp: z.number().int().positive().describe('XP reward.'),
  gameType: z.string().describe('The primary game ID.'),
  targetAccuracy: z.number().min(0).max(100).optional().describe('Target accuracy.'),
  targetCount: z.number().int().positive().optional().describe('Target rounds.'),
});
export type GenerateDailyChallengeOutput = z.infer<typeof GenerateDailyChallengeOutputSchema>;

const FALLBACK_CHALLENGE: GenerateDailyChallengeOutput = {
  challengeId: 'fallback-memory',
  challengeTitle: 'Neural Recall Protocol',
  challengeDescription: 'The AI is recalibrating. Complete 3 rounds of Pattern Recall to maintain neural stability.',
  bonusXp: 250,
  gameType: 'memory-pattern',
  targetCount: 3,
};

export async function generateDailyChallenge(input: GenerateDailyChallengeInput): Promise<GenerateDailyChallengeOutput> {
  return generateDailyChallengeFlow(input);
}

const challengePrompt = ai.definePrompt({
  name: 'generateDailyChallengePrompt',
  input: { schema: GenerateDailyChallengeInputSchema },
  output: { schema: GenerateDailyChallengeOutputSchema },
  prompt: `You are an AI assistant specialized in creating personalized daily brain-training challenges for the 'BRAINFORGE' app.
User's performance history: {{{performanceHistory}}}
Available game IDs: {{#each unlockedGames}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}

Generate a challenge that encourages improvement. 
CRITICAL: The 'gameType' field MUST be EXACTLY one of: {{#each unlockedGames}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}.`,
});

const generateDailyChallengeFlow = ai.defineFlow(
  {
    name: 'generateDailyChallengeFlow',
    inputSchema: GenerateDailyChallengeInputSchema,
    outputSchema: GenerateDailyChallengeOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await challengePrompt(input);
      if (!output) return FALLBACK_CHALLENGE;
      return output;
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return FALLBACK_CHALLENGE;
      }
      throw error;
    }
  }
);
