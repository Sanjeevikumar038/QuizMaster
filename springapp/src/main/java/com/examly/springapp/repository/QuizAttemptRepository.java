package com.examly.springapp.repository;
import com.examly.springapp.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByStudentName(String studentName);
    boolean existsByQuizIdAndStudentName(Long quizId, String studentName);
    List<QuizAttempt> findByStudentNameAndQuizId(String studentName, Long quizId);
    
    @Modifying
    @Query("DELETE FROM QuizAttempt qa WHERE qa.quizId = ?1")
    void deleteByQuizId(Long quizId);
}