package com.examly.springapp.controller;

import com.examly.springapp.dto.EmailStatsDTO;
import com.examly.springapp.model.EmailLog;
import com.examly.springapp.model.Student;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.repository.EmailLogRepository;
import com.examly.springapp.repository.StudentRepository;
import com.examly.springapp.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/emails")
@CrossOrigin(origins = "*")
public class EmailController {

    @Autowired
    private EmailLogRepository emailLogRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private QuizRepository quizRepository;

    @GetMapping("/stats")
    public ResponseEntity<EmailStatsDTO> getEmailStats() {
        Long remindersSent = emailLogRepository.countByTypeAndStatusSent("reminder");
        Long resultsSent = emailLogRepository.countByTypeAndStatusSent("results");
        Long activeStudents = studentRepository.countByActiveTrue();
        Long totalEmails = emailLogRepository.countByStatusSent();
        
        List<EmailLog> recentReminders = emailLogRepository.findByTypeOrderByTimestampDesc("reminder")
                .stream().limit(10).toList();
        List<EmailLog> recentResults = emailLogRepository.findByTypeOrderByTimestampDesc("results")
                .stream().limit(10).toList();
        
        EmailStatsDTO stats = new EmailStatsDTO(remindersSent, resultsSent, activeStudents, 
                                               totalEmails, recentReminders, recentResults);
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/log")
    public ResponseEntity<Map<String, String>> logEmail(@RequestBody EmailLog emailLog) {
        emailLogRepository.save(emailLog);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email logged successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-reminders/{quizId}")
    public ResponseEntity<Map<String, Object>> sendQuizReminders(@PathVariable Long quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quiz not found");
            return ResponseEntity.badRequest().body(response);
        }

        List<Student> studentsWithEmail = studentRepository.findByActiveTrue()
                .stream()
                .filter(student -> student.getEmail() != null && !student.getEmail().trim().isEmpty())
                .toList();

        if (studentsWithEmail.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "No students with email addresses found");
            return ResponseEntity.ok(response);
        }

        // Log reminder emails (in real implementation, you'd send actual emails here)
        for (Student student : studentsWithEmail) {
            EmailLog emailLog = new EmailLog(student.getEmail(), "reminder", 
                                           quiz.getId(), quiz.getTitle(), "sent");
            emailLogRepository.save(emailLog);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Reminders sent successfully");
        response.put("count", studentsWithEmail.size());
        response.put("students", studentsWithEmail);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/log-result")
    public ResponseEntity<Map<String, String>> logResultEmail(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        Long quizId = Long.valueOf(request.get("quizId").toString());
        String quizTitle = (String) request.get("quizTitle");
        
        EmailLog emailLog = new EmailLog(email, "results", quizId, quizTitle, "sent");
        emailLogRepository.save(emailLog);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Result email logged successfully");
        return ResponseEntity.ok(response);
    }
}