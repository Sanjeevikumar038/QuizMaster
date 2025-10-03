package com.examly.springapp.repository;
import com.examly.springapp.model.Option;
import com.examly.springapp.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    Option findByQuestionAndIsCorrect(Question question, Boolean isCorrect);
    
    @Modifying
    @Query("DELETE FROM Option o WHERE o.question.id = ?1")
    void deleteByQuestionId(Long questionId);
}