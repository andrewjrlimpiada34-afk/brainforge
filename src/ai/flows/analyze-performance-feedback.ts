'use server';
/**
 * @fileOverview A Genkit flow for analyzing user game performance.
 * Includes fallback logic for API quota exhaustion (429 errors).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePerformanceFeedbackInputSchema = z.object({
  username: z.string().describe('The username of the player.'),
  gameResults: z.array(z.any()),
  overallStats: z.any(),
});
export type AnalyzePerformanceFeedbackInput = z.infer<typeof AnalyzePerformanceFeedbackInputSchema>;

const AnalyzePerformanceFeedbackOutputSchema = z.object({
  summaryFeedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestionsForImprovement: z.array(z.object({
    category: z.string(),
    strategy: z.string(),
    gameRecommendations: z.array(z.string()),
  })),
});
export type AnalyzePerformanceFeedbackOutput = z.infer<typeof AnalyzePerformanceFeedbackOutputSchema>;

const FALLBACK_FEEDBACK: AnalyzePerformanceFeedbackOutput = {
  summaryFeedback: "Your neural profile is looking steady. Continue standard training protocols while the AI diagnostic module finishes its sweep.",
  strengths: ["Consistency", "Resilience"],
  weaknesses: ["Latency"],
  suggestionsForImprovement: [{
    category: "Memory",
    strategy: "Engage in more visual spatial tasks.",
    gameRecommendations: ["memory-pattern"]
  }]
};

export async function analyzePerformanceFeedback(input: AnalyzePerformanceFeedbackInput): Promise<AnalyzePerformanceFeedbackOutput> {
  return analyzePerformanceFeedbackFlow(input);
}

const feedbackPrompt = ai.definePrompt({
  name: 'analyzePerformanceFeedbackPrompt',
  input: { schema: AnalyzePerformanceFeedbackInputSchema },
  output: { schema: AnalyzePerformanceFeedbackOutputSchema },
  prompt: `Analyze the performance of {{username}} and provide constructive feedback. Summary, strengths, weaknesses and strategies are required.`,
});

const analyzePerformanceFeedbackFlow = ai.defineFlow(
  {
    name: 'analyzePerformanceFeedbackFlow',
    inputSchema: AnalyzePerformanceFeedbackInputSchema,
    outputSchema: AnalyzePerformanceFeedbackOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await feedbackPrompt(input);
      if (!output) return FALLBACK_FEEDBACK;
      return output;
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return FALLBACK_FEEDBACK;
      }
      throw error;
    }
  }
);
