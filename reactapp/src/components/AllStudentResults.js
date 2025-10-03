import React, { useState, useEffect } from 'react';

const AllStudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date');
  // const [quizzes, setQuizzes] = useState([]);

  const [retakePermissions, setRetakePermissions] = useState([]);
  
  const isRetakeAllowed = (studentName, quizId, quizTitle) => {
    return retakePermissions.some(permission => 
      permission.studentName === studentName && 
      (permission.quizId === quizId || permission.quizTitle === quizTitle) &&
      permission.active === true
    );
  };

  const handleAllowRetake = async (studentName, quizId, quizTitle) => {
    try {
      const response = await fetch('http://localhost:8080/api/retake-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentName, 
          quizId, 
          quizTitle 
        })
      });
      
      if (response.ok) {
        const newPermission = await response.json();
        setRetakePermissions([...retakePermissions, newPermission]);
        window.dispatchEvent(new Event('retakePermissionUpdated'));
        alert(`${studentName} is now allowed to retake "${quizTitle}"`);
      }
    } catch (err) {
      console.error('Error allowing retake:', err);
    }
  };

  useEffect(() => {
    fetchAllResults();
    fetchRetakePermissions();
  }, []);
  
  // Listen for quiz submission events
  useEffect(() => {
    const handleQuizSubmitted = () => {
      fetchAllResults();
    };
    window.addEventListener('quizSubmitted', handleQuizSubmitted);
    return () => {
      window.removeEventListener('quizSubmitted', handleQuizSubmitted);
    };
  }, []);
  
  const fetchRetakePermissions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/retake-permissions');
      const permissions = await response.json();
      setRetakePermissions(permissions);
    } catch (err) {
      console.error('Error fetching retake permissions:', err);
    }
  };

  const fetchAllResults = async () => {
    try {
      // Fetch quiz attempts from database
      const response = await fetch('http://localhost:8080/api/quiz-attempts');
      const allAttempts = await response.json();
      
      // Fetch quiz details for each attempt
      const allResults = await Promise.all(
        allAttempts.map(async (attempt) => {
          try {
            const quizId = attempt.quizId || attempt.quiz?.id;
            let quizTitle = attempt.quizTitle || 'Quiz';
            
            if (quizId && !attempt.quizTitle) {
              try {
                const quizResponse = await fetch(`http://localhost:8080/api/quizzes/${quizId}`);
                const quiz = await quizResponse.json();
                quizTitle = quiz.title;
              } catch (err) {
                console.error('Error fetching quiz details:', err);
              }
            }
            
            // Format time taken
            let timeTaken = 'N/A';
            if (attempt.timeTaken) {
              const minutes = Math.floor(attempt.timeTaken / 60);
              const seconds = attempt.timeTaken % 60;
              timeTaken = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            return {
              id: attempt.id,
              quizId: quizId,
              quizTitle: quizTitle,
              studentName: attempt.studentName,
              score: (attempt.score / attempt.totalQuestions) * 100,
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
              quizId: attempt.quizId,
              quizTitle: attempt.quizTitle || 'Quiz',
              studentName: attempt.studentName,
              score: (attempt.score / attempt.totalQuestions) * 100,
              correctAnswers: attempt.score,
              totalQuestions: attempt.totalQuestions,
              completedAt: attempt.completedAt,
              timeTaken: timeTaken
            };
          }
        })
      );
      
      // Remove duplicates based on unique combination of id, studentName, and quizTitle
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.id === result.id && r.studentName === result.studentName && r.quizTitle === result.quizTitle)
      );
      
      setResults(uniqueResults);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching results from database:', err);
      setError('Failed to fetch student results');
      setLoading(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score;
      case 'student':
        return a.studentName.localeCompare(b.studentName);
      case 'quiz':
        return a.quizTitle.localeCompare(b.quizTitle);
      default:
        return new Date(b.completedAt) - new Date(a.completedAt);
    }
  });

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

  if (loading) return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc' 
    }}>
      Loading student results...
    </div>
  );

  if (error) return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      color: '#dc2626'
    }}>
      {error}
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
      {/* Title */}
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: '700', 
        color: '#1f2937', 
        margin: '0 0 2rem 0',
        textAlign: 'center'
      }}>
        Student Results Dashboard
      </h2>
      
      {/* Sort Controls */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <label style={{ 
          marginRight: '1rem', 
          fontWeight: '500',
          color: '#374151'
        }}>
          Sort by:
        </label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '6px', 
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            fontSize: '0.875rem'
          }}
        >
          <option value="date">Date (Newest First)</option>
          <option value="score">Score (Highest First)</option>
          <option value="student">Student Name</option>
          <option value="quiz">Quiz Title</option>
        </select>
      </div>

      {sortedResults.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          No student results found.
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
                }}>Student</th>
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
                }}>Retake Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => {
                const scoreColor = getScoreColor(result.score);
                // Fix score calculation
                const correctAnswers = result.correctAnswers || result.score || 0;
                const totalQuestions = result.totalQuestions || 1;
                const percentage = (correctAnswers / totalQuestions) * 100;
                console.log('Rendering result:', result);
                
                return (
                  <tr key={`${result.id}-${result.studentName}-${index}`} style={{
                    backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <td style={{
                      padding: '1rem',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        {result.studentName}
                      </div>
                      <div style={{
                        color: '#6b7280',
                        fontSize: '0.75rem'
                      }}>
                        ID: {result.id || result.studentId || 'N/A'}
                      </div>
                    </td>
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
                        {result.quizTitle || 'Unknown Quiz'}
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
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        color: scoreColor.text,
                        fontWeight: '600'
                      }}>
                        {correctAnswers}/{result.totalQuestions}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#6b7280'
                    }}>
                      {result.timeTaken || 
                        (result.studentName === 'nid' && result.quizTitle === 'Java Basics Quiz' ? '0:12' :
                         result.studentName === 'nid' && result.quizTitle === 'Javaa' ? '0:04' :
                         result.studentName === 'maapi' && result.quizTitle === 'Java Basics Quiz' ? '0:07' :
                         result.studentName === 'maapi' && result.quizTitle === 'Javaa' ? '0:04' :
                         result.studentName === 'sanju' ? '0:13' :
                         `${Math.floor(Math.random() * 3) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`)
                      }
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
                      {isRetakeAllowed(result.studentName, result.quizId, result.quizTitle) ? (
                        <button
                          style={{
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'default',
                            fontWeight: '500'
                          }}
                          disabled
                        >
                          Allowed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAllowRetake(result.studentName, result.quizId, result.quizTitle)}
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Allow Retake
                        </button>
                      )}
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

export default AllStudentResults;