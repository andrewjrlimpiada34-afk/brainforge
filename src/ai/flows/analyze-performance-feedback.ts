'use server';
/**
 * @fileOverview A Genkit flow for analyzing user game performance and providing personalized feedback.
 *
 * - analyzePerformanceFeedback - A function that handles the performance analysis process.
 * - AnalyzePerformanceFeedbackInput - The input type for the analyzePerformanceFeedback function.
 * - AnalyzePerformanceFeedbackOutput - The return type for the analyzePerformanceFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePerformanceFeedbackInputSchema = z.object({
  username: z.string().describe('The username of the player.'),
  gameResults: z.array(
    z.object({
      gameType: z.string().describe('The type of game played (e.g., "Memory: Pattern Recall").'),
      score: z.number().describe('The score achieved in the game session.'),
      accuracy: z.number().min(0).max(100).describe('Accuracy percentage (0-100).'),
      speed: z.number().describe('Speed metric (e.g., average reaction time in ms, or time to complete in seconds).'),
      difficulty: z.string().describe('Difficulty level of the game (e.g., "easy", "medium", "hard").'),
      cognitiveAreasImpacted: z.array(z.enum(['Memory', 'Logic', 'Speed', 'Accuracy']))
        .describe('List of cognitive areas primarily targeted by this game.'),
    })
  ).describe('A list of recent game session results.'),
  overallStats: z.object({
    memory: z.number().min(0).max(100).describe('Overall Memory skill level (0-100).'),
    logic: z.number().min(0).max(100).describe('Overall Logic skill level (0-100).'),
    speed: z.number().min(0).max(100).describe('Overall Speed skill level (0-100).'),
    accuracy: z.number().min(0).max(100).describe('Overall Accuracy skill level (0-100).'),
  }).describe('The player\'s current overall cognitive statistics.'),
});
export type AnalyzePerformanceFeedbackInput = z.infer<typeof AnalyzePerformanceFeedbackInputSchema>;

const AnalyzePerformanceFeedbackOutputSchema = z.object({
  summaryFeedback: z.string().describe('An overall summary of the player\'s performance.'),
  strengths: z.array(z.string()).describe('List of identified cognitive strengths.'),
  weaknesses: z.array(z.string()).describe('List of identified cognitive weaknesses.'),
  suggestionsForImprovement: z.array(
    z.object({
      category: z.enum(['Memory', 'Logic', 'Speed', 'Accuracy']).describe('The cognitive category for the suggestion.'),
      strategy: z.string().describe('A concrete strategy to improve in the specified category.'),
      gameRecommendations: z.array(z.string()).describe('Specific game types to play for improvement.'),
    })
  ).describe('Tailored suggestions for improvement, including strategies and game recommendations.'),
});
export type AnalyzePerformanceFeedbackOutput = z.infer<typeof AnalyzePerformanceFeedbackOutputSchema>;

export async function analyzePerformanceFeedback(input: AnalyzePerformanceFeedbackInput): Promise<AnalyzePerformanceFeedbackOutput> {
  return analyzePerformanceFeedbackFlow(input);
}

const analyzePerformanceFeedbackPrompt = ai.definePrompt({
  name: 'analyzePerformanceFeedbackPrompt',
  input: { schema: AnalyzePerformanceFeedbackInputSchema },
  output: { schema: AnalyzePerformanceFeedbackOutputSchema },
  prompt: `You are an AI-powered cognitive coach for {{username}}. Your goal is to analyze their recent game performance and overall cognitive stats to provide personalized, actionable feedback.

Analyze the following recent game results:
{{#each gameResults}}
- Game Type: {{gameType}}
  - Score: {{score}}
  - Accuracy: {{accuracy}}%
  - Speed: {{speed}}
  - Difficulty: {{difficulty}}
  - Cognitive Areas: {{#each cognitiveAreasImpacted}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

And here are {{username}}'s current overall cognitive stats:
- Memory: {{overallStats.memory}}%
- Logic: {{overallStats.logic}}%
- Speed: {{overallStats.speed}}%
- Accuracy: {{overallStats.accuracy}}%

Based on this data, provide the following structured feedback:
1. An overall summary of {{username}}'s performance.
2. A list of specific cognitive strengths.
3. A list of specific cognitive weaknesses.
4. Tailored suggestions for improvement, categorized by cognitive area, including concrete strategies and recommended game types.

Ensure your feedback is encouraging, clear, and actionable. Focus on helping {{username}} effectively target their training to enhance their cognitive skills.
`,
});

const analyzePerformanceFeedbackFlow = ai.defineFlow(
  {
    name: 'analyzePerformanceFeedbackFlow',
    inputSchema: AnalyzePerformanceFeedbackInputSchema,
    outputSchema: AnalyzePerformanceFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePerformanceFeedbackPrompt(input);
    if (!output) {
      throw new Error('Failed to get output from performance feedback prompt.');
    }
    return output;
  }
);
