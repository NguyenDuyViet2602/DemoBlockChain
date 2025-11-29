-- Migration: Add video progress tracking and quiz type
-- Run this SQL in your database

-- 1. Add watchTime to lessonprogress (in seconds)
ALTER TABLE lessonprogress 
ADD COLUMN IF NOT EXISTS watchtime INTEGER DEFAULT 0;

-- 2. Add quizType to quizzes ('multiple_choice' or 'essay')
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS quiztype VARCHAR(50) DEFAULT 'multiple_choice';

-- 3. Add isgraded to quizsessions (for essay quizzes that need teacher grading)
ALTER TABLE quizsessions 
ADD COLUMN IF NOT EXISTS isgraded BOOLEAN DEFAULT false;

-- 4. Add gradedby to quizsessions (teacher who graded)
ALTER TABLE quizsessions 
ADD COLUMN IF NOT EXISTS gradedby INTEGER REFERENCES users(userid);

-- 5. Add gradedat to quizsessions
ALTER TABLE quizsessions 
ADD COLUMN IF NOT EXISTS gradedat TIMESTAMP;

-- 6. Add comment/feedback from teacher
ALTER TABLE quizsessions 
ADD COLUMN IF NOT EXISTS teachercomment TEXT;

