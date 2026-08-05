import { useState } from "react";

const SYSTEM_PROMPT = `You are a seasoned, published film photographer and Hasselblad Award recipient whose work has appeared in major publications worldwide. You teach at respected photography centers and universities and are known for making complex photographic concepts accessible to beginners and experts alike.

MISSION

Help photographers choose the film stock that best fits their creative vision and shooting conditions. Give one top recommendation and two thoughtful alternatives. The goal is not simply to recommend a film, but to help the user understand why it suits their situation and encourage them to continue experimenting with film photography.

For your top recommendation, include:
- Why this film stock fits their situation (color, grain, character, and overall aesthetic)
- A starting ISO
- PUSH/PULL RULE: Only include push_pull field content when pushing or pulling would specifically benefit THIS situation. If push/pull is not relevant, mention that it is not necessary. When you do include it, write one natural sentence about whether to push or pull for this specific scenario and why. Do not define what push/pull means in a textbook way every time. Do not end with "this decision must be made for the entire roll" for every option only firstmost to explain that it must be chosen and never changed midroll.
- Exposure notes
- Suggested aperture and shutter speed starting points when relevant

COMMUNICATION STYLE

Keep the tone warm, knowledgeable, and conversational, like a trusted professor rather than a manual.

Explain recommendations with enough technical detail to educate beginners while remaining useful to experienced photographers.

Write naturally and conversationally. Write in a composed tone — like a respected professor giving a lecture, not an enthusiastic assistant trying to impress.

EM DASH PROHIBITION: You are strictly forbidden from using em dashes anywhere in your response. This includes single em dashes and double em dashes. If you feel the urge to use an em dash, use a comma, a period, or rewrite the sentence instead. Do not use exclamation marks. Do not use casual filler words.

If someone asks something outside the world of film photography, respond with warmth and light humor while making it clear that this is outside your area of expertise.

RECOMMENDATION PRINCIPLES

Use every answer the user provides when forming your recommendation.

Treat the user's responses as a complete picture rather than focusing on a single factor.

Prioritize matching the user's desired mood and creative aesthetic while respecting practical considerations such as lighting conditions, film format, and real-world usability.

If there are tradeoffs between artistic intent and practical limitations (such as lighting, film format, or film availability), explain those tradeoffs naturally so the user understands your reasoning.

Consider both widely available and niche film stocks when appropriate.

If you are uncertain about a film stock or lack reliable knowledge about a newly released or obscure film, do not invent information. Instead, recommend the closest well-supported alternative.

When discussing ISO, always make clear that film ISO is set once for the entire roll before shooting begins — it cannot be changed mid-roll. Never suggest changing ISO partway through a shoot. If lighting conditions will vary significantly, note that the photographer should choose a stock and ISO that handles the expected range, or plan to shoot multiple rolls.

Avoid defaulting to the same popular recommendations when another film better matches the user's specific answers.

If multiple film stocks are strong choices, recommend the one that best matches the user's creative intent rather than simply choosing the safest or most versatile option.

Film photography is subjective. Encourage experimentation rather than presenting any recommendation as objectively "best."

Help the user understand why the recommendation fits instead of simply telling them what to shoot.

CineStill 800T is a tungsten balanced stock known for its cyan/teal cast and red halation around light sources. It suits neon lit urban night scenes and cinematic moody environments. Do not recommend it for warm, vintage, period, or daylight scenarios regardless of other factors.

When a user selects "experimental", recommend stocks that are genuinely suited to their conditions but less commonly chosen, not stocks that require extreme technical workarounds to function. Experimental means interesting and less mainstream, not technically risky or likely to produce poor results for the given conditions.

When recommending experimental stocks or techniques for night photography, always note practical requirements like tripod necessity and lab availability for unusual processes like cross-processing.

OUTPUT

Respond only in valid JSON.

Do not include markdown, code fences, explanations, or any text outside the JSON object.

Use this exact structure:

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
  {
    question: "Color or black and white, or open to either?",
    hint: "This will just help narrow down the recommendation.",
  },
  {
    question: "What vibe or mood are you going for?",
    hint: "What aesthetic are you going for? Moody, dreamy, gritty, etc. The more specific the better.",
  },
  {
    question:
      "What are your shooting conditions? Indoor or outdoor? What will lighting be like?",
    hint: "Ex. Bright sun, shade, tungsten, or golden hour. Different lighting calls for different stocks.",
  },
  {
    question: "What's the occasion or subject?",
    hint: "Are you taking portraits, street, concerts, landscapes, etc.?",
  },
  {
    question:
      "What format are you shooting? 35mm, medium format, or large format?",
    hint: "Some stocks are only avaiable in certain formats. ",
  },
  {
    question:
      "Are you looking for a classic reliable stock, or open to something more experimental and unique?",
    hint: "Classic stocks are tried and true. Experimental stocks can surprise you with unexpected results.",
  },
];

function App() {
  const [step, setStep] = useState("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState([]);
  const [results, setResults] = useState(null);
  const [expandedAlt, setExpandedAlt] = useState(null);
  const [error, setError] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  const getRecommendation = async (allAnswers) => {
    setError(null);

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

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/recommend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt,
            systemPrompt: SYSTEM_PROMPT,
          }),
        },
      );

      const data = await response.json();

      if (data.error) {
        setError(
          "Unable to get a recommendation right now. Please try again in a moment.",
        );
        setStep("questions");
        return;
      }

      const text = data.candidates[0].content.parts[0].text;
      try {
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        setResults(parsed);
        setStep("results");
      } catch (_error) {
        setError("Had trouble reading the recommendation. Please try again.");
        setStep("questions");
      }
    } catch (_error) {
      setError("Network error. Please check your connection and try again.");
      setStep("questions");
    }
  };

  const handleAnswer = () => {
    if (!currentAnswer.trim()) return;
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
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl text-[#f0ece4] font-normal text-center mb-4">
            Find your film
          </h1>
          <p className="text-gray-500 text-center max-w-md mb-4 text-xlg leading-relaxed font-['Playfair_Display']">
            with
          </p>
          <button
            onClick={() => setShowAbout(true)}
            className="text-md text-gray-400 tracking-widest uppercase hover:text-gray-400 transition-all duration-300 mb-8 font-['Playfair_Display'] cursor-help"
          >
            Film Advisor
          </button>
          {showAbout && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center px-6 z-50">
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg max-w-lg w-full p-8 max-h-[80vh] overflow-y-auto">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#f0ece4] font-normal mb-6">
                  About this project
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Film Advisor helps photographers discover film stocks that
                  match their shooting style, lighting conditions, and creative
                  goals. Answer a few questions to receive a personalized
                  recommendation, along with practical exposure tips and
                  starting settings to help you get the most from your roll.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Film Advisor was built to get thoughtful film stock
                  recommendations that explain why a particular film fits a
                  specific situation. My goal is to make choosing film a little
                  less overwhelming while encouraging photographers to keep
                  experimenting and developing their own style.
                </p>
                <h3 className="text-xs tracking-widest uppercase text-gray-600 mb-3 mt-6">
                  Transparency
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">
                  Recommendations are generated using Google's Gemini 2.5 Flash
                  based on the preferences you provide and a structured system
                  prompt designed around analog film photography. I built this
                  tool to help photographers of all levels narrow down film
                  choices. Think of it as a starting point rather than a
                  definitive answer you must adhere to.
                </p>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">
                  No personal user data is collected or stored.
                </p>
                <a
                  href="https://tally.so/r/rjQPjM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-gray-600 tracking-widest uppercase hover:text-gray-400 transition-all duration-300 mb-6"
                >
                  Give feedback
                </a>

                <button
                  onClick={() => setShowAbout(false)}
                  className="border border-gray-700 text-gray-400 text-xs tracking-widest uppercase px-6 py-3 hover:border-gray-400 hover:text-white transition-all duration-300 w-full"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          <p className="text-gray-500 text-center max-w-md mb-4 text-sm leading-relaxed">
            Answer a few questions and get a film stock recommendation.
          </p>
          <button
            onClick={() => setStep("questions")}
            className="border border-gray-700 text-gray-300 text-sm tracking-widest uppercase px-8 py-3 hover:border-gray-400 hover:text-white transition-all duration-300"
          >
            Get Started
          </button>

          <p className="text-xs text-gray-700 text-center mt-8 max-w-xs">
            On your phone? Tap the share button and "
            <span className="text-gray-400">Add to Home Screen</span>" to
            install this as an app.
          </p>
        </div>
      )}
      {step === "questions" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <p className="text-xs tracking-widest uppercase text-gray-600 mb-8">
            Question {questionIndex + 1} of {questions.length}
          </p>
          <p className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#f0ece4] font-normal text-center mb-3 max-w-lg">
            {questions[questionIndex].question}
          </p>
          {questions[questionIndex].hint && (
            <p className="text-gray-500 text-xs text-center mb-10 max-w-sm tracking-wide">
              {questions[questionIndex].hint}
            </p>
          )}
          <input
            type="text"
            placeholder="Type your answer here"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            maxLength={300}
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
          {error && (
            <p className="text-red-400 text-xs text-center tracking-wide mb-4 mt-2">
              {error}
            </p>
          )}
        </div>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <p className="text-xs tracking-widest uppercase text-gray-600 animate-pulse">
            Getting recommendation. Just a moment...
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
          <a
            href="https://tally.so/r/rjQPjM"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-gray-600 tracking-widest uppercase hover:text-gray-400 transition-all duration-300 mb-6"
          >
            Give feedback
          </a>

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
