-- Create email_logs table for tracking email notifications
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'reminder' or 'results'
    quiz_id BIGINT,
    quiz_title VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- 'sent', 'failed'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    INDEX idx_email (email),
    INDEX idx_type (type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_quiz_id (quiz_id)
);

-- Update students table to ensure active column exists with default value
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Set existing students as active if the column was just added
UPDATE students SET active = TRUE WHERE active IS NULL;