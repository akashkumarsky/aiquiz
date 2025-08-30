import React, { useState, useEffect } from 'react';

function App() {
  // State to manage the application's flow and data
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  // 'loading', 'in-progress', 'finished', 'error'
  const [quizState, setQuizState] = useState('loading');
  const [error, setError] = useState(null);

  // Function to fetch quiz questions from the Spring Boot backend
  const fetchQuestions = async () => {
    setQuizState('loading');
    setError(null);
    try {
      // The backend is running on port 8080 by default
      const response = await fetch('http://localhost:8080/api/quiz/generate');
      if (!response.ok) {
        throw new Error('Failed to fetch questions. Is the backend server running?');
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('No questions received from the server.');
      }
      setQuestions(data);
      setQuizState('in-progress');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setQuizState('error');
    }
  };

  // Fetch questions when the component first mounts
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Function to handle when a user selects an answer
  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };

  // Function to move to the next question or finish the quiz
  const handleNextQuestion = () => {
    // Check if the selected answer is correct and update the score
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }

    // Reset selected answer for the next question
    setSelectedAnswer(null);

    // Move to the next question or finish the quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizState('finished');
    }
  };

  // Function to restart the quiz
  const handleRestartQuiz = () => {
    // Reset all state variables to their initial values
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuestions([]);
    // Fetch a new set of questions
    fetchQuestions();
  };

  // --- Render Functions for Different States ---

  const renderLoading = () => (
    <div className="text-center p-8">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-xl font-semibold text-gray-700">Generating your quiz...</p>
      <p className="text-gray-500">Please wait a moment.</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-2xl font-bold text-red-700 mb-2">An Error Occurred</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={handleRestartQuiz}
        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const renderQuiz = () => {
    if (questions.length === 0) return null;
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <>
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
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

  const renderFinished = () => (
    <div className="text-center p-8">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Quiz Completed!</h2>
      <p className="text-xl text-gray-600 mb-6">
        Your final score is:
        <span className="font-bold text-blue-600 text-3xl block mt-2">{score} / {questions.length}</span>
      </p>
      <button
        onClick={handleRestartQuiz}
        className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transform hover:scale-105 transition-transform"
      >
        Take a New Quiz
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">Google API Quiz</h1>
        <p className="text-center text-gray-500 mb-8">Test your knowledge with AI-generated questions.</p>
        <div className="border-t border-gray-200 pt-6">
          {quizState === 'loading' && renderLoading()}
          {quizState === 'error' && renderError()}
          {quizState === 'in-progress' && renderQuiz()}
          {quizState === 'finished' && renderFinished()}
        </div>
      </div>
    </div>
  );
}

export default App;
