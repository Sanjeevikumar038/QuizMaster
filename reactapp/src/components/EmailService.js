// Email Service for QuizMaster
// Uses EmailJS for client-side email sending
import emailjs from 'emailjs-com';
import { API_BASE_URL } from '../utils/constants';

class EmailService {
  constructor() {
    this.serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    this.templateIds = {
      quizReminder: process.env.REACT_APP_EMAILJS_TEMPLATE_REMINDER,
      quizResults: process.env.REACT_APP_EMAILJS_TEMPLATE_RESULTS,
      newQuizNotification: process.env.REACT_APP_EMAILJS_TEMPLATE_NEW_QUIZ
    };
    this.publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    this.initialized = false;
  }

  // Initialize EmailJS (call this in your main app)
  async initialize() {
    try {
      if (!this.serviceId || !this.publicKey) {
        console.warn('EmailJS not configured - using demo mode');
        return false;
      }
      emailjs.init(this.publicKey);
      this.initialized = true;
      console.log('EmailJS initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
      return false;
    }
  }

  // Send quiz reminder email
  async sendQuizReminder(studentEmail, quizData) {
    const studentName = await this.getStudentName(studentEmail);
    const templateParams = {
      to_email: studentEmail,
      student_name: studentName,
      quiz_title: quizData.title,
      quiz_description: quizData.description,
      time_limit: quizData.timeLimit,
      reminder_message: `Don't forget to take the "${quizData.title}" quiz!`,
      quiz_url: window.location.origin
    };

    return this.sendEmail(this.templateIds.quizReminder, templateParams);
  }

  // Send quiz results email
  async sendQuizResults(studentEmail, quizData, results) {
    const percentage = Math.round((results.score / results.totalQuestions) * 100);
    const grade = this.calculateGrade(percentage);
    const studentName = await this.getStudentName(studentEmail);

    const templateParams = {
      to_email: studentEmail,
      student_name: studentName,
      quiz_title: quizData.title,
      score: results.score,
      total_questions: results.totalQuestions,
      percentage: percentage,
      grade: grade,
      time_taken: results.timeTaken || 'N/A',
      completion_date: new Date().toLocaleDateString()
    };

    const result = await this.sendEmail(this.templateIds.quizResults, templateParams, 'results');
    
    // Log result email to database
    if (result.success) {
      try {
        await fetch(`${API_BASE_URL}/emails/log-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: studentEmail,
            quizId: quizData.id,
            quizTitle: quizData.title
          })
        });
      } catch (error) {
        console.error('Failed to log result email:', error);
      }
    }
    
    return result;
  }

  // Send new quiz notification to all students
  async sendNewQuizNotification(quizData) {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/send-reminders/${quizData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Sent reminders to ${result.count} students`);
        return result;
      } else {
        console.error('Failed to send reminders:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      return { success: false, message: error.message };
    }
  }

  // Generic email sending method
  async sendEmail(templateId, templateParams, emailType = 'unknown') {
    try {
      if (!this.initialized) {
        // Fallback to demo mode
        console.log('Demo mode - Email would be sent:', { templateId, templateParams });
        await this.logEmailSent(templateParams.to_email, emailType);
        return { success: true, message: 'Email sent (demo mode)' };
      }

      // Real EmailJS sending
      const result = await emailjs.send(
        this.serviceId,
        templateId,
        templateParams,
        this.publicKey
      );
      
      console.log('Email sent successfully:', result);
      await this.logEmailSent(templateParams.to_email, emailType);
      return { success: true, message: 'Email sent successfully', result };
      
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  async getStudentName(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      const students = await response.json();
      const student = students.find(s => s.email === email || `${s.username}@example.com` === email);
      return student ? student.username : email.split('@')[0];
    } catch (error) {
      console.error('Error fetching student name:', error);
      return email.split('@')[0];
    }
  }

  calculateGrade(percentage) {
    if (percentage >= 90) return 'O';
    if (percentage >= 85) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  async logEmailSent(email, type, quizId = null, quizTitle = null) {
    try {
      await fetch(`${API_BASE_URL}/emails/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          type,
          quizId,
          quizTitle,
          status: 'sent'
        })
      });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  // Get email sending history from database
  async getEmailStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/stats`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
      return {
        remindersSent: 0,
        resultsSent: 0,
        activeStudents: 0,
        totalEmails: 0,
        recentReminders: [],
        recentResults: []
      };
    }
  }
}

const emailService = new EmailService();
export default emailService;