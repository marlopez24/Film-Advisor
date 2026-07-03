import { useState } from "react";

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

  const handleAnswer = () => {
    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setStep("loading");
    }
  };

  return (
    <div>
      {step === "welcome" && (
        <div>
          <h1>Film Advisor</h1>
          <p>Answer a few questions and get a film stock recommendation.</p>
          <buttton onClick={() => setStep("questions")}>Get Started</buttton>
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
    </div>
  );
}

export default App;
