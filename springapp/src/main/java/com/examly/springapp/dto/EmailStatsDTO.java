package com.examly.springapp.dto;

import java.util.List;
import com.examly.springapp.model.EmailLog;

public class EmailStatsDTO {
    private Long remindersSent;
    private Long resultsSent;
    private Long activeStudents;
    private Long totalEmails;
    private List<EmailLog> recentReminders;
    private List<EmailLog> recentResults;

    public EmailStatsDTO() {}

    public EmailStatsDTO(Long remindersSent, Long resultsSent, Long activeStudents, Long totalEmails,
                        List<EmailLog> recentReminders, List<EmailLog> recentResults) {
        this.remindersSent = remindersSent;
        this.resultsSent = resultsSent;
        this.activeStudents = activeStudents;
        this.totalEmails = totalEmails;
        this.recentReminders = recentReminders;
        this.recentResults = recentResults;
    }

    // Getters and Setters
    public Long getRemindersSent() { return remindersSent; }
    public void setRemindersSent(Long remindersSent) { this.remindersSent = remindersSent; }
    
    public Long getResultsSent() { return resultsSent; }
    public void setResultsSent(Long resultsSent) { this.resultsSent = resultsSent; }
    
    public Long getActiveStudents() { return activeStudents; }
    public void setActiveStudents(Long activeStudents) { this.activeStudents = activeStudents; }
    
    public Long getTotalEmails() { return totalEmails; }
    public void setTotalEmails(Long totalEmails) { this.totalEmails = totalEmails; }
    
    public List<EmailLog> getRecentReminders() { return recentReminders; }
    public void setRecentReminders(List<EmailLog> recentReminders) { this.recentReminders = recentReminders; }
    
    public List<EmailLog> getRecentResults() { return recentResults; }
    public void setRecentResults(List<EmailLog> recentResults) { this.recentResults = recentResults; }
}