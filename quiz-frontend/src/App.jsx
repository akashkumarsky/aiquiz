import React, { useState } from 'react';

// An array of quiz categories for the user to choose from
const categories = [
  'Java', 'C', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL', 'Python', 'Spring Boot', 'Data Structures', 'Git', 'HTML & CSS'
];

// Stepper component for visual progress
const Stepper = ({ current, total }) => {
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 ${index < current ? 'bg-green-500' : index === current ? 'bg-blue-500 scale-110' : 'bg-gray-300'
                }`}
            >
              {index < current ? '✔' : step}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-1 flex-1 transition-colors duration-300 ${index < current ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

function App() {
  // Game states: 'category-select', 'loading', 'in-progress', 'finished', 'review', 'error'
  const [gameState, setGameState] = useState('category-select');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]); // <-- NEW: To store user's answers
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchQuestions = async (category) => {
    setGameState('loading');
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/quiz/generate/${category}`;
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
    fetchQuestions(category);
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };

  const handleNextQuestion = () => {
    // Store user's answer before moving on
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

  const resetQuizState = (keepCategory = false) => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuestions([]);
    setUserAnswers([]);
    if (!keepCategory) {
      setSelectedCategory('');
    }
  };

  const handleRegenerateQuiz = () => {
    resetQuizState(true); // Keep the category
    fetchQuestions(selectedCategory);
  };

  const handleBackToMenu = () => {
    setGameState('category-select');
    resetQuizState();
  };

  // --- UI Rendering Logic ---

  const renderCategorySelector = () => (
    <div className="text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Select a Quiz Category</h1>
      <p className="text-center text-gray-500 mb-8">Choose a topic to test your knowledge.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(category => (
          <button key={category} onClick={() => handleCategorySelect(category)} className="p-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-transform duration-200">
            {category}
          </button>
        ))}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center p-8">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-xl font-semibold text-gray-700">Generating your {selectedCategory} quiz...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
      <h2 className="text-2xl font-bold text-red-700 mb-2">An Error Occurred</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={handleBackToMenu} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600">
        Back to Menu
      </button>
    </div>
  );

  const renderQuiz = () => {
    if (questions.length === 0) return null;
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <>
        <Stepper current={currentQuestionIndex} total={questions.length} />
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-gray-500">Topic: {selectedCategory}</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{currentQuestion.question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button key={index} onClick={() => handleAnswerSelect(option)} className={`p-4 border rounded-lg text-left transition-all duration-200 ${selectedAnswer === option ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>
              {option}
            </button>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button onClick={handleNextQuestion} disabled={!selectedAnswer} className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </button>
        </div>
      </>
    );
  };

  const renderFinished = () => (
    <div className="text-center p-8">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Quiz Completed!</h2>
      <p className="text-lg text-gray-500 mb-4">Topic: {selectedCategory}</p>
      <p className="text-xl text-gray-600 mb-6">Your final score is:
        <span className="font-bold text-blue-600 text-3xl block mt-2">{score} / {questions.length}</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => setGameState('review')} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600">
          Review Answers
        </button>
        <button onClick={handleRegenerateQuiz} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700">
          Try Again
        </button>
        <button onClick={handleBackToMenu} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600">
          New Category
        </button>
      </div>
    </div>
  );

  // --- NEW REVIEW COMPONENT ---
  const renderReview = () => (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6">Answer Review: {selectedCategory}</h2>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === q.correctAnswer;
          return (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <p className="font-bold text-lg text-gray-800">{index + 1}. {q.question}</p>
              <div className="mt-3 space-y-2">
                {q.options.map(option => {
                  const isCorrectAnswer = option === q.correctAnswer;
                  const isUserSelection = option === userAnswer;

                  let styles = 'border-gray-300';
                  if (isCorrectAnswer) styles = 'bg-green-100 border-green-500 text-green-800 font-semibold';
                  else if (isUserSelection && !isCorrect) styles = 'bg-red-100 border-red-500 text-red-800';

                  return (
                    <div key={option} className={`p-3 border rounded-md ${styles}`}>
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <button onClick={() => setGameState('finished')} className="px-8 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600">
          Back to Score
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (gameState) {
      case 'category-select': return renderCategorySelector();
      case 'loading': return renderLoading();
      case 'in-progress': return renderQuiz();
      case 'finished': return renderFinished();
      case 'review': return renderReview(); // <-- Add review case
      case 'error': return renderError();
      default: return renderCategorySelector();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;

