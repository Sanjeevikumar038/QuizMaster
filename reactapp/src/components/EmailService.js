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

    return this.sendEmail(this.templateIds.quizResults, templateParams, 'results');
  }

  // Send new quiz notification to all students
  async sendNewQuizNotification(quizData) {
    let studentsWithEmail = [];
    
    try {
      // Fetch students from database instead of localStorage
      const response = await fetch(`${API_BASE_URL}/students`);
      const students = await response.json();
      studentsWithEmail = students.filter(student => student.email);
      
      console.log('Found students with emails:', studentsWithEmail);
      
      if (studentsWithEmail.length === 0) {
        console.log('No students with email addresses found');
        return [];
      }
    } catch (error) {
      console.error('Error fetching students from database:', error);
      return [];
    }
    
    const emailPromises = studentsWithEmail.map(student => {
      const templateParams = {
        to_email: student.email,
        student_name: student.username,
        quiz_title: quizData.title,
        quiz_description: quizData.description,
        time_limit: quizData.timeLimit,
        quiz_url: window.location.origin
      };
      
      return this.sendEmail(this.templateIds.quizReminder, templateParams, 'reminder');
    });

    return Promise.allSettled(emailPromises);
  }

  // Generic email sending method
  async sendEmail(templateId, templateParams, emailType = 'unknown') {
    try {
      if (!this.initialized) {
        // Fallback to demo mode
        console.log('Demo mode - Email would be sent:', { templateId, templateParams });
        this.logEmailSent(templateParams.to_email, emailType);
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
      this.logEmailSent(templateParams.to_email, emailType);
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

  logEmailSent(email, type) {
    const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    emailLogs.push({
      email,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent'
    });
    localStorage.setItem('emailLogs', JSON.stringify(emailLogs));
  }

  // Get email sending history
  getEmailHistory() {
    return JSON.parse(localStorage.getItem('emailLogs') || '[]');
  }
}

const emailService = new EmailService();
export default emailService;