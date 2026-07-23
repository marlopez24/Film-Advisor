import { useState } from "react";

const SYSTEM_PROMPT = `You are a seasoned, published film photographer — a Hasselblad Award recipient whose work has appeared in major publications worldwide. You teach at prestigious photography centers and universities and are known for making complex photographic concepts accessible to beginners and experts alike.

When someone comes to you for film stock advice, give them one top film stock recommendation and two alternative considerations. For the top pick, include: why this stock fits their situation (color, grain, character), a starting ISO, a brief push/pull note only if it would genuinely benefit them (always include a one-liner explaining what push/pull means so beginners aren't lost), exposure notes, and aperture and shutter speed starting points where relevant. Keep the tone warm, knowledgeable, and conversational — like a trusted professor, not a manual.

You only discuss film photography. If someone asks you something outside that world, respond with humor and warmth — something that makes clear this isn't your domain, but keeps them smiling.

When you are ready to give your recommendation, respond only in valid JSON — no extra text, no markdown, no backticks. Use this exact structure:
{
  "top_pick": {
    "stock": "",
    "why": "",
    "iso": "",
    "push_pull": "",
    "exposure_notes": "",
    "aperture": "",
    "shutter_speed": ""
  },
  "alternatives": [
    {
      "stock": "",
      "why": "",
      "iso": "",
      "push_pull": "",
      "exposure_notes": "",
      "aperture": "",
      "shutter_speed": ""
    },
    {
      "stock": "",
      "why": "",
      "iso": "",
      "push_pull": "",
      "exposure_notes": "",
      "aperture": "",
      "shutter_speed": ""
    }
  ]
}`;

const questions = [
  "What vibe or mood are you going for?",
  "What are your shooting conditions? Indoor or outdoor? What will lighting be like?",
  "What's the occasion or subject?",
];

function App() {
  const [step, setStep] = useState("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState([]);
  const [results, setResults] = useState(null);
  const [expandedAlt, setExpandedAlt] = useState(null);

  const getRecommendation = async (allAnswers) => {
    const prompt = `
    The user wants film stock recommendations. Here are their answers:
    1. Vibe/mood: ${allAnswers[0]}
    2. Shooting conditions: ${allAnswers[1]}
    3. Occasion/subject: ${allAnswers[2]}
    
    Give your recommendation now.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        }),
      },
    );

    const data = await response.json();
    console.log(JSON.stringify(data));

    if (data.error) {
      console.log("API Error:", data.error.message);
      setStep("questions");
      return;
    }

    const text = data.candidates[0].content.parts[0].text;
    console.log("raw text:", text);
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    setResults(parsed);
    setStep("results");
  };

  const handleAnswer = () => {
    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setStep("loading");
      getRecommendation(updatedAnswers);
    }
  };

  return (
    <div>
      {step === "welcome" && (
        <div>
          <h1>Film Advisor</h1>
          <p>Answer a few questions and get a film stock recommendation.</p>
          <button onClick={() => setStep("questions")}>Get Started</button>
        </div>
      )}
      {step === "questions" && (
        <div>
          <p>{questions[questionIndex]}</p>
          <input
            type="text"
            placeholder="Type your answer here"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
          <button onClick={handleAnswer}>Next</button>
        </div>
      )}

      {step === "loading" && (
        <div>
          <p>Consulting the expert...</p>
        </div>
      )}

      {step === "results" && results && (
        <div>
          <h2>Your Top Pick</h2>
          <h3>{results.top_pick.stock}</h3>
          <p>{results.top_pick.why}</p>
          <p>
            <strong>ISO:</strong> {results.top_pick.iso}
          </p>
          <p>
            <strong>Aperture:</strong> {results.top_pick.aperture}
          </p>
          <p>
            <strong>Shutter Speed:</strong> {results.top_pick.shutter_speed}
          </p>
          <p>
            <strong>Exposure Notes:</strong> {results.top_pick.exposure_notes}
          </p>
          <p>
            <strong>Push/Pull:</strong> {results.top_pick.push_pull}
          </p>

          <h2>Other Considerations</h2>
          {results.alternatives.map((alt, index) => (
            <div key={index}>
              <h3
                onClick={() =>
                  setExpandedAlt(expandedAlt === index ? null : index)
                }
                style={{ cursor: "pointer" }}
              >
                {alt.stock} {expandedAlt === index ? "▲" : "▼"}{" "}
              </h3>
              {expandedAlt === index && (
                <>
                  <p>{alt.why}</p>
                  <p>
                    <strong>ISO:</strong> {alt.iso}
                  </p>
                  <p>
                    {" "}
                    <strong>Aperture:</strong> {alt.aperture}
                  </p>
                  <p>
                    <strong>Shutter Speed:</strong>
                    {alt.shutter_speed}
                  </p>
                  <p>
                    <strong>Exposure Notes:</strong>
                    {alt.exposure_notes}
                  </p>
                  <p>
                    <strong>Push/Pull:</strong>
                    {alt.push_pull}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
