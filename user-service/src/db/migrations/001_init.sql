-- 001_init_user_service.sql

-- 1. Enums (Optional, if you chose Enum over Table)
-- CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'GUEST');

-- 2. Tables

CREATE TABLE university (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Modern auto-increment
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    website TEXT
);

CREATE TABLE course (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    university_id INT REFERENCES university(id) ON DELETE SET NULL
);
-- ⚡ Performance: Index the foreign key
CREATE INDEX idx_course_university_id ON course(university_id);

CREATE TABLE role (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    reputation INT DEFAULT 75,
    address TEXT,
    
    -- Foreign Keys
    course_id INT REFERENCES course(id) ON DELETE SET NULL,
    university_id INT REFERENCES university(id) ON DELETE SET NULL,
    role_id INT DEFAULT 1 REFERENCES role(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now() -- Prisma handles this, PG needs a trigger
);

-- ⚡ Performance: Index ALL foreign keys
CREATE INDEX idx_user_course_id ON users(course_id);
CREATE INDEX idx_user_university_id ON users(university_id);
CREATE INDEX idx_user_role_id ON users(role_id);

CREATE TABLE refresh_token (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP NOT NULL
);
-- ⚡ Performance: Index user lookup for tokens
CREATE INDEX idx_refresh_token_user_id ON refresh_token(user_id);

-- 3. Seed Data (Replicating Prisma Defaults)
-- Ensure 'role_id' default (1) actually exists!
INSERT INTO role (name) VALUES ('USER'), ('MODERATOR'),('ADMIN');

-- 4. Automate updated_at (The "Prisma behavior" for Postgres)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();