\connect resource_db

-- 1. Status table
CREATE TABLE status (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 2. Category table
CREATE TABLE category (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 3. UserProfile table
CREATE TABLE user_profile (
    id INT PRIMARY KEY,
    name TEXT,
    reputation INT DEFAULT 75,
    university TEXT,
    course TEXT
);

-- 4. Resource table
CREATE TABLE resource (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id INT REFERENCES user_profile(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category_id INT REFERENCES category(id) ON DELETE SET NULL,
    description TEXT,
    status_id INT DEFAULT 1 REFERENCES status(id),
    price FLOAT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for foreign keys
CREATE INDEX idx_resource_owner_id ON resource(owner_id);
CREATE INDEX idx_resource_category_id ON resource(category_id);
CREATE INDEX idx_resource_status_id ON resource(status_id);

-- 5. Request table
CREATE TABLE request (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    requester_id INT REFERENCES user_profile(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category_id INT REFERENCES category(id) ON DELETE SET NULL,
    status_id INT REFERENCES status(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_request_requester_id ON request(requester_id);
CREATE INDEX idx_request_category_id ON request(category_id);
CREATE INDEX idx_request_status_id ON request(status_id);

-- 6. Seed default status (optional)
INSERT INTO status (name) VALUES ('AVAILABLE'), ('BORROWED'), ('SOLD'),('PENDING'), ('APPROVED'), ('REJECTED');