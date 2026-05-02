import { getFallbackSubtasks } from "@/lib/fallbackSubtasks";

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return Response.json(
        { error: "Task title is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "AI service is not configured. Please add GEMINI_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const prompt = `Generate exactly 5 actionable subtasks for this project task: "${title.trim()}"

Rules:
- Return ONLY a JSON array of strings, no other text
- Each subtask should be a clear, actionable step
- Keep each subtask concise (under 10 words)
- Order them logically (planning → implementation → testing)
- Do not include numbering or bullet points in the strings

Example output format:
["Design the UI mockup", "Set up project structure", "Implement core logic", "Add error handling", "Write unit tests"]`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `Gemini API error (${res.status})`;
      console.warn(`[AI Fallback Triggered] Gemini API error: ${errorMessage}`);
      return Response.json({ subtasks: getFallbackSubtasks(title) });
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.warn("[AI Fallback Triggered] Empty response from AI.");
      return Response.json({ subtasks: getFallbackSubtasks(title) });
    }

    // Extract JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.warn("[AI Fallback Triggered] Failed to parse AI response.");
      return Response.json({ subtasks: getFallbackSubtasks(title) });
    }

    const subtasks: string[] = JSON.parse(jsonMatch[0]);

    // Validate the parsed result
    if (!Array.isArray(subtasks) || subtasks.length === 0 || !subtasks.every((s: unknown) => typeof s === "string")) {
      console.warn("[AI Fallback Triggered] Invalid AI response format.");
      return Response.json({ subtasks: getFallbackSubtasks(title) });
    }

    return Response.json({ subtasks: subtasks.slice(0, 6) });
  } catch (error: any) {
    console.warn(`[AI Fallback Triggered] Caught exception: ${error.message}`);
    // If we couldn't even parse the title or an unexpected error happened during execution
    // we still try to return a fallback if we have the title, otherwise return the error
    try {
      const { title } = await request.clone().json();
      return Response.json({ subtasks: getFallbackSubtasks(title || "") });
    } catch {
      return Response.json({ subtasks: getFallbackSubtasks("") });
    }
  }
}
