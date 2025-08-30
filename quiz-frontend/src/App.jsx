import React, { useState } from 'react';

const categories = [
  'Java', 'C', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL', 'Python', 'Spring Boot', 'Data Structures', 'Git', 'HTML & CSS'
];
const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const Header = () => (
  <header className="w-full max-w-3xl mx-auto mb-4 text-center">
    <div className="flex items-center justify-center space-x-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
        AI Quiz Master
      </h1>
    </div>
  </header>
);

const Stepper = ({ current, total }) => {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center mb-10 w-full max-w-3xl mx-auto px-4">
      {steps.map((step, index) => {
        const isCompleted = index < current;
        const isActive = index === current;

        return (
          <React.Fragment key={step}>
            {/* Step circle */}
            <div
              className={`relative flex items-center justify-center 
              w-10 h-10 md:w-12 md:h-12 rounded-full font-bold text-sm md:text-base
              transition-all duration-300
              ${isCompleted
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-110 shadow-lg ring-4 ring-indigo-200"
                    : "bg-gray-200 text-gray-600"
                }`}
            >
              {isCompleted ? "✔" : step}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 
                ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

function App() {
  const [gameState, setGameState] = useState('category-select');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const fetchQuestions = async (category, difficulty) => {
    setGameState('loading');
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/quiz/generate/${category}/${difficulty}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (!data || data.length === 0) throw new Error('No questions received from the server.');
      setQuestions(data);
      setGameState('in-progress');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setGameState('error');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setGameState('difficulty-select');
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    fetchQuestions(selectedCategory, difficulty);
  }

  const handleAnswerSelect = (option) => setSelectedAnswer(option);

  const handleNextQuestion = () => {
    setUserAnswers(prev => [...prev, selectedAnswer]);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setGameState('finished');
    }
  };

  const resetQuizState = (keepSelection = false) => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuestions([]);
    setUserAnswers([]);
    if (!keepSelection) {
      setSelectedCategory('');
      setSelectedDifficulty('');
    }
  };

  // --- NEW HANDLER ---
  const handleRegenerateQuiz = () => {
    resetQuizState(true); // true keeps category and difficulty
    fetchQuestions(selectedCategory, selectedDifficulty);
  };

  const handleBackToMenu = () => {
    setGameState('category-select');
    resetQuizState();
  };

  // --- UI Rendering Logic ---

  const renderCategorySelector = () => (
    <div className="text-center px-4">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Step 1: <span className="text-indigo-600">Select a Category</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className="p-5 rounded-2xl bg-white/70 backdrop-blur-lg shadow-md 
                     border border-gray-200 text-gray-800 font-semibold
                     hover:shadow-xl hover:scale-105 hover:bg-indigo-600 hover:text-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 
                     transition-all duration-300 ease-in-out"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );


  const renderDifficultySelector = () => (
    <div className="text-center px-4">
      {/* Back button */}
      <button
        onClick={() => setGameState("category-select")}
        className="text-indigo-600 hover:text-indigo-800 hover:underline mb-6 text-sm font-medium transition-colors"
      >
        &larr; Back to Categories
      </button>

      {/* Heading */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Step 2: <span className="text-green-600">Choose Difficulty</span> for{" "}
        <span className="text-indigo-600">{selectedCategory}</span>
      </h2>

      {/* Difficulty buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {difficulties.map((level) => (
          <button
            key={level}
            onClick={() => handleDifficultySelect(level)}
            className="p-5 rounded-2xl bg-white/70 backdrop-blur-lg shadow-md 
                     border border-gray-200 text-gray-800 font-semibold uppercase
                     hover:shadow-xl hover:scale-105 hover:bg-green-600 hover:text-white
                     focus:outline-none focus:ring-2 focus:ring-green-400 
                     transition-all duration-300 ease-in-out"
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );


  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      {/* Animated Gradient Spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
      </div>

      {/* Smooth Loading Text */}
      <p className="text-xl font-semibold text-gray-800 animate-pulse text-center">
        Preparing your{" "}
        <span className="text-blue-600 font-bold">{selectedDifficulty}</span>{" "}
        <span className="text-purple-600 font-bold">{selectedCategory}</span> quiz...
      </p>

      {/* Progress Indicator */}
      <div className="mt-6 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[progress_2s_linear_infinite]"></div>
      </div>

      {/* Keyframes for smooth bar movement */}
      <style>{`
      @keyframes progress {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
    </div>
  );


  const renderError = () => (
    <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl shadow-lg border border-red-200 animate-fade-in">
      {/* Error Icon */}
      <div className="mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-red-500 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364m12.728 0L5.636 5.636" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-extrabold text-red-700 mb-3">
        Oops! Something Went Wrong
      </h2>

      {/* Error Message */}
      <p className="text-lg text-red-600 mb-6 text-center max-w-md">
        {error || "An unexpected error occurred. Please try again later."}
      </p>

      {/* Action Button */}
      <button
        onClick={handleBackToMenu}
        className="px-8 py-3 bg-red-500 text-white font-semibold rounded-xl shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300"
      >
        Back to Menu
      </button>
    </div>
  );


  const renderQuiz = () => {
    if (questions.length === 0) return null;
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="p-6 md:p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-300">
        {/* Stepper */}
        <Stepper current={currentQuestionIndex} total={questions.length} />

        {/* Question Header */}
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-gray-500">
            Topic:{" "}
            <span className="text-indigo-600 font-semibold">
              {selectedCategory}
            </span>{" "}
            (
            <span className="text-green-600 font-semibold">
              {selectedDifficulty}
            </span>
            )
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 leading-snug">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`p-5 rounded-xl border text-left font-medium transition-all duration-300 ease-in-out
              ${selectedAnswer === option
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105 ring-2 ring-blue-300"
                  : "bg-white hover:bg-indigo-50 border-gray-300 text-gray-800 hover:shadow-md"
                }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <div className="mt-10 text-center">
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="w-full md:w-auto px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md 
                     hover:bg-indigo-700 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed 
                     transition-all duration-300"
          >
            {currentQuestionIndex < questions.length - 1
              ? "Next Question"
              : "Submit Quiz"}
          </button>
        </div>
      </div>
    );
  };


  // --- UPDATED FINISHED SCREEN ---
  const renderFinished = () => (
    <div className="flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl animate-fade-in">
      {/* Celebration Icon */}
      <div className="mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-yellow-500 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26 6.91.99-5 4.87 1.18 6.88L12 17.77l-6.18 3.23 1.18-6.88-5-4.87 6.91-.99L12 2z" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
        🎉 Quiz Completed!
      </h2>

      {/* Topic Info */}
      <p className="text-lg text-gray-600 mb-4">
        Topic:{" "}
        <span className="text-indigo-600 font-semibold">{selectedCategory}</span>{" "}
        (
        <span className="text-green-600 font-semibold">{selectedDifficulty}</span>
        )
      </p>

      {/* Score Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold py-6 px-10 rounded-2xl shadow-lg mb-8 transform transition-all duration-500 hover:scale-105">
        <p className="text-xl">Your Final Score</p>
        <p className="text-4xl mt-2">
          {score} / {questions.length}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setGameState("review")}
          className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
        >
          Review Answers
        </button>
        <button
          onClick={handleRegenerateQuiz}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300"
        >
          Try Again (New Questions)
        </button>
        <button
          onClick={handleBackToMenu}
          className="px-8 py-3 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 hover:shadow-lg transition-all duration-300"
        >
          Choose New Category
        </button>
      </div>

      {/* Fade-in Animation */}
      <style>{`
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.6s ease-out forwards;
      }
    `}</style>
    </div>
  );


  const renderReview = () => (
    <div className="p-6 md:p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg">
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-gray-900">
        📝 Answer Review:{" "}
        <span className="text-indigo-600">{selectedCategory}</span>
      </h2>

      {/* Scrollable Questions */}
      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          return (
            <div
              key={index}
              className="p-5 border rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Question */}
              <p className="font-semibold text-lg text-gray-800 mb-3">
                {index + 1}. {q.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((option) => {
                  const isCorrectAnswer = option === q.correctAnswer;
                  const isUserSelection = option === userAnswer;

                  let styles =
                    "border border-gray-300 bg-white text-gray-700";
                  if (isCorrectAnswer)
                    styles =
                      "bg-green-100 border-green-500 text-green-800 font-semibold shadow-sm";
                  else if (isUserSelection)
                    styles =
                      "bg-red-100 border-red-500 text-red-800 shadow-sm";

                  return (
                    <div
                      key={option}
                      className={`p-3 rounded-lg transition-all duration-200 ${styles}`}
                    >
                      {option}
                      {isCorrectAnswer && (
                        <span className="ml-2 text-green-600 font-bold">
                          ✔
                        </span>
                      )}
                      {isUserSelection && !isCorrectAnswer && (
                        <span className="ml-2 text-red-600 font-bold">
                          ✘
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setGameState("finished")}
          className="px-10 py-3 bg-gray-600 text-white font-bold rounded-xl shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300"
        >
          Back to Score
        </button>
      </div>

      {/* Custom scrollbar */}
      <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(99, 102, 241, 0.6); /* Indigo */
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(99, 102, 241, 0.9);
      }
    `}</style>
    </div>
  );


  const renderContent = () => {
    switch (gameState) {
      case 'category-select': return renderCategorySelector();
      case 'difficulty-select': return renderDifficultySelector();
      case 'loading': return renderLoading();
      case 'in-progress': return renderQuiz();
      case 'finished': return renderFinished();
      case 'review': return renderReview();
      case 'error': return renderError();
      default: return renderCategorySelector();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Header />
      <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
        {renderContent()}
      </div>
    </div>
  );

}

export default App;

