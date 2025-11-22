import { GoogleGenAI } from "@google/genai";
import { TimeLog, Category } from '../types';
import { formatDuration } from '../utils';

export const generateProductivityReport = async (logs: TimeLog[], categories: Category[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare data for the prompt
    // We filter for logs that have an end time and are substantial enough to matter (> 5 mins) for the summary
    const validLogs = logs.filter(l => l.endTime && (l.endTime - l.startTime) > 5 * 60 * 1000);
    
    const summaryData = validLogs.map(log => {
      const category = categories.find(c => c.id === log.categoryId)?.name || 'Unknown';
      const duration = formatDuration((log.endTime || 0) - log.startTime);
      const date = new Date(log.startTime).toLocaleDateString();
      return `Date: ${date}, Category: ${category}, Duration: ${duration}, Note: ${log.note || 'None'}`;
    }).join('\n');

    const systemPrompt = `
      You are a witty, insightful, and strict time-management coach based on the Lyubishchev method.
      Your goal is to analyze the user's time logs and provide a "Weekly Wrap-Up" report similar to Spotify Wrapped but for productivity.
      
      Format:
      1. **The Vibe**: A one-sentence summary of their week (e.g., "You were a deep-work demon this week" or "Looks like Netflix won the battle").
      2. **Key Stats**: Mention their top category and total hours tracked with a fun comment.
      3. **The Good**: Praise a positive pattern.
      4. **The Bad**: Gently roast a negative pattern (e.g., too much context switching, late nights).
      5. **Advice**: One actionable tip for next week.

      Keep it concise, use markdown for formatting, and be engaging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here are my time logs for the last 7 days:\n\n${summaryData}\n\nPlease generate my report.`,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: 0 }, // Fast response preferred
      }
    });

    return response.text || "Could not generate report.";

  } catch (error) {
    console.error("Error generating report:", error);
    return "Sorry, I couldn't generate your report at this time. Please check your API key or try again later.";
  }
};
