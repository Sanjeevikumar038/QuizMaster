package com.examly.springapp.repository;
import com.examly.springapp.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizId(Long quizId);
    
    @Modifying
    @Query("DELETE FROM Question q WHERE q.quiz.id = ?1")
    void deleteByQuizId(Long quizId);
}