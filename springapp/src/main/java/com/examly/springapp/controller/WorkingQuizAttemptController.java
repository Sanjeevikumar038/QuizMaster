package com.examly.springapp.controller;

import com.examly.springapp.model.QuizAttempt;
import com.examly.springapp.model.RetakePermission;
import com.examly.springapp.repository.QuizAttemptRepository;
import com.examly.springapp.repository.RetakePermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz-attempts")
@CrossOrigin(origins = {"http://localhost:3000", "https://quizmastersk.netlify.app"}, allowCredentials = "false")
public class WorkingQuizAttemptController {
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private RetakePermissionRepository retakePermissionRepository;
    
    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getAllQuizAttempts() {
        List<QuizAttempt> attempts = quizAttemptRepository.findAll();
        return ResponseEntity.ok(attempts);
    }
    
    @GetMapping("/student/{studentName}")
    public ResponseEntity<List<QuizAttempt>> getStudentAttempts(@PathVariable String studentName) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentName(studentName);
        return ResponseEntity.ok(attempts);
    }
    
    @PostMapping
    public ResponseEntity<QuizAttempt> submitQuizAttempt(@RequestBody Map<String, Object> attemptData) {
        try {
            QuizAttempt attempt = new QuizAttempt();
            attempt.setQuizId(Long.valueOf(attemptData.get("quizId").toString()));
            attempt.setQuizTitle(attemptData.get("quizTitle").toString());
            attempt.setStudentName(attemptData.get("studentName").toString());
            attempt.setScore((Integer) attemptData.get("score"));
            attempt.setTotalQuestions((Integer) attemptData.get("totalQuestions"));
            attempt.setTimeTaken((Integer) attemptData.get("timeTaken"));
            attempt.setCompletedAt(new Date());
            attempt.setCreatedAt(new Date());
            
            QuizAttempt saved = quizAttemptRepository.save(attempt);
            
            // Deactivate any retake permissions for this student and quiz
            List<RetakePermission> permissions = retakePermissionRepository
                .findByStudentNameAndQuizIdAndActive(attempt.getStudentName(), attempt.getQuizId(), true);
            
            // Also find permissions by quiz title (fallback for null quizId)
            List<RetakePermission> titlePermissions = retakePermissionRepository
                .findByStudentNameAndActive(attempt.getStudentName(), true)
                .stream()
                .filter(p -> p.getQuizTitle() != null && p.getQuizTitle().equals(attempt.getQuizTitle()))
                .collect(java.util.stream.Collectors.toList());
            
            // Deactivate all matching permissions
            for (RetakePermission permission : permissions) {
                permission.setActive(false);
                retakePermissionRepository.save(permission);
            }
            for (RetakePermission permission : titlePermissions) {
                permission.setActive(false);
                retakePermissionRepository.save(permission);
            }
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/can-retake/{studentName}/{quizId}")
    public ResponseEntity<Map<String, Boolean>> canRetake(@PathVariable String studentName, @PathVariable Long quizId) {
        List<RetakePermission> permissions = retakePermissionRepository
            .findByStudentNameAndQuizIdAndActive(studentName, quizId, true);
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("canRetake", !permissions.isEmpty());
        return ResponseEntity.ok(result);
    }
}