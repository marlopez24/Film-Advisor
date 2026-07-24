import { useState } from "react";

const SYSTEM_PROMPT = `You are a seasoned, published film photographer — a Hasselblad Award recipient whose work has appeared in major publications worldwide. You teach at prestigious photography centers and universities and are known for making complex photographic concepts accessible to beginners and experts alike.

When someone comes to you for film stock advice, give them one top film stock recommendation and two alternative considerations. For the top pick, include: why this stock fits their situation (color, grain, character), a starting ISO, a brief push/pull note only if it would genuinely benefit them (always include a one-liner explaining what push/pull means so beginners aren't lost), exposure notes, and aperture and shutter speed starting points where relevant. Keep the tone warm, knowledgeable, and conversational — like a trusted professor, not a manual.

You only discuss film photography. If someone asks you something outside that world, respond with humor and warmth — something that makes clear this isn't your domain, but keeps them smiling. Draw from a wide and diverse range of film stocks including less common and professional options, not just popular consumer films. Prioritize matching the specific vibe and aesthetic the user describes over defaulting to safe mainstream recommendations. If the user describes something specific and artistic, reflect that in your choice. Never default to the same top pick twice in a row. Always consider what makes this specific user's situation unique.

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
  "Color or black and white, or open to either?",
  "What vibe or mood are you going for?",
  "What are your shooting conditions? Indoor or outdoor? What will lighting be like?",
  "What's the occasion or subject?",
  "What format are you shooting? 35mm, medium format, or large format?",
  "Are you looking for a classic reliable stock, or open to something more experimental and unique?",
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
    1. Color or black and white: ${allAnswers[0]}
    2. Vibe/mood: ${allAnswers[1]}
    3. Shooting conditions: ${allAnswers[2]}
    4. Occasion/subject: ${allAnswers[3]}
    5. Format: ${allAnswers[4]}
    6. Classic or experimental: ${allAnswers[5]}
    
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
    <div className="min-h-screen bg-[#111] text-gray-300 font-['Inter']">
      {step === "welcome" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <h1 className="text-xs tracking-widget uppercase text-gray-500 mb-4">
            Film Stock Advisor
          </h1>
          <p className="font-['Playfair_Display'] text-5xl md:text-7xl text-[#f0ece4] font-normal text-center mb-6">
            Find your film.
          </p>
          <p className="text-gray-500 text-center max-w-sm mb-10 text-sm leading-relaxed">
            Answer a few questions and get a film stock recommendation.
          </p>
          <button
            onClick={() => setStep("questions")}
            className="border border-gray-700 text-gray-300 text-sm tracking-widest uppercase px-8 py-3 hover:border-gray-400 hover:text-white transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      )}
      {step === "questions" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <p className="text-xs tracking-widest uppercase text-gray-600 mb-8">
            Question {questionIndex + 1} of {questions.length}
          </p>
          <p className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#f0ece4] font-normal text-center mb-10 max-w-lg">
            {questions[questionIndex]}
          </p>
          <input
            type="text"
            placeholder="Type your answer here"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full max-w-md bg-transparent border-b border-gray-700 text-gray-300 placeholder-gray-600 py-3 text-center focus:outline-none focus:border-gray-400 transition-all duration-300 mb-8"
          />
          <button
            onClick={handleAnswer}
            className="border border-gray-700 text-gray-300 text-sm tracking-widest uppercase px-8 py-3 hover:border-gray-400 hover:text-white transition-all duration-300"
          >
            {questionIndex < questions.length - 1
              ? "Next"
              : "Get Recommendation"}
          </button>
        </div>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <p className="text-xs tracking-widest uppercase text-gray-600 animate-pulse">
            Consulting the expert...
          </p>
        </div>
      )}
      {step === "results" && results && (
        <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-gray-600 mb-8 text-center">
            Your recommendation
          </p>

          <div className="border border-gray-800 rounded-lg overflow-hidden mb-6">
            <div className="p-8 border-b border-gray-800">
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-3">
                Top pick
              </p>
              <h2 className="font-['Playfair_Display'] text-4xl text-[#f0ece4] font-normal mb-4">
                {results.top_pick.stock}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {results.top_pick.why}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-gray-800">
              <div className="bg-[#111] p-5">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                  ISO
                </p>
                <p className="text-gray-300 text-sm">{results.top_pick.iso}</p>
              </div>
              <div className="bg-[#111] p-5">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                  Aperture
                </p>
                <p className="text-gray-300 text-sm">
                  {results.top_pick.aperture}
                </p>
              </div>
              <div className="bg-[#111] p-5">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                  Shutter speed
                </p>
                <p className="text-gray-300 text-sm">
                  {results.top_pick.shutter_speed}
                </p>
              </div>
              <div className="bg-[#111] p-5">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                  Exposure notes
                </p>
                <p className="text-gray-300 text-sm">
                  {results.top_pick.exposure_notes}
                </p>
              </div>
            </div>

            {results.top_pick.push_pull && (
              <div className="p-5 border-t border-gray-800">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                  Push / Pull
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {results.top_pick.push_pull}
                </p>
              </div>
            )}
          </div>

          <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">
            Other considerations
          </p>

          {results.alternatives.map((alt, index) => (
            <div
              key={index}
              className="border border-gray-800 rounded-lg mb-3 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedAlt(expandedAlt === index ? null : index)
                }
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-900 transition-all duration-300"
              >
                <span className="font-['Playfair_Display'] text-xl text-[#f0ece4]">
                  {alt.stock}
                </span>
                <span className="text-gray-600 text-sm">
                  {expandedAlt === index ? "↑" : "↓"}
                </span>
              </button>

              {expandedAlt === index && (
                <div className="border-t border-gray-800">
                  <div className="p-5 border-b border-gray-800">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {alt.why}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-gray-800">
                    <div className="bg-[#111] p-5">
                      <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                        ISO
                      </p>
                      <p className="text-gray-300 text-sm">{alt.iso}</p>
                    </div>
                    <div className="bg-[#111] p-5">
                      <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                        Aperture
                      </p>
                      <p className="text-gray-300 text-sm">{alt.aperture}</p>
                    </div>
                    <div className="bg-[#111] p-5">
                      <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                        Shutter speed
                      </p>
                      <p className="text-gray-300 text-sm">
                        {alt.shutter_speed}
                      </p>
                    </div>
                    <div className="bg-[#111] p-5">
                      <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                        Exposure notes
                      </p>
                      <p className="text-gray-300 text-sm">
                        {alt.exposure_notes}
                      </p>
                    </div>
                  </div>
                  {alt.push_pull && (
                    <div className="p-5 border-t border-gray-800">
                      <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">
                        Push / Pull
                      </p>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {alt.push_pull}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              setStep("welcome");
              setQuestionIndex(0);
              setAnswers([]);
              setResults(null);
              setExpandedAlt(null);
            }}
            className="w-full mt-6 border border-gray-800 text-gray-600 text-xs tracking-widest uppercase py-4 hover:border-gray-600 hover:text-gray-400 transition-all duration-300"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
