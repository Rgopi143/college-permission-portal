# Database Setup Instructions

## Quick Setup with Supabase

### Method 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the SQL script

### Method 2: Using CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to your project
supabase login

# Run the migration
supabase db push --schema database/schema.sql
```

### Method 3: Using psql (Direct Connection)
```bash
# Get connection string from Supabase dashboard
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Execute the schema
psql -d [DATABASE_NAME] -f database/schema.sql
```

## Tables Overview

### Core Tables
- **users**: User profiles and authentication
- **workflow_requests**: Main approval requests
- **audit_logs**: Complete audit trail
- **notifications**: System notifications
- **departments**: Department management
- **sessions**: User session management
- **attachments**: File attachments
- **security_logs**: Security events
- **system_settings**: Configuration settings

### Key Features
- **Row Level Security (RLS)**: Proper data access control
- **Automatic Timestamps**: Triggers for updated_at fields
- **Performance Indexes**: Optimized for common queries
- **Sample Data**: Default admin user and departments
- **Views**: Pre-built views for common queries

## Security Notes

⚠️ **Important**: Change default passwords before production!
- Default admin password: `admin123`
- Use proper password hashing in production
- Configure RLS policies according to your security requirements

## Performance Considerations

- The schema includes partitioning options for high-volume systems
- Composite indexes are created for optimal query performance
- Consider enabling connection pooling for production deployments

## Backup Strategy

```sql
-- Create daily backups
CREATE DATABASE collegeflow_backup WITH TEMPLATE collegeflow;

-- Export schema and data
pg_dump -h localhost -U postgres -d collegeflow > backup_$(date +%Y%m%d).sql
```

## Migration Strategy

```sql
-- Version your migrations
CREATE TABLE schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    sql_content TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
);
```
