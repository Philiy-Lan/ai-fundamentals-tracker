import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an encouraging AI tutor evaluating a learner's explanation.
Evaluate the explanation against the concept area. Be warm and specific.
Return ONLY valid JSON matching this schema exactly — no other text, no markdown:

{
  "score": <integer 1-5>,
  "pass": <boolean, true if score >= 3>,
  "correct": [<string bullet, what was right>],
  "missed": [<string bullet, what to improve>]
}

Score guide: 1=major errors, 2=partial, 3=core correct with gaps, 4=strong, 5=complete.
Tone: encouraging, never punitive. Bullets: plain English, 1-4 items each.`

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { moduleId, conceptArea, explanation } = req.body ?? {}

  if (!explanation?.trim()) {
    return res.status(400).json({ error: "explanation required" })
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Concept area: ${conceptArea ?? "General"}\n\nExplanation: ${explanation}`,
        },
      ],
    })

    const raw = message.content[0].text
    // Defensive: extract only the JSON object
    const jsonStart = raw.indexOf("{")
    const jsonEnd = raw.lastIndexOf("}")
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))

    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: "Evaluation failed" })
  }
}
