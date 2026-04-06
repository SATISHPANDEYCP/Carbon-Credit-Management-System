-- PostgreSQL Database Schema for Carbon Credit Management System

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    carbon_balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon activities (emissions measured)
CREATE TABLE carbon_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- transport, electricity, waste, manufacturing
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- km, kwh, kg, liters
    vehicle_type VARCHAR(50), -- car, bus, train, flight (nullable)
    co2_generated DECIMAL(10, 2) NOT NULL, -- calculated CO2 in kg
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon reduction actions
CREATE TABLE carbon_reductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL, -- solar_installation, tree_planting, recycling, energy_efficiency
    impact DECIMAL(10, 2) NOT NULL, -- CO2 reduced in kg
    credits_earned DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offset projects available for purchase
CREATE TABLE offset_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    price_per_credit DECIMAL(10, 2) NOT NULL,
    credits_available INTEGER DEFAULT 0,
    project_type VARCHAR(50), -- reforestation, renewable_energy, carbon_capture
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon offset purchases
CREATE TABLE carbon_offsets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES offset_projects(id),
    credit_amount DECIMAL(10, 2) NOT NULL,
    price_per_credit DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (all credit movements)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    transaction_type VARCHAR(50) NOT NULL, -- measure, reduce, offset, share
    credit_amount DECIMAL(10, 2) NOT NULL,
    reference_id UUID, -- links to specific activity/reduction/offset/share record
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for all changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_carbon_activities_user_id ON carbon_activities(user_id);
CREATE INDEX idx_carbon_reductions_user_id ON carbon_reductions(user_id);
CREATE INDEX idx_carbon_offsets_user_id ON carbon_offsets(user_id);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for offset projects
INSERT INTO offset_projects (name, description, location, price_per_credit, credits_available, project_type) VALUES
('Amazon Rainforest Conservation', 'Protect primary rainforest in Brazil from deforestation', 'Brazil', 25.00, 10000, 'reforestation'),
('Wind Farm India', 'Support renewable wind energy generation in Rajasthan', 'India', 18.50, 5000, 'renewable_energy'),
('Ocean Cleanup Initiative', 'Remove plastic and restore marine ecosystems', 'Pacific Ocean', 30.00, 3000, 'carbon_capture'),
('Community Solar Gardens', 'Local solar installations for underserved communities', 'USA', 22.00, 7500, 'renewable_energy');

-- MongoDB Alternative Schema (for reference)
/*
// users collection
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "password_hash": "...",
  "name": "John Doe",
  "carbon_balance": 2450,
  "created_at": ISODate("2025-08-01"),
  "updated_at": ISODate("2025-08-04")
}

// carbon_activities collection
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "activity_type": "transport",
  "quantity": 150,
  "unit": "km",
  "vehicle_type": "car",
  "co2_generated": 35,
  "description": "Daily commute",
  "created_at": ISODate("2025-08-04")
}

// transactions collection (stores all types)
{
  "_id": ObjectId("..."),
  "from_user_id": ObjectId("..."),
  "to_user_id": ObjectId("..."),
  "transaction_type": "reduce",
  "credit_amount": 500,
  "details": {
    "action_type": "solar_installation",
    "impact": 500
  },
  "created_at": ISODate("2025-08-04")
}
*/