-- Add soft delete and admin tracking columns to users table
ALTER TABLE users 
ADD COLUMN deleted_at TIMESTAMP,
ADD COLUMN deleted_by INTEGER,
ADD COLUMN created_by INTEGER;

-- Add foreign key constraints (optional, but good practice)
-- ALTER TABLE users ADD CONSTRAINT fk_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id);
-- ALTER TABLE users ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id);
