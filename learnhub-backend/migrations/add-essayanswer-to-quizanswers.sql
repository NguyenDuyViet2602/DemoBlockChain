-- Migration: Add essayanswer column to quizanswers table
-- Run this SQL in your database

ALTER TABLE quizanswers 
ADD COLUMN IF NOT EXISTS essayanswer TEXT;

