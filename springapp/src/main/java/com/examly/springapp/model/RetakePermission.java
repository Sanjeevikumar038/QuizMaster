package com.examly.springapp.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "retake_permissions")
public class RetakePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_name")
    private String studentName;
    
    @Column(name = "quiz_id")
    private Long quizId;
    
    @Column(name = "quiz_title")
    private String quizTitle;
    
    @Column(name = "allowed_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date allowedAt;
    
    @Column(name = "active")
    private Boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
    public Date getAllowedAt() { return allowedAt; }
    public void setAllowedAt(Date allowedAt) { this.allowedAt = allowedAt; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}