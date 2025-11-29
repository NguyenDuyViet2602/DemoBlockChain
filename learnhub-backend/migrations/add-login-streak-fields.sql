-- Add login streak tracking fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS lastlogin DATE,
ADD COLUMN IF NOT EXISTS currentstreak INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN users.lastlogin IS 'Last login date for streak tracking';
COMMENT ON COLUMN users.currentstreak IS 'Current consecutive login days streak';

