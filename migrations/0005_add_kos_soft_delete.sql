-- Add soft delete fields to posts and kos tables
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN deleted_by INTEGER;

ALTER TABLE kos ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE kos ADD COLUMN deleted_by INTEGER;

-- Add indexes for performance
CREATE INDEX idx_posts_deleted_at ON posts(deleted_at);
CREATE INDEX idx_kos_deleted_at ON kos(deleted_at);

-- Add foreign key constraints for tracking who deleted
ALTER TABLE posts ADD CONSTRAINT fk_posts_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id);
ALTER TABLE kos ADD CONSTRAINT fk_kos_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id);
