package com.examly.springapp.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "email_logs")
public class EmailLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "type", nullable = false)
    private String type; // 'reminder' or 'results'
    
    @Column(name = "quiz_id")
    private Long quizId;
    
    @Column(name = "quiz_title")
    private String quizTitle;
    
    @Column(name = "status", nullable = false)
    private String status; // 'sent', 'failed'
    
    @Column(name = "timestamp", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
    
    @Column(name = "error_message")
    private String errorMessage;

    public EmailLog() {
        this.timestamp = new Date();
    }

    public EmailLog(String email, String type, Long quizId, String quizTitle, String status) {
        this();
        this.email = email;
        this.type = type;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    
    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}