-- Migration: Allow NULL for selectedoptionid in quizanswers table
-- This is needed for essay quizzes where selectedoptionid should be NULL

ALTER TABLE quizanswers 
ALTER COLUMN selectedoptionid DROP NOT NULL;

