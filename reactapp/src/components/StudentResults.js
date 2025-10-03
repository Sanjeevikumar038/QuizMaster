import React, { useState, useEffect, useCallback } from 'react';
import './ModernUI.css';
import { API_BASE_URL } from '../utils/constants';

const StudentResults = ({ studentId = 'current-student' }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      const currentStudentName = localStorage.getItem('username') || 'Student';
      console.log('Fetching results for student:', currentStudentName);
      
      // Fetch quiz attempts from database
      const response = await fetch(`${API_BASE_URL}/quiz-attempts`);
      const allAttempts = await response.json();
      console.log('StudentResults - All attempts:', allAttempts);
      
      // Filter attempts for current student
      const studentAttempts = allAttempts.filter(attempt => 
        attempt.studentName === currentStudentName
      );
      console.log('StudentResults - Filtered attempts for', currentStudentName, ':', studentAttempts);
      
      // Fetch quiz details for each attempt
      const studentResults = await Promise.all(
        studentAttempts.map(async (attempt) => {
          try {
            const quizId = attempt.quizId || attempt.quiz?.id;
            const quizResponse = await fetch(`${API_BASE_URL}/quizzes/${quizId}`);
            const quiz = await quizResponse.json();
            
            // Format time taken
            let timeTaken = 'N/A';
            if (attempt.timeTaken) {
              const minutes = Math.floor(attempt.timeTaken / 60);
              const seconds = attempt.timeTaken % 60;
              timeTaken = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            return {
              id: attempt.id,
              quizTitle: attempt.quizTitle || quiz.title,
              studentName: attempt.studentName,
              score: attempt.score,
              correctAnswers: attempt.score,
              totalQuestions: attempt.totalQuestions,
              completedAt: attempt.completedAt,
              timeTaken: timeTaken
            };
          } catch (err) {
            console.error('Error fetching quiz details:', err);
            
            // Format time taken for fallback
            let timeTaken = 'N/A';
            if (attempt.timeTaken) {
              const minutes = Math.floor(attempt.timeTaken / 60);
              const seconds = attempt.timeTaken % 60;
              timeTaken = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            return {
              id: attempt.id,
              quizTitle: attempt.quizTitle || 'Quiz',
              studentName: attempt.studentName,
              score: attempt.score,
              correctAnswers: attempt.score,
              totalQuestions: attempt.totalQuestions,
              completedAt: attempt.completedAt,
              timeTaken: timeTaken
            };
          }
        })
      );
      
      // Sort by completion date (latest first)
      const sortedResults = studentResults.sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
      );
      
      setResults(sortedResults);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching results from database:', err);
      setResults([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    
    // Listen for quiz submission events
    const handleQuizSubmitted = () => {
      console.log('Quiz submitted event received, refreshing results...');
      fetchResults();
    };
    
    window.addEventListener('quizSubmitted', handleQuizSubmitted);
    
    return () => {
      window.removeEventListener('quizSubmitted', handleQuizSubmitted);
    };
  }, [fetchResults]);

  if (loading) return (
    <div className="modern-loading">
      <div className="modern-spinner"></div>
      Loading your results...
    </div>
  );

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
        My Quiz Results
      </h2>
      
      {results.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          No quiz results found. Take some quizzes to see your results here!
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#3b82f6',
                color: 'white'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Quiz</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Score</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Correct/Total</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Time Taken</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                // result.score is the number of correct answers from database
                const correctAnswers = result.score || 0;
                const totalQuestions = result.totalQuestions || 1;
                const percentage = Math.round((correctAnswers / totalQuestions) * 100);
                const getScoreColor = (score) => {
                  if (score >= 80) return { bg: '#dcfce7', text: '#065f46' };
                  if (score >= 60) return { bg: '#fef3c7', text: '#92400e' };
                  return { bg: '#fef2f2', text: '#dc2626' };
                };
                const getScoreIcon = (score) => {
                  if (score >= 80) return '🏆';
                  if (score >= 60) return '✅';
                  return '📚';
                };
                const scoreColor = getScoreColor(percentage);
                
                return (
                  <tr key={result.id} style={{
                    backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <td style={{
                      padding: '1rem',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {result.quizTitle || 'Quiz'}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: scoreColor.bg,
                        color: scoreColor.text,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        <span>{getScoreIcon(percentage)}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {correctAnswers}/{totalQuestions}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#6b7280'
                    }}>
                      {result.timeTaken || 'N/A'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: percentage >= 60 ? '#dcfce7' : '#fef2f2',
                        color: percentage >= 60 ? '#065f46' : '#dc2626',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {percentage >= 60 ? '✅ Passed' : '❌ Failed'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentResults;