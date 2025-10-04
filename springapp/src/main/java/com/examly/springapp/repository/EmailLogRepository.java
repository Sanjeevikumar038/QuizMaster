package com.examly.springapp.repository;

import com.examly.springapp.model.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    
    List<EmailLog> findByTypeOrderByTimestampDesc(String type);
    
    List<EmailLog> findByEmailOrderByTimestampDesc(String email);
    
    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.type = ?1 AND e.status = 'sent'")
    Long countByTypeAndStatusSent(String type);
    
    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.status = 'sent'")
    Long countByStatusSent();
    
    List<EmailLog> findTop10ByOrderByTimestampDesc();
}