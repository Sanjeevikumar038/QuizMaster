import React, { useState, useEffect } from 'react';
import EmailService from './EmailService';
import { API_BASE_URL } from '../utils/constants';

const EmailNotifications = () => {
  const [emailStats, setEmailStats] = useState({
    remindersSent: 0,
    resultsSent: 0,
    activeStudents: 0,
    totalEmails: 0,
    recentReminders: [],
    recentResults: []
  });
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const quizzesResponse = await fetch(`${API_BASE_URL}/quizzes`);
      if (!quizzesResponse.ok) {
        throw new Error(`Failed to fetch quizzes: ${quizzesResponse.status}`);
      }
      const quizzesData = await quizzesResponse.json();
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      
      const stats = await EmailService.getEmailStats();
      setEmailStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendQuizReminders = async () => {
    if (!selectedQuiz) {
      setMessage('Please select a quiz first');
      return;
    }

    setSending(true);
    setMessage('Sending reminders...');

    const quiz = quizzes.find(q => q.id.toString() === selectedQuiz);
    
    try {
      const result = await EmailService.sendNewQuizNotification(quiz);
      
      if (result.success) {
        setMessage(`✅ Sent ${result.count} reminder emails successfully!`);
        await loadData();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Failed to send reminders');
      console.error('Error sending reminders:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const reminderEmails = emailStats.recentReminders || [];
  const resultEmails = emailStats.recentResults || [];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading email management...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626' }}>❌</div>
          <div style={{ color: '#dc2626', fontWeight: '600', marginBottom: '1rem' }}>Error Loading Email Management</div>
          <div style={{ color: '#6b7280', marginBottom: '1rem' }}>{error}</div>
          <button 
            onClick={loadData}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 0.5rem 0'
          }}>
            📧 Email Management
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Send reminders and track email notifications
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {emailStats.remindersSent}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Reminders Sent</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {emailStats.resultsSent}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Results Sent</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #8b5cf6'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {emailStats.activeStudents}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Active Students</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {emailStats.totalEmails}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Emails</div>
          </div>
        </div>

        {/* Automatic Email Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '2px solid #dbeafe'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🤖 Automatic Email System
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                fontSize: '1.5rem',
                marginBottom: '0.5rem'
              }}>📧</div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#166534',
                marginBottom: '0.5rem'
              }}>Reminder Emails</h3>
              <p style={{
                color: '#166534',
                fontSize: '0.875rem',
                margin: 0
              }}>Automatically sent to all students when new quizzes are created</p>
            </div>
            
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{
                fontSize: '1.5rem',
                marginBottom: '0.5rem'
              }}>📊</div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '0.5rem'
              }}>Result Emails</h3>
              <p style={{
                color: '#1e40af',
                fontSize: '0.875rem',
                margin: 0
              }}>Automatically sent to students when they complete quizzes</p>
            </div>
          </div>
        </div>

        {/* Manual Send Reminder Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            ⏰ Manual Reminder
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>Send additional reminders for existing quizzes</p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Select Quiz
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">Choose a quiz...</option>
              {Array.isArray(quizzes) && quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={sendQuizReminders}
            disabled={sending || !selectedQuiz}
            style={{
              backgroundColor: selectedQuiz && !sending ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: selectedQuiz && !sending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              transform: selectedQuiz && !sending ? 'translateY(0)' : 'none'
            }}
            onMouseOver={(e) => {
              if (selectedQuiz && !sending) {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedQuiz && !sending) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {sending ? '⏳ Sending...' : '📤 Send Additional Reminder'}
          </button>

          {message && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: message.includes('❌') ? '#fef2f2' : '#f0fdf4',
              color: message.includes('❌') ? '#dc2626' : '#166534',
              border: `1px solid ${message.includes('❌') ? '#fecaca' : '#bbf7d0'}`,
              fontSize: '0.875rem'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Email Tables */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          
          {/* Reminder Emails */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⏰ Reminder Emails
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px'
              }}>
                {emailStats.remindersSent}
              </span>
            </h3>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              {reminderEmails.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>No reminder emails sent yet</p>
                </div>
              ) : (
                reminderEmails.slice(-10).reverse().map((email, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    borderBottom: index < reminderEmails.slice(-10).length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#1e293b',
                        fontSize: '0.875rem'
                      }}>
                        {email.email}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        {formatDate(email.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Result Emails */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Result Emails
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px'
              }}>
                {emailStats.resultsSent}
              </span>
            </h3>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              {resultEmails.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                  <p>No result emails sent yet</p>
                </div>
              ) : (
                resultEmails.slice(-10).reverse().map((email, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    borderBottom: index < resultEmails.slice(-10).length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#1e293b',
                        fontSize: '0.875rem'
                      }}>
                        {email.email}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        {formatDate(email.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;