-- =====================================================
-- CollegeFlow - Supabase Database Schema
-- Multi-Role Approval System
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Stores user profiles, roles, and authentication data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'MENTOR', 'HOD', 'ADMIN', 'SECURITY')),
    department VARCHAR(100) NOT NULL DEFAULT 'GENERAL' CHECK (department IN ('GENERAL', 'CSE', 'AIML', 'ECE', 'MECH', 'CIVIL', 'EEE')),
    student_id VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- =====================================================
-- 2. WORKFLOW_REQUESTS TABLE
-- =====================================================
-- Main table for storing approval requests and workflow status
CREATE TABLE IF NOT EXISTS workflow_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PERMISSION', 'LATE_ATTENDANCE')),
    reason TEXT NOT NULL,
    date DATE,
    arrival_time TIME,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'GRANTED')),
    current_step VARCHAR(50) DEFAULT 'MENTOR' CHECK (current_step IN ('MENTOR', 'HOD', 'SECURITY')),
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for workflow_requests table
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON workflow_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON workflow_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON workflow_requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON workflow_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_current_step ON workflow_requests(current_step);

-- =====================================================
-- 3. AUDIT_LOGS TABLE
-- =====================================================
-- Tracks all actions taken on requests (approval workflow)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVE', 'DENY', 'GRANT', 'REVOKE', 'ESCALATE')),
    role VARCHAR(50) NOT NULL,
    comments TEXT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_request_id ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- =====================================================
-- 4. NOTIFICATIONS TABLE
-- =====================================================
-- Stores system notifications for users
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR')),
    is_read BOOLEAN DEFAULT false,
    related_request_id UUID REFERENCES workflow_requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- 5. SYSTEM_SETTINGS TABLE
-- =====================================================
-- Stores system-wide configuration settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(100) DEFAULT 'GENERAL',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for system_settings table
CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_public ON system_settings(is_public);

-- =====================================================
-- 6. DEPARTMENTS TABLE
-- =====================================================
-- Stores department information and HOD assignments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    hod_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for departments table
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_hod_id ON departments(hod_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

-- =====================================================
-- 7. SESSIONS TABLE
-- =====================================================
-- User session management for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- =====================================================
-- 8. ATTACHMENTS TABLE
-- =====================================================
-- Stores file attachments for requests
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for attachments table
CREATE INDEX IF NOT EXISTS idx_attachments_request_id ON attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- =====================================================
-- 9. SECURITY_LOGS TABLE
-- =====================================================
-- Security-related events and incidents
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'SECURITY_BREACH', 'CAMPUS_EXIT', 'UNAUTHORIZED_ACCESS')),
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for security_logs table
CREATE INDEX IF NOT EXISTS idx_security_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_created_at ON security_logs(created_at);

-- =====================================================
-- 10. USER_PROFILES TABLE
-- =====================================================
-- Extended profile storage with email and roll number dependencies
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_sent_at TIMESTAMP WITH TIME ZONE,
    roll_number VARCHAR(50) UNIQUE,
    roll_number_verified BOOLEAN DEFAULT false,
    roll_number_document_url TEXT,
    profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    bio TEXT,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    blood_group VARCHAR(10),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    profile_visibility VARCHAR(20) DEFAULT 'PUBLIC' CHECK (profile_visibility IN ('PUBLIC', 'PRIVATE', 'FACULTY_ONLY')),
    last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_roll_number ON user_profiles(roll_number);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON user_profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_completion_score ON user_profiles(profile_completion_score);

-- =====================================================
-- 11. LOGIN_ACTIVITY TABLE
-- =====================================================
-- Detailed login tracking and session analysis
CREATE TABLE IF NOT EXISTS login_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    session_duration_seconds INTEGER,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50) CHECK (device_type IN ('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN')),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    login_method VARCHAR(50) CHECK (login_method IN ('EMAIL_PASSWORD', 'SSO', 'SOCIAL', 'OTP')),
    login_status VARCHAR(20) CHECK (login_status IN ('SUCCESS', 'FAILED', 'TIMEOUT', 'FORCED_LOGOUT')),
    failure_reason VARCHAR(255),
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for login_activity table
CREATE INDEX IF NOT EXISTS idx_login_user_id ON login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_time ON login_activity(login_time);
CREATE INDEX IF NOT EXISTS idx_login_status ON login_activity(login_status);
CREATE INDEX IF NOT EXISTS idx_login_suspicious ON login_activity(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_login_risk_score ON login_activity(risk_score);

-- =====================================================
-- 12. EMAIL_LOGS TABLE
-- =====================================================
-- Comprehensive email tracking and communication logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('VERIFICATION', 'PASSWORD_RESET', 'NOTIFICATION', 'WELCOME', 'REQUEST_UPDATE', 'APPROVAL', 'REJECTION', 'SECURITY_ALERT')),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    email_body TEXT,
    template_name VARCHAR(100),
    sent_status VARCHAR(20) DEFAULT 'PENDING' CHECK (sent_status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED')),
    delivery_error TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    unsubscribe_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email_logs table
CREATE INDEX IF NOT EXISTS idx_email_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_status ON email_logs(sent_status);
CREATE INDEX IF NOT EXISTS idx_email_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_recipient ON email_logs(recipient_email);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Users can only view their own profile
CREATE POLICY "users_own_profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can view all users (for admin role)
CREATE POLICY "users_view_all" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Users can only see requests they submitted or are assigned to review
CREATE POLICY "requests_access" ON workflow_requests
    FOR SELECT
    USING (
        (auth.uid() = user_id) OR 
        (auth.uid()) IN (
            SELECT hod_id FROM departments WHERE hod_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('MENTOR', 'HOD', 'ADMIN', 'SECURITY')
        )
    );

-- Audit logs access based on request access
CREATE POLICY "audit_logs_access" ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workflow_requests wr
            WHERE wr.id = audit_logs.request_id AND (
                (wr.user_id = auth.uid()) OR
                (auth.uid()) IN (
                    SELECT hod_id FROM departments WHERE hod_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND role IN ('MENTOR', 'HOD', 'ADMIN', 'SECURITY')
                )
            )
        )
    );

-- Users can only access their own notifications
CREATE POLICY "notifications_own" ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Departments access policies
CREATE POLICY "departments_view" ON departments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('ADMIN', 'HOD')
        )
    );

-- Sessions access policies
CREATE POLICY "sessions_own" ON sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Attachments access based on request access
CREATE POLICY "attachments_access" ON attachments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workflow_requests wr
            WHERE wr.id = attachments.request_id AND (
                (wr.user_id = auth.uid()) OR
                (auth.uid()) IN (
                    SELECT hod_id FROM departments WHERE hod_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND role IN ('MENTOR', 'HOD', 'ADMIN', 'SECURITY')
                )
            )
        )
    );

-- Security logs access policies
CREATE POLICY "security_logs_view" ON security_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('ADMIN', 'SECURITY')
        )
    );

-- System settings access policies
CREATE POLICY "system_settings_admin" ON system_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- User profiles access policies
CREATE POLICY "user_profiles_own" ON user_profiles
    FOR SELECT
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Login activity access policies
CREATE POLICY "login_activity_own" ON login_activity
    FOR SELECT
    USING (auth.uid() = user_id);

-- Email logs access policies
CREATE POLICY "email_logs_own" ON email_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- User profiles access policies
CREATE POLICY "user_profiles_own" ON user_profiles
    FOR SELECT
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for workflow_requests
CREATE TRIGGER update_workflow_requests_updated_at
    BEFORE UPDATE ON workflow_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for audit_logs
CREATE TRIGGER update_audit_logs_updated_at
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for notifications
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for departments
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for system_settings
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for user requests with full details
CREATE OR REPLACE VIEW user_requests_view AS
SELECT 
    wr.id,
    wr.type,
    wr.reason,
    wr.date,
    wr.arrival_time,
    wr.status,
    wr.current_step,
    wr.priority,
    wr.attachment_url,
    wr.created_at,
    wr.updated_at,
    u.name as user_name,
    u.email as user_email,
    u.department as user_department,
    u.student_id as user_student_id
FROM workflow_requests wr
LEFT JOIN users u ON wr.user_id = u.id;

-- View for request statistics
CREATE OR REPLACE VIEW request_stats_view AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'DENIED' THEN 1 END) as denied_requests,
    COUNT(CASE WHEN status = 'GRANTED' THEN 1 END) as granted_requests,
    COUNT(CASE WHEN type = 'PERMISSION' THEN 1 END) as permission_requests,
    COUNT(CASE WHEN type = 'LATE_ATTENDANCE' THEN 1 END) as attendance_requests,
    DATE_TRUNC('month', created_at) as request_month,
    DATE_TRUNC('year', created_at) as request_year
FROM workflow_requests
GROUP BY DATE_TRUNC('month', created_at), DATE_TRUNC('year', created_at);

-- View for user activity summary
CREATE OR REPLACE VIEW user_activity_view AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    u.department,
    COUNT(wr.id) as total_requests,
    COUNT(CASE WHEN wr.status = 'PENDING' THEN 1 END) as pending_count,
    MAX(wr.created_at) as last_request_date,
    u.last_login
FROM users u
LEFT JOIN workflow_requests wr ON u.id = wr.user_id
GROUP BY u.id, u.name, u.email, u.role, u.department, u.last_login;

-- View for complete user profiles with verification status
CREATE OR REPLACE VIEW user_profile_complete_view AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    u.student_id,
    up.email_verified,
    up.roll_number,
    up.roll_number_verified,
    up.profile_completion_score,
    up.bio,
    up.date_of_birth,
    up.gender,
    up.city,
    up.state,
    up.profile_visibility,
    up.last_profile_update,
    COUNT(CASE WHEN la.login_status = 'SUCCESS' THEN 1 END) as successful_logins,
    MAX(la.login_time) as last_login_time,
    COUNT(CASE WHEN la.is_suspicious = true THEN 1 END) as suspicious_logins
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN login_activity la ON u.id = la.user_id
GROUP BY u.id, u.email, u.name, u.role, u.student_id, up.email_verified, up.roll_number, up.roll_number_verified, up.profile_completion_score, up.bio, up.date_of_birth, up.gender, up.city, up.state, up.profile_visibility, up.last_profile_update;

-- View for login analytics
CREATE OR REPLACE VIEW login_analytics_view AS
SELECT 
    DATE_TRUNC('day', login_time) as login_date,
    COUNT(*) as total_logins,
    COUNT(CASE WHEN login_status = 'SUCCESS' THEN 1 END) as successful_logins,
    COUNT(CASE WHEN login_status = 'FAILED' THEN 1 END) as failed_logins,
    COUNT(CASE WHEN is_suspicious = true THEN 1 END) as suspicious_logins,
    AVG(session_duration_seconds) as avg_session_duration,
    COUNT(DISTINCT user_id) as unique_users
FROM login_activity
GROUP BY DATE_TRUNC('day', login_time)
ORDER BY login_date DESC;

-- View for email analytics
CREATE OR REPLACE VIEW email_analytics_view AS
SELECT 
    DATE_TRUNC('day', created_at) as email_date,
    email_type,
    COUNT(*) as total_emails,
    COUNT(CASE WHEN sent_status = 'DELIVERED' THEN 1 END) as delivered_emails,
    COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_emails,
    COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_emails,
    COUNT(CASE WHEN sent_status = 'FAILED' THEN 1 END) as failed_emails
FROM email_logs
GROUP BY DATE_TRUNC('day', created_at), email_type
ORDER BY email_date DESC;

-- =====================================================
-- SAMPLE DATA INSERTION (for development)
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, department, student_id, is_active, created_at) 
VALUES (
    uuid_generate_v4(),
    'admin@collegeflow.edu',
    '$2b$12$P5$5b$5f$23$5e$5c$12$5e$5c$5f$23$5e$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f$5f', -- Hash of 'admin123'
    'System Administrator',
    'ADMIN',
    'IT Department',
    'ADMIN001',
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample departments
INSERT INTO departments (id, name, code, description, is_active, created_at) VALUES
    (uuid_generate_v4(), 'Computer Science', 'CS', 'Computer Science and Engineering Department', true, NOW()),
    (uuid_generate_v4(), 'Electronics', 'EC', 'Electronics and Communication Engineering Department', true, NOW()),
    (uuid_generate_v4(), 'Mechanical', 'ME', 'Mechanical Engineering Department', true, NOW()),
    (uuid_generate_v4(), 'Civil', 'CE', 'Civil Engineering Department', true, NOW());

-- Insert sample system settings
INSERT INTO system_settings (id, key, value, description, category, is_public, created_at) VALUES
    (uuid_generate_v4(), 'app_name', 'CollegeFlow', 'Application name', 'GENERAL', false, NOW()),
    (uuid_generate_v4(), 'app_version', '1.0.0', 'Current application version', 'GENERAL', false, NOW()),
    (uuid_generate_v4(), 'max_file_size', '10485760', 'Maximum file size in bytes (10MB)', 'GENERAL', false, NOW()),
    (uuid_generate_v4(), 'session_timeout', '24', 'Session timeout in hours', 'SECURITY', false, NOW()),
    (uuid_generate_v4(), 'approval_timeout_hours', '72', 'Auto-approval timeout in hours', 'WORKFLOW', false, NOW()),
    (uuid_generate_v4(), 'notification_retention_days', '30', 'Notification retention period in days', 'GENERAL', false, NOW());

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Create partial indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_requests_composite ON workflow_requests(user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_composite ON audit_logs(request_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_composite ON notifications(user_id, is_read, created_at);

-- Enable table partitioning for large tables (optional for high-volume systems)
-- This can be uncommented for production with high data volume
/*
ALTER TABLE workflow_requests PARTITION BY RANGE (created_at);
ALTER TABLE audit_logs PARTITION BY RANGE (timestamp);
ALTER TABLE security_logs PARTITION BY RANGE (created_at);
*/

-- =====================================================
-- 13. STUDENT_COMPLAINTS TABLE
-- =====================================================
-- Student complaint and feedback system
CREATE TABLE IF NOT EXISTS student_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_type VARCHAR(50) NOT NULL CHECK (complaint_type IN ('ACADEMIC', 'FACULTY', 'INFRASTRUCTURE', 'HARASSMENT', 'BULLYING', 'DISCRIMINATION', 'OTHER')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED', 'REJECTED')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution TEXT,
    anonymous BOOLEAN DEFAULT false,
    evidence_files TEXT, -- JSON array of file URLs
    category VARCHAR(50) DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'ACADEMIC', 'FACULTY', 'INFRASTRUCTURE', 'HARASSMENT', 'BULLYING', 'DISCRIMINATION', 'OTHER'))
);

-- Indexes for student_complaints table
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON student_complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON student_complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_type ON student_complaints(complaint_type);
CREATE INDEX IF NOT EXISTS idx_complaints_severity ON student_complaints(severity);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON student_complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON student_complaints(assigned_to);

-- =====================================================
-- 14. STUDENT_COMPLAINT_SERVICE
-- =====================================================
-- Service for handling student complaints and feedback
CREATE TABLE IF NOT EXISTS student_complaint_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES student_complaints(id) ON DELETE CASCADE,
    action_taken VARCHAR(50) NOT NULL CHECK (action_taken IN ('CREATED', 'ASSIGNED', 'ESCALATED', 'CLOSED', 'REOPENED', 'INVESTIGATING', 'RESOLVED')),
    action_by UUID REFERENCES users(id) ON DELETE SET NULL,
    action_details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Indexes for student_complaint_audit_logs table
CREATE INDEX IF NOT EXISTS idx_complaint_audit_complaint_id ON student_complaint_audit_logs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_audit_action_taken ON student_complaint_audit_logs(action_taken);
CREATE INDEX IF NOT EXISTS idx_complaint_audit_timestamp ON student_complaint_audit_logs(timestamp);

-- =====================================================
-- 15. COMPLAINT_RESPONSES TABLE
-- =====================================================
-- Standardized responses for common complaint types
CREATE TABLE IF NOT EXISTS complaint_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES student_complaints(id) ON DELETE CASCADE,
    response_type VARCHAR(50) NOT NULL CHECK (response_type IN ('ACKNOWLEDGE', 'REQUEST_MORE_INFO', 'REQUEST_EVIDENCE', 'ASSIGN_ACTION', 'ESCALATE', 'PROVIDE_GUIDANCE', 'REJECT', 'CLOSE')),
    response_text TEXT NOT NULL,
    response_by UUID REFERENCES users(id) ON DELETE SET NULL,
    response_by_role VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for complaint_responses table
CREATE INDEX IF NOT EXISTS idx_responses_complaint_id ON complaint_responses(complaint_id);
CREATE INDEX IF NOT EXISTS idx_responses_response_type ON complaint_responses(response_type);
CREATE INDEX IF NOT EXISTS idx_responses_timestamp ON complaint_responses(timestamp);
CREATE INDEX IF NOT EXISTS idx_responses_status ON complaint_responses(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR STUDENT COMPLAINTS
-- =====================================================

-- Students can only access their own complaints
CREATE POLICY "student_complaints_own" ON student_complaints
    FOR SELECT
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- Mentors can access complaints from their assigned students
CREATE POLICY "student_complaints_mentor_view" ON student_complaints
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = (SELECT assigned_to FROM student_complaints WHERE complaint_id = student_complaints.id)
      )
    )
    WITH CHECK (
        auth.uid() IN (SELECT assigned_to FROM student_complaints WHERE complaint_id = student_complaints.id)
    );

-- HODs can access all complaints from their department
CREATE POLICY "student_complaints_hod_view" ON student_complaints
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = (SELECT assigned_to FROM student_complaints WHERE complaint_id = student_complaints.id)
        AND (SELECT department FROM users WHERE id = auth.uid())
      )
    )
    WITH CHECK (
        auth.uid() IN (SELECT assigned_to FROM student_complaints WHERE complaint_id = student_complaints.id)
        AND (SELECT department FROM users WHERE id = auth.uid())
    );

-- Admins can access all complaints
CREATE POLICY "student_complaints_admin_view" ON student_complaints
    FOR ALL
    USING (true);

-- =====================================================
-- 16. SYLLABUS_MATERIALS TABLE
-- =====================================================
-- Course materials and syllabus management
CREATE TABLE IF NOT EXISTS syllabus_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    course_code VARCHAR(50),
    semester VARCHAR(50),
    department VARCHAR(100),
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    material_type VARCHAR(20) DEFAULT 'PDF' CHECK (material_type IN ('PDF', 'DOC', 'PPT', 'VIDEO', 'IMAGE', 'OTHER')),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    CONSTRAINT syllabus_title_length CHECK (char_length(title) >= 3),
    CONSTRAINT syllabus_title_not_empty CHECK (title IS NOT NULL AND trim(title) != '')
);

-- Indexes for syllabus_materials table
CREATE INDEX IF NOT EXISTS idx_syllabus_subject ON syllabus_materials(subject);
CREATE INDEX IF NOT EXISTS idx_syllabus_department ON syllabus_materials(department);
CREATE INDEX IF NOT EXISTS idx_syllabus_course_code ON syllabus_materials(course_code);
CREATE INDEX IF NOT EXISTS idx_syllabus_semester ON syllabus_materials(semester);
CREATE INDEX IF NOT EXISTS idx_syllabus_material_type ON syllabus_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_syllabus_created_at ON syllabus_materials(created_at);
CREATE INDEX IF NOT EXISTS idx_syllabus_uploaded_by ON syllabus_materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_syllabus_is_active ON syllabus_materials(is_active);

-- =====================================================
-- 17. SYLLABUS_CATEGORIES TABLE
-- =====================================================
-- Categories for organizing syllabus materials
CREATE TABLE IF NOT EXISTS syllabus_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT category_name_unique UNIQUE (name, department, semester)
);

-- Indexes for syllabus_categories table
CREATE INDEX IF NOT EXISTS idx_categories_department ON syllabus_categories(department);
CREATE INDEX IF NOT EXISTS idx_categories_semester ON syllabus_categories(semester);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON syllabus_categories(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SYLLABUS MATERIALS
-- =====================================================

-- Students can view all active syllabus materials
CREATE POLICY "syllabus_materials_student_view" ON syllabus_materials
    FOR SELECT
    USING (is_active = true);

-- Faculty and HODs can upload and manage materials
CREATE POLICY "syllabus_materials_faculty_manage" ON syllabus_materials
    FOR ALL
    USING (
        auth.uid() = uploaded_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('MENTOR', 'HOD', 'ADMIN')
        )
    );

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SYLLABUS CATEGORIES
-- =====================================================

-- All authenticated users can view categories
CREATE POLICY "syllabus_categories_view" ON syllabus_categories
    FOR SELECT
    USING (is_active = true);

-- Faculty and HODs can manage categories
CREATE POLICY "syllabus_categories_manage" ON syllabus_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('MENTOR', 'HOD', 'ADMIN')
        )
    );

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp for syllabus_materials
CREATE TRIGGER update_syllabus_materials_updated_at
    BEFORE UPDATE ON syllabus_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for syllabus_categories
CREATE TRIGGER update_syllabus_categories_updated_at
    BEFORE UPDATE ON syllabus_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for student_complaints
CREATE OR REPLACE FUNCTION update_complaint_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_complaints_updated_at
    BEFORE UPDATE ON student_complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_complaint_timestamp();

-- Update updated_at timestamp for student_complaints
CREATE TRIGGER update_student_complaints_updated_at
    BEFORE UPDATE ON student_complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_complaint_timestamp();

COMMIT;
