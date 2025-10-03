-- Create quiz_attempts table if it doesn't exist
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT,
    student_name VARCHAR(255),
    score INTEGER,
    total_questions INTEGER,
    completed_at TIMESTAMP
);