package com.examly.springapp.config;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private OptionRepository optionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (quizRepository.count() == 0) {
            // Create sample quiz
            Quiz quiz = new Quiz();
            quiz.setTitle("Java Basics Quiz");
            quiz.setDescription("Test your knowledge of Java fundamentals");
            quiz.setTimeLimit(30);
            quiz.setCreatedAt(new Date());
            quiz.setUpdatedAt(new Date());
            
            quiz = quizRepository.save(quiz);
            
            // Create sample question
            Question question = new Question();
            question.setQuiz(quiz);
            question.setQuestionText("What is the main method signature in Java?");
            question.setQuestionType("multiple-choice");
            
            question = questionRepository.save(question);
            
            // Create options
            Option option1 = new Option();
            option1.setQuestion(question);
            option1.setOptionText("public static void main(String[] args)");
            option1.setIsCorrect(true);
            
            Option option2 = new Option();
            option2.setQuestion(question);
            option2.setOptionText("public void main(String[] args)");
            option2.setIsCorrect(false);
            
            Option option3 = new Option();
            option3.setQuestion(question);
            option3.setOptionText("static void main(String[] args)");
            option3.setIsCorrect(false);
            
            optionRepository.saveAll(Arrays.asList(option1, option2, option3));
            
            System.out.println("Sample data initialized successfully!");
        }
    }
}