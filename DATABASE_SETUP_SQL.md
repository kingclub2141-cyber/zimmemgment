# Supabase Database Setup

Copy and paste the following SQL into your Supabase SQL Editor to create the required tables for ZimmeManagement.

```sql
-- Create Gyms table first as other tables reference it
CREATE TABLE IF NOT EXISTS gyms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (Unified for all roles)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Matches Supabase Auth UID
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    password TEXT, 
    role TEXT CHECK (role IN ('admin', 'admin2', 'staff', 'trainer', 'member')) NOT NULL,
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    gym_id UUID REFERENCES gyms(id),
    member_id UUID, 
    trainer_id UUID, 
    staff_id UUID, 
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id TEXT UNIQUE,
    gym_id UUID REFERENCES gyms(id),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    gender TEXT,
    date_of_birth DATE,
    aadhar_number TEXT,
    pan_number TEXT,
    address TEXT,
    batch_id UUID,
    joining_date DATE,
    status TEXT DEFAULT 'Active',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles for Staff
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    name TEXT NOT NULL,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role_id UUID REFERENCES roles(id),
    status TEXT DEFAULT 'Active',
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    plan_name TEXT NOT NULL,
    plan_type TEXT,
    amount DECIMAL NOT NULL,
    duration_type TEXT CHECK (duration_type IN ('day', 'month', 'year')),
    duration_value INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Subscriptions
CREATE TABLE IF NOT EXISTS member_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    plan_id UUID REFERENCES plans(id),
    purchase_date DATE DEFAULT CURRENT_DATE,
    start_date DATE,
    expiry_date DATE,
    amount DECIMAL,
    paid_amount DECIMAL DEFAULT 0,
    due_amount DECIMAL DEFAULT 0,
    status TEXT DEFAULT 'Active',
    trainer_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments (Receipts)
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    member_plan_id UUID REFERENCES member_plans(id),
    member_id UUID REFERENCES members(id),
    amount DECIMAL NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_mode TEXT,
    receipt_number TEXT UNIQUE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    member_id UUID REFERENCES members(id),
    attendance_date DATE DEFAULT CURRENT_DATE,
    punch_in_time TIME,
    punch_out_time TIME,
    status TEXT DEFAULT 'Present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainers
CREATE TABLE IF NOT EXISTS trainers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    joining_date DATE,
    monthly_amount DECIMAL,
    daily_amount DECIMAL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches
CREATE TABLE IF NOT EXISTS batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    batch_name TEXT NOT NULL,
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT TRUE
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id),
    category TEXT,
    amount DECIMAL NOT NULL,
    description TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diet Plans
CREATE TABLE IF NOT EXISTS diet_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    day_number INT,
    breakfast TEXT,
    lunch TEXT,
    snacks TEXT,
    dinner TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Adjust based on your gym_id logic)
CREATE POLICY "Users can see their own gym data" ON gyms FOR SELECT USING (true);
CREATE POLICY "Users can see their own data" ON users FOR SELECT USING (auth.uid() = id);
```
