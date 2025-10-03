package com.examly.springapp.controller;
import com.examly.springapp.dto.QuestionDTO;
import com.examly.springapp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
@RestController
@CrossOrigin(origins = {"http://localhost:3000", "https://quizmastersk.netlify.app"})
@RequestMapping("/api/quizzes/{quizId}/questions")
public class QuestionController {
    @Autowired
    private QuestionService questionService;
    @PostMapping
    public ResponseEntity<QuestionDTO> addQuestionToQuiz(@PathVariable Long quizId, @Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO addedQuestion = questionService.addQuestion(quizId, questionDTO);
        return new ResponseEntity<>(addedQuestion, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getQuestionsByQuizId(@PathVariable Long quizId) {
        List<QuestionDTO> questions = questionService.getQuestionsByQuizId(quizId);
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }
}

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = {"http://localhost:3000", "https://quizmastersk.netlify.app"})
class QuestionManagementController {
    @Autowired
    private QuestionService questionService;
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO updatedQuestion = questionService.updateQuestion(id, questionDTO);
        return new ResponseEntity<>(updatedQuestion, HttpStatus.OK);
    }
}