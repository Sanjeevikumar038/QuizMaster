import React, { useState, useEffect } from 'react';
import './ModernUI.css';

const ModernQuizCreation = ({ onQuizCreated }) => {
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    duration: 30,
    questions: []
  });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAvailableQuestions();
  }, []);
  
  // Listen for question updates
  useEffect(() => {
    const handleQuestionsUpdated = () => {
      loadAvailableQuestions();
    };
    window.addEventListener('questionsUpdated', handleQuestionsUpdated);
    return () => {
      window.removeEventListener('questionsUpdated', handleQuestionsUpdated);
    };
  }, []);

  const loadAvailableQuestions = async () => {
    try {
      const allQuestions = [];
      
      // Fetch all quizzes and their questions from database
      const response = await fetch('http://localhost:8080/api/quizzes');
      const apiQuizzes = await response.json();
      
      for (const quiz of apiQuizzes) {
        try {
          const qResponse = await fetch(`http://localhost:8080/api/quizzes/${quiz.id}/questions`);
          const questions = await qResponse.json();
          questions.forEach(q => {
            allQuestions.push({
              ...q,
              quizId: quiz.id,
              quizTitle: quiz.title
            });
          });
        } catch (err) {
          console.log('Failed to fetch questions for quiz:', quiz.id);
        }
      }
      
      setAvailableQuestions(allQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (selectedQuestions.length === 0) {
        setMessage('Please select at least one question for the quiz.');
        setLoading(false);
        return;
      }

      const selectedQuestionObjects = availableQuestions.filter(q => 
        selectedQuestions.includes(q.id)
      );

      // Create quiz in database
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.duration
      };
      
      const response = await fetch('http://localhost:8080/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });
      
      if (response.ok) {
        const newQuiz = await response.json();
        
        // Add selected questions to the quiz
        for (const questionId of selectedQuestions) {
          const question = availableQuestions.find(q => q.id === questionId);
          if (question) {
            const questionData = {
              questionText: question.questionText,
              questionType: question.questionType,
              options: question.options
            };
            
            await fetch(`http://localhost:8080/api/quizzes/${newQuiz.id}/questions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(questionData)
            });
          }
        }
        
        setMessage('Quiz created successfully!');
        setQuiz({ title: '', description: '', duration: 30, questions: [] });
        setSelectedQuestions([]);
        
        // Notify other components that quizzes were updated
        window.dispatchEvent(new Event('quizzesUpdated'));
        
        if (onQuizCreated) {
          onQuizCreated();
        }
      } else {
        throw new Error('Failed to create quiz');
      }
    } catch (error) {
      setMessage('Error creating quiz. Please try again.');
      console.error('Error creating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-quiz-creation">
      <div className="modern-card">
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Create New Quiz
        </h2>

        <form onSubmit={handleSubmit} className="modern-form" style={{ padding: 0 }}>
          <div className="modern-form-group">
            <label className="modern-form-label">Quiz Title</label>
            <input
              type="text"
              name="title"
              value={quiz.title}
              onChange={handleInputChange}
              className="modern-form-input"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">Description</label>
            <textarea
              name="description"
              value={quiz.description}
              onChange={handleInputChange}
              className="modern-form-input"
              placeholder="Enter quiz description"
              rows="3"
              required
            />
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={quiz.duration}
              onChange={handleInputChange}
              className="modern-form-input"
              min="1"
              max="180"
              required
            />
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">
              Select Questions ({selectedQuestions.length} selected)
            </label>
            
            {availableQuestions.length === 0 ? (
              <div className="modern-alert modern-alert-warning">
                No questions available. Please add questions to the question bank first.
              </div>
            ) : (
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius)',
                padding: '1rem'
              }}>
                {availableQuestions.map(question => (
                  <div key={question.id} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedQuestions.includes(question.id) ? '#f0f9ff' : 'white'
                  }}>
                    <input
                      type="checkbox"
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleQuestionToggle(question.id)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <label 
                      htmlFor={`question-${question.id}`}
                      style={{ 
                        flex: 1, 
                        textAlign: 'left', 
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {question.questionText}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: '1rem'
                      }}>
                        <span>Type: {question.type}</span>
                        <span>Options: {question.options?.length || 0}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className={`modern-alert ${message.includes('Error') ? 'modern-alert-danger' : 'modern-alert-success'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="modern-btn modern-btn-primary"
            disabled={loading || availableQuestions.length === 0}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="modern-spinner" style={{ width: '1rem', height: '1rem', margin: 0, marginRight: '0.5rem' }}></div>
                Creating Quiz...
              </>
            ) : (
              'Create Quiz'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModernQuizCreation;