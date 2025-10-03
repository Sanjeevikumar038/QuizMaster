// package com.examly.springapp.controller;

// import org.springframework.web.bind.annotation.*;
// import java.util.*;

// @RestController
// @RequestMapping("/api/quiz-attempts")
// @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "false")
// public class SimpleQuizAttemptController {
    
//     @GetMapping
//     public List<Map<String, Object>> getAllQuizAttempts() {
//         return new ArrayList<>();
//     }
    
//     @PostMapping
//     public Map<String, Object> submitQuizAttempt(@RequestBody Map<String, Object> attempt) {
//         System.out.println("Received quiz attempt: " + attempt);
//         attempt.put("id", 1L);
//         attempt.put("completedAt", new Date().toString());
//         return attempt;
//     }
// }