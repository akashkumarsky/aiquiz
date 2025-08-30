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
    <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 ${index < current ? 'bg-green-500' : index === current ? 'bg-blue-500 scale-110' : 'bg-gray-300'}`}>
            {index < current ? '✔' : step}
          </div>
          {index < steps.length - 1 && <div className={`h-1 flex-1 transition-colors duration-300 ${index < current ? 'bg-green-500' : 'bg-gray-300'}`}></div>}
        </React.Fragment>
      ))}
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
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Step 1: Select a Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {categories.map(category => (
          <button key={category} onClick={() => handleCategorySelect(category)} className="p-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-transform duration-200">
            {category}
          </button>
        ))}
      </div>
    </div>
  );

  const renderDifficultySelector = () => (
    <div className="text-center">
      <button onClick={() => setGameState('category-select')} className="text-indigo-600 hover:underline mb-4 text-sm">&larr; Back to Categories</button>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Step 2: Choose Difficulty for {selectedCategory}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {difficulties.map(level => (
          <button key={level} onClick={() => handleDifficultySelect(level)} className="p-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transform hover:scale-105 transition-transform duration-200">
            {level}
          </button>
        ))}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center p-8">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-xl font-semibold text-gray-700">Generating your {selectedDifficulty} {selectedCategory} quiz...</p>
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
          <p className="text-sm font-medium text-gray-500">Topic: {selectedCategory} ({selectedDifficulty})</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{currentQuestion.question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => <button key={index} onClick={() => handleAnswerSelect(option)} className={`p-4 border rounded-lg text-left transition-all duration-200 ${selectedAnswer === option ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>{option}</button>)}
        </div>
        <div className="mt-8 text-center">
          <button onClick={handleNextQuestion} disabled={!selectedAnswer} className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </button>
        </div>
      </>
    );
  };

  // --- UPDATED FINISHED SCREEN ---
  const renderFinished = () => (
    <div className="text-center p-8">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Quiz Completed!</h2>
      <p className="text-lg text-gray-500 mb-4">Topic: {selectedCategory} ({selectedDifficulty})</p>
      <p className="text-xl text-gray-600 mb-6">Your final score is:
        <span className="font-bold text-blue-600 text-3xl block mt-2">{score} / {questions.length}</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => setGameState('review')} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600">
          Review Answers
        </button>
        <button onClick={handleRegenerateQuiz} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700">
          Try Again (New Questions)
        </button>
        <button onClick={handleBackToMenu} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600">
          Choose New Category
        </button>
      </div>
    </div>
  );

  const renderReview = () => (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6">Answer Review: {selectedCategory}</h2>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          return (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <p className="font-bold text-lg text-gray-800">{index + 1}. {q.question}</p>
              <div className="mt-3 space-y-2">
                {q.options.map(option => {
                  const isCorrectAnswer = option === q.correctAnswer;
                  const isUserSelection = option === userAnswer;
                  let styles = 'border-gray-300';
                  if (isCorrectAnswer) styles = 'bg-green-100 border-green-500 text-green-800 font-semibold';
                  else if (isUserSelection) styles = 'bg-red-100 border-red-500 text-red-800';
                  return <div key={option} className={`p-3 border rounded-md ${styles}`}>{option}</div>;
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

