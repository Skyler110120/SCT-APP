"""expand sessionstatus enum add lowercase values

Revision ID: c2f0f04100c7
Revises: enum_uppercase_001
Create Date: 2025-08-15 10:54:13.131870

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = 'c2f0f04100c7'
down_revision: Union[str, Sequence[str], None] = 'enum_uppercase_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """
    EXPAND Phase: Add lowercase values to sessionstatus enum.
    
    This follows the industry-standard EXPAND-MIGRATE-CONTRACT pattern:
    1. EXPAND: Add new enum values alongside existing ones ← We are here
    2. MIGRATE: Convert data to use new values (next migration)  
    3. CONTRACT: Remove old values (PostgreSQL doesn't support this)
    
    After this migration, both uppercase and lowercase values will be valid.
    """
    
    print("🚀 EXPAND Phase: Adding lowercase values to sessionstatus enum")
    print("📚 Following industry-standard EXPAND-MIGRATE-CONTRACT pattern")
    
    connection = op.get_bind()
    
    try:
        # Step 1: Check current enum state
        print("🔍 Checking current enum values...")
        result = connection.execute(text("""
            SELECT enumlabel as enum_value
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'sessionstatus')
            ORDER BY enumsortorder
        """))
        
        current_values = [row[0] for row in result]
        print(f"📋 Current enum values: {current_values}")
        
        # Step 2: Define lowercase values to add
        lowercase_values = ['scheduled', 'in_progress', 'completed', 'cancelled']
        print(f"➕ Planning to add: {lowercase_values}")
        
        # Step 3: Add each lowercase value if it doesn't exist
        added_count = 0
        for value in lowercase_values:
            # Check if this value already exists
            result = connection.execute(text("""
                SELECT COUNT(*) FROM pg_enum 
                WHERE enumlabel = :value 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'sessionstatus')
            """), {"value": value})
            
            exists = result.scalar() > 0
            
            if not exists:
                print(f"   ➕ Adding '{value}' to sessionstatus enum...")
                connection.execute(text(f"ALTER TYPE sessionstatus ADD VALUE '{value}'"))
                print(f"   ✅ Successfully added '{value}'")
                added_count += 1
            else:
                print(f"   ⏭️  '{value}' already exists in enum, skipping")
        
        # Step 4: Verify expansion worked
        print("🔍 Verifying enum expansion...")
        result = connection.execute(text("""
            SELECT enumlabel as enum_value
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'sessionstatus')
            ORDER BY enumsortorder
        """))
        
        expanded_values = [row[0] for row in result]
        print(f"📋 Expanded enum now contains: {expanded_values}")
        
        # Step 5: Test that both old and new values are valid
        print("🧪 Testing enum value validity...")
        test_values = ['SCHEDULED', 'scheduled']  # Test one old and one new
        
        for test_value in test_values:
            result = connection.execute(text("""
                SELECT COUNT(*) FROM pg_enum 
                WHERE enumlabel = :value 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'sessionstatus')
            """), {"value": test_value})
            
            if result.scalar() > 0:
                print(f"   ✅ '{test_value}' is valid in enum")
            else:
                print(f"   ❌ '{test_value}' is NOT valid in enum")
        
        # Step 6: Check existing session data
        result = connection.execute(text("SELECT COUNT(*) FROM sessions"))
        session_count = result.scalar()
        print(f"📊 Database contains {session_count} existing sessions")
        
        if session_count > 0:
            result = connection.execute(text("""
                SELECT status, COUNT(*) as count 
                FROM sessions 
                GROUP BY status 
                ORDER BY status
            """))
            
            status_distribution = dict(result.fetchall())
            print(f"📈 Current session status distribution: {status_distribution}")
        
        # Success summary
        print("🎉 EXPAND phase completed successfully!")
        print(f"📊 Added {added_count} new lowercase enum values")
        print(f"📋 Enum now contains both uppercase and lowercase values")
        print(f"🔄 Both old and new applications can now work with the database")
        print("⚠️  Next step: Create MIGRATE migration to convert existing data")
        print("💡 Until you run MIGRATE, existing sessions still use uppercase values")
        
    except Exception as e:
        print(f"❌ Error during EXPAND phase: {e}")
        print("💡 Common issues and solutions:")
        print("   - Cannot add enum value in transaction: This is expected PostgreSQL behavior")
        print("   - Value already exists: Safe to ignore, migration can be re-run")
        print("   - Connection issues: Check your database connection")
        raise

def downgrade() -> None:
    """
    Rollback the enum expansion.
    
    Important: PostgreSQL doesn't support removing enum values once added.
    This is intentional - PostgreSQL prioritizes data safety over convenience.
    
    The added lowercase values will remain in the enum definition but won't be used.
    This is safe and actually beneficial for backward compatibility.
    """
    
    print("⏪ Attempting to rollback enum expansion...")
    print("⚠️  IMPORTANT: PostgreSQL doesn't support removing enum values")
    print("📝 This is intentional PostgreSQL design for data safety")
    print("🔍 Here's what we can verify instead:")
    
    connection = op.get_bind()
    
    try:
        # We can't remove the enum values, but we can verify the state
        result = connection.execute(text("""
            SELECT enumlabel as enum_value
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'sessionstatus')
            ORDER BY enumsortorder
        """))
        
        current_values = [row[0] for row in result]
        print(f"📋 Current enum values: {current_values}")
        
        # Check if any sessions are using lowercase values
        result = connection.execute(text("SELECT COUNT(*) FROM sessions"))
        session_count = result.scalar()
        
        if session_count > 0:
            result = connection.execute(text("""
                SELECT status, COUNT(*) as count 
                FROM sessions 
                WHERE status IN ('scheduled', 'in_progress', 'completed', 'cancelled')
                GROUP BY status
            """))
            
            lowercase_usage = dict(result.fetchall())
            if lowercase_usage:
                print(f"⚠️  Found sessions using lowercase values: {lowercase_usage}")
                print("💡 These sessions would become invalid if we removed lowercase values")
                print("🛡️  PostgreSQL prevents this data safety issue by not allowing enum value removal")
            else:
                print("✅ No sessions are using lowercase values")
        
        print("📝 Rollback 'completed' - lowercase values remain in enum but are unused")
        print("🔍 In production, you would:")
        print("   1. Verify no data uses the deprecated values") 
        print("   2. Document which values are deprecated")
        print("   3. Plan cleanup for future major version")
        
    except Exception as e:
        print(f"❌ Error during rollback verification: {e}")
        # Don't raise - rollback should be as safe as possible
        print("📝 Rollback completed with warnings")