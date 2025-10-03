import React, { useState, useEffect } from 'react';
import './QuestionBank.css';
import { API_BASE_URL } from '../utils/constants';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const allQuestions = [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes`);
      const apiQuizzes = await response.json();
      
      for (const quiz of apiQuizzes) {
        try {
          const qResponse = await fetch(`${API_BASE_URL}/quizzes/${quiz.id}/questions`);
          const questions = await qResponse.json();
          questions.forEach(q => {
            allQuestions.push({
              ...q,
              quizId: quiz.id,
              quizTitle: quiz.title,
              source: 'database'
            });
          });
        } catch (err) {
          console.log('Failed to fetch questions for quiz:', quiz.id);
        }
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    }
    
    setQuestions(allQuestions);
    setLoading(false);
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: 'DELETE'
      });
      
      setQuestions(questions.filter(q => q.id !== questionId));
      window.dispatchEvent(new Event('questionsUpdated'));
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question');
    }
  };

  const startEdit = (question) => {
    setEditingQuestion(question.id);
    setEditForm({
      questionText: question.questionText,
      options: question.options.map(opt => ({ ...opt }))
    });
  };

  const saveEdit = async (questionId) => {
    const question = questions.find(q => q.id === questionId);
    const updatedQuestion = {
      questionText: editForm.questionText,
      questionType: question.questionType,
      options: editForm.options
    };
    
    try {
      await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedQuestion)
      });
      
      // Update the questions state immediately
      setQuestions(questions.map(q => q.id === questionId ? { 
        ...q, 
        questionText: editForm.questionText,
        options: editForm.options,
        source: 'database' 
      } : q));
      setEditingQuestion(null);
      setEditForm({});
      window.dispatchEvent(new Event('questionsUpdated'));
    } catch (err) {
      console.error('Error updating question:', err);
      alert('Failed to update question');
    }
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (optionIndex, field, value) => {
    const updatedOptions = [...editForm.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    
    if (field === 'isCorrect' && value) {
      updatedOptions.forEach((opt, idx) => {
        if (idx !== optionIndex) opt.isCorrect = false;
      });
    }
    
    setEditForm(prev => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    const newOption = { optionText: '', isCorrect: false };
    setEditForm(prev => ({ 
      ...prev, 
      options: [...prev.options, newOption] 
    }));
  };

  const removeOption = (optionIndex) => {
    if (editForm.options.length > 2) {
      const updatedOptions = editForm.options.filter((_, index) => index !== optionIndex);
      setEditForm(prev => ({ ...prev, options: updatedOptions }));
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    const quizTitle = q.quizTitle || `Quiz ID: ${q.quizId}`;
    return quizTitle === filter;
  });

  const questionsByQuiz = filteredQuestions.reduce((acc, question) => {
    const quizKey = question.quizTitle || `Quiz ID: ${question.quizId}`;
    if (!acc[quizKey]) {
      acc[quizKey] = [];
    }
    acc[quizKey].push(question);
    return acc;
  }, {});

  if (loading) return <div>Loading question bank...</div>;

  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      margin: 0, 
      padding: '2rem',
      backgroundColor: '#f8fafc',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: '700', 
        color: '#1f2937', 
        margin: '0 0 2rem 0',
        textAlign: 'center'
      }}>
        Question Bank Management
      </h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: '500' }}>Filter by quiz:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '6px', 
            border: '1px solid #d1d5db' 
          }}
        >
          <option value="all">All Quizzes</option>
          {[...new Set(questions.map(q => q.quizTitle || `Quiz ID: ${q.quizId}`))].map(quizTitle => (
            <option key={quizTitle} value={quizTitle}>{quizTitle}</option>
          ))}
        </select>
      </div>

      {Object.keys(questionsByQuiz).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          No questions found.
        </div>
      ) : (
        <div>
          {Object.entries(questionsByQuiz).map(([quizTitle, quizQuestions]) => (
            <div key={quizTitle} style={{ marginBottom: '3rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: '0 0 1.5rem 0',
                textAlign: 'left'
              }}>
                {quizTitle}
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1.5rem' 
              }}>
                {quizQuestions.map(question => (
                  <div key={question.id} style={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px', 
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      display: 'inline-block', 
                      marginBottom: '1rem',
                      marginTop: '2rem'
                    }}>
                      {question.questionType}
                    </div>
                    
                    {editingQuestion === question.id ? (
                      <div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Question Text:</label>
                          <textarea
                            value={editForm.questionText}
                            onChange={(e) => updateEditForm('questionText', e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          />
                        </div>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Options:</label>
                          {editForm.options && editForm.options.map((option, index) => (
                            <div key={index} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={option.optionText}
                                onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                              />
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={option.isCorrect}
                                  onChange={() => updateOption(index, 'isCorrect', true)}
                                />
                                Correct
                              </label>
                              {question.questionType === 'MULTIPLE_CHOICE' && editForm.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(index)}
                                  style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {question.questionType === 'MULTIPLE_CHOICE' && (
                            <button
                              onClick={addOption}
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                marginBottom: '1rem'
                              }}
                            >
                              + Add Option
                            </button>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => saveEdit(question.id)}
                            style={{ 
                              backgroundColor: '#10b981', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '0.5rem 1rem', 
                              cursor: 'pointer' 
                            }}
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingQuestion(null)}
                            style={{ 
                              backgroundColor: '#6b7280', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '0.5rem 1rem', 
                              cursor: 'pointer' 
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ 
                          color: '#374151', 
                          fontSize: '1rem', 
                          fontWeight: '500', 
                          margin: '0 0 1rem 0' 
                        }}>
                          {question.questionText}
                        </p>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          {question.options && question.options.map((option, index) => (
                            <div key={index} style={{ 
                              padding: '0.5rem', 
                              backgroundColor: option.isCorrect ? '#dcfce7' : '#f9fafb', 
                              borderRadius: '6px', 
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem'
                            }}>
                              {option.optionText} {option.isCorrect && '✓'}
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => startEdit(question)}
                            style={{ 
                              backgroundColor: '#3b82f6', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.875rem', 
                              cursor: 'pointer' 
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteQuestion(question.id)}
                            style={{ 
                              backgroundColor: '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.875rem', 
                              cursor: 'pointer' 
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBank;