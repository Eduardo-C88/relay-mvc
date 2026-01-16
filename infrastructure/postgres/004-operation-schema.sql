\connect operation_db;

-- =========================
-- 1. Status table
-- =========================
CREATE TABLE purchase_status (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO purchase_status (name) 
VALUES
    ('REQUESTED'),
    ('AWAITING_SELLER'),
    ('APPROVED'),
    ('REJECTED'),
    ('CANCELLED'),
    ('COMPLETED'),
    ('FAILED');

CREATE TABLE borrowing_status (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO borrowing_status (name)
VALUES
    ('REQUESTED'),
    ('AWAITING_OWNER'),
    ('APPROVED'),
    ('REJECTED'),
    ('ACTIVE'),
    ('RETURNED'),
    ('CANCELLED'),
    ('OVERDUE'),
    ('COMPLETED'),
    ('FAILED');

-- =========================
-- 2. Purchases table
-- =========================
CREATE TABLE purchases (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    buyer_id INT NOT NULL,
    resource_id INT NOT NULL,
    seller_id INT,

    agreed_price FLOAT,

    status_id INT REFERENCES purchase_status(id),
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for Purchases
CREATE INDEX idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX idx_purchases_resource_id ON purchases(resource_id);
CREATE INDEX idx_purchases_seller_id ON purchases(seller_id);
CREATE INDEX idx_purchases_status_id ON purchases(status_id);

-- =========================
-- 3. Borrowings table
-- =========================
CREATE TABLE borrowings (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    borrower_id INT NOT NULL,
    resource_id INT NOT NULL,
    owner_id INT,

    status_id INT NOT NULL REFERENCES borrowing_status(id),

    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for Borrowings
CREATE INDEX idx_borrowings_borrower_id ON borrowings(borrower_id);
CREATE INDEX idx_borrowings_resource_id ON borrowings(resource_id);
CREATE INDEX idx_borrowings_owner_id ON borrowings(owner_id);
CREATE INDEX idx_borrowings_status_id ON borrowings(status_id);
