import React, { useState } from 'react';
import axios from 'axios';
import { useToast, ToastContainer } from './Toast';
import { API_BASE_URL } from '../utils/constants';
import { showNotification } from './NotificationSystem';
import EmailService from './EmailService';

const QuizForm = ({ onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [errors, setErrors] = useState({});
  const { toasts, addToast, removeToast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!title || title.length < 3 || title.length > 100) {
      newErrors.title = 'Quiz title must be between 3 and 100 characters.';
    }
    if (!description || description.length < 5) {
      newErrors.description = 'Quiz description is required (minimum 5 characters).';
    }

    const parsedTimeLimit = parseInt(timeLimit);
    if (isNaN(parsedTimeLimit) || parsedTimeLimit < 1 || parsedTimeLimit > 180) {
      newErrors.timeLimit = 'Time limit must be a number between 1 and 180 minutes.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

try {
const newQuiz = { title, description, timeLimit: parseInt(timeLimit) };
const response = await axios.post(`${API_BASE_URL}/quizzes`, newQuiz);
const createdQuiz = response.data;

addToast('Quiz created successfully!', 'success');
showNotification('quiz', `Quiz "${title}" created successfully!`, 4000);

// Send reminder emails to all students
try {
  const emailResult = await EmailService.sendNewQuizNotification(createdQuiz);
  if (emailResult.success) {
    showNotification('email', `📧 Reminder emails sent to ${emailResult.count} students!`, 4000);
  }
} catch (emailError) {
  console.error('Failed to send reminder emails:', emailError);
}

setTitle('');
setDescription('');
setTimeLimit('');
setErrors({});
onQuizCreated();
} catch (err) {
addToast('Failed to create quiz. Please try again.', 'error');
showNotification('error', 'Failed to create quiz. Please try again.', 4000);
}
};

return (
<div className="quiz-form-container">
<h2>Create New Quiz</h2>
<form onSubmit={handleSubmit} className="quiz-form">
<div className="form-group">
<label htmlFor="title-input">Title</label>
<input
type="text"
id="title-input"
value={title}
onChange={(e) => setTitle(e.target.value)}
placeholder="Enter quiz title (e.g., Java Basics Quiz)"
/>
{errors.title && <span className="error-message">{errors.title}</span>}
</div>
<div className="form-group">
<label htmlFor="description-input">Description</label>
<textarea
id="description-input"
value={description}
onChange={(e) => setDescription(e.target.value)}
placeholder="Enter quiz description"
/>
{errors.description && <span className="error-message">{errors.description}</span>}
</div>
<div className="form-group">
<label htmlFor="timeLimit">Time Limit (minutes)</label>
<input
type="number"
id="timeLimit"
value={timeLimit}
onChange={(e) => setTimeLimit(e.target.value)}
placeholder="Enter time limit (1-180 minutes)"
/>
{errors.timeLimit && <span className="error-message">{errors.timeLimit}</span>}
</div>
<button type="submit" className="create-quiz-button">Create Quiz</button>
</form>
<ToastContainer toasts={toasts} removeToast={removeToast} />
</div>
);
};

export default QuizForm;