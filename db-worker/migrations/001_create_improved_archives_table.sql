-- Simple migration: Create archives table for saving annotation data
-- Table structure: prompt, response, error_category, notes

-- Create archives table
CREATE TABLE IF NOT EXISTS archives (
    id SERIAL PRIMARY KEY,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    error_category TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 