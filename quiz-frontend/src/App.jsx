import React, { useState } from 'react';

// An array of quiz categories for the user to choose from
const categories = [
  'Java', 'C', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL', 'Python', 'Spring Boot', 'Data Structures', 'Git', 'HTML & CSS'
];

function App() {
  // New state to manage the view: 'category-select', 'loading', 'in-progress', 'finished', 'error'
  const [gameState, setGameState] = useState('category-select');

  // Existing state variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Updated function to fetch questions for a specific category
  const fetchQuestions = async (category) => {
    setGameState('loading');
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/quiz/generate/${category}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions. Is the backend server running? (Status: ${response.status})`);
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('No questions received. The API may be rate-limited or the category is invalid.');
      }
      setQuestions(data);
      setGameState('in-progress');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setGameState('error');
    }
  };

  // Handler for when a user selects a category
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchQuestions(category);
  };

  // Handler for selecting an answer
  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };

  // Handler for moving to the next question or finishing
  const handleNextQuestion = () => {
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

  // Resets all state to go back to the category selection screen
  const handleBackToMenu = () => {
    setGameState('category-select');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuestions([]);
    setSelectedCategory('');
  };

  // --- UI Rendering Logic ---

  // Renders the initial category selection screen
  const renderCategorySelector = () => (
    <div className="text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Select a Quiz Category</h1>
      <p className="text-center text-gray-500 mb-8">Choose a topic to test your knowledge.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className="p-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-transform duration-200"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );

  // Renders the loading spinner
  const renderLoading = () => (
    <div className="text-center p-8">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-xl font-semibold text-gray-700">Generating your {selectedCategory} quiz...</p>
      <p className="text-gray-500">Please wait a moment.</p>
    </div>
  );

  // Renders an error message
  const renderError = () => (
    <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-2xl font-bold text-red-700 mb-2">An Error Occurred</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={handleBackToMenu}
        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
      >
        Try a Different Category
      </button>
    </div>
  );

  // Renders the active quiz interface
  const renderQuiz = () => {
    if (questions.length === 0) return null;
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <>
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length} | Topic: {selectedCategory}
          </p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{currentQuestion.question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`p-4 border rounded-lg text-left transition-all duration-200 ${selectedAnswer === option
                ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300'
                : 'bg-white hover:bg-gray-100 border-gray-300'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </button>
        </div>
      </>
    );
  };

  // Renders the final score screen
  const renderFinished = () => (
    <div className="text-center p-8">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Quiz Completed!</h2>
      <p className="text-lg text-gray-500 mb-4">Topic: {selectedCategory}</p>
      <p className="text-xl text-gray-600 mb-6">
        Your final score is:
        <span className="font-bold text-blue-600 text-3xl block mt-2">{score} / {questions.length}</span>
      </p>
      <button
        onClick={handleBackToMenu}
        className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transform hover:scale-105 transition-transform"
      >
        Choose New Category
      </button>
    </div>
  );

  // Main render function that decides which component to show
  const renderContent = () => {
    switch (gameState) {
      case 'category-select':
        return renderCategorySelector();
      case 'loading':
        return renderLoading();
      case 'in-progress':
        return renderQuiz();
      case 'finished':
        return renderFinished();
      case 'error':
        return renderError();
      default:
        return renderCategorySelector();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;

