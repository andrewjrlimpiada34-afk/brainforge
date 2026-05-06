'use server';
/**
 * @fileOverview A Genkit flow for generating personalized daily challenges.
 *
 * - generateDailyChallenge - A function that handles the daily challenge generation process.
 * - GenerateDailyChallengeInput - The input type for the generateDailyChallenge function.
 * - GenerateDailyChallengeOutput - The return type for the generateDailyChallenge function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDailyChallengeInputSchema = z.object({
  userId: z.string().describe('The unique identifier of the user.'),
  performanceHistory: z.string().describe('A summary of the user\'s past game performance, highlighting strengths and weaknesses.'),
  gamePreferences: z.string().describe('A summary of the user\'s preferred game types and play styles.'),
  unlockedGames: z.array(z.string()).describe('A list of game types currently unlocked and available to the user (e.g., "memory", "logic", "speed", "math").'),
});
export type GenerateDailyChallengeInput = z.infer<typeof GenerateDailyChallengeInputSchema>;

const GenerateDailyChallengeOutputSchema = z.object({
  challengeId: z.string().describe('A unique identifier for this daily challenge.'),
  challengeTitle: z.string().describe('A concise and engaging title for the daily challenge.'),
  challengeDescription: z.string().describe('A detailed description of the challenge, including objectives and requirements.'),
  bonusXp: z.number().int().positive().describe('The amount of bonus experience points awarded upon completion of the challenge.'),
  gameType: z.string().describe('The primary type of game associated with this challenge (e.g., "memory", "logic", "speed", "math"). Must be one of the unlocked games.'),
  targetAccuracy: z.number().min(0).max(100).optional().describe('The target accuracy percentage to achieve in the game, if applicable.'),
  targetCount: z.number().int().positive().optional().describe('The number of games or tasks to complete, if applicable.'),
});
export type GenerateDailyChallengeOutput = z.infer<typeof GenerateDailyChallengeOutputSchema>;

export async function generateDailyChallenge(input: GenerateDailyChallengeInput): Promise<GenerateDailyChallengeOutput> {
  return generateDailyChallengeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyChallengePrompt',
  input: { schema: GenerateDailyChallengeInputSchema },
  output: { schema: GenerateDailyChallengeOutputSchema },
  prompt: `You are an AI assistant specialized in creating engaging and personalized daily brain-training challenges for the 'BRAINFORGE' app.
Your goal is to generate a unique daily challenge tailored to the user's cognitive profile and preferences, selecting from available game types.

User's performance history: {{{performanceHistory}}}
User's game preferences: {{{gamePreferences}}}
Available game types: {{#each unlockedGames}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}

Generate a challenge that encourages improvement in weaker areas or builds upon strengths, aligned with their preferences. Ensure the challenge is clear, measurable, and motivating. The challengeId should be a unique string (e.g., a UUID or timestamp-based ID).

The 'gameType' field in the output MUST be one of the available game types provided in 'unlockedGames'.`,
});

const generateDailyChallengeFlow = ai.defineFlow(
  {
    name: 'generateDailyChallengeFlow',
    inputSchema: GenerateDailyChallengeInputSchema,
    outputSchema: GenerateDailyChallengeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
