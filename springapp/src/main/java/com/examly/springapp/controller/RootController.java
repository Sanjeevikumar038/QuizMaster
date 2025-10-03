package com.examly.springapp.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class RootController {
    
    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "QuizMaster Backend API is running!");
        response.put("status", "success");
        response.put("endpoints", new String[]{
            "/api/students",
            "/api/quizzes", 
            "/api/quiz-attempts",
            "/api/test"
        });
        return response;
    }
}