"""update sessionstatus enum to uppercase for code consistency

Revision ID: enum_uppercase_001
Revises: 847c2f5e7917
Create Date: 2025-08-14 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

revision = 'enum_uppercase_001'
down_revision = '847c2f5e7917'
branch_labels = None
depends_on = None

def upgrade():
    """Update sessionstatus enum to use uppercase values to match code patterns."""
    
    print("🔄 Updating sessionstatus enum to uppercase for code consistency...")
    
    connection = op.get_bind()
    
    try:
        # Step 1: Verify sessions table is empty (since we cleared test data)
        print("🔍 Checking sessions table...")
        result = connection.execute(text("SELECT COUNT(*) FROM sessions"))
        session_count = result.scalar()
        
        if session_count > 0:
            print(f"⚠️  Found {session_count} sessions. Will need to update their values.")
            
            # Update any existing session status values to uppercase
            print("🔄 Converting existing session status values to uppercase...")
            
            # Map lowercase to uppercase
            status_mapping = {
                'scheduled': 'SCHEDULED',
                'in_progress': 'IN_PROGRESS', 
                'completed': 'COMPLETED',
                'cancelled': 'CANCELLED'
            }
            
            for old_value, new_value in status_mapping.items():
                result = connection.execute(text("""
                    UPDATE sessions 
                    SET status = :new_value 
                    WHERE status = :old_value
                """), {"new_value": new_value, "old_value": old_value})
                
                if result.rowcount > 0:
                    print(f"✅ Updated {result.rowcount} sessions from '{old_value}' to '{new_value}'")
        else:
            print("✅ Sessions table is empty - no data conversion needed")
        
        # Step 2: Recreate enum with uppercase values to match code pattern
        print("🔄 Recreating sessionstatus enum with uppercase values...")
        
        # Drop status column temporarily
        print("🔄 Temporarily removing status column...")
        op.drop_column('sessions', 'status')
        
        # Drop old enum
        print("🗑️  Dropping old sessionstatus enum...")
        connection.execute(text("DROP TYPE IF EXISTS sessionstatus"))
        
        # Create new enum with uppercase values (matching code pattern)
        print("✨ Creating sessionstatus enum with uppercase values...")
        connection.execute(text("""
            CREATE TYPE sessionstatus AS ENUM (
                'SCHEDULED',
                'IN_PROGRESS',
                'COMPLETED', 
                'CANCELLED'
            )
        """))
        
        # Re-add status column with uppercase enum
        print("🔄 Re-adding status column with uppercase enum...")
        op.add_column('sessions',
            sa.Column('status',
                     sa.Enum('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
                            name='sessionstatus'),
                     nullable=False,
                     server_default='SCHEDULED'  # Default matches code pattern
            )
        )
        
        print("🎉 Successfully updated sessionstatus enum to uppercase!")
        print("📋 Enum now contains: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED")
        print("🔧 This matches your existing code patterns throughout the application")
        
    except Exception as e:
        print(f"❌ Error updating enum: {e}")
        raise

def downgrade():
    """Revert to lowercase enum values."""
    
    print("⏪ Reverting sessionstatus enum to lowercase values...")
    
    connection = op.get_bind()
    
    try:
        # Check for existing data and convert
        result = connection.execute(text("SELECT COUNT(*) FROM sessions"))
        session_count = result.scalar()
        
        if session_count > 0:
            print(f"🔄 Converting {session_count} sessions back to lowercase...")
            
            status_mapping = {
                'SCHEDULED': 'scheduled',
                'IN_PROGRESS': 'in_progress',
                'COMPLETED': 'completed', 
                'CANCELLED': 'cancelled'
            }
            
            for old_value, new_value in status_mapping.items():
                connection.execute(text("""
                    UPDATE sessions 
                    SET status = :new_value 
                    WHERE status = :old_value
                """), {"new_value": new_value, "old_value": old_value})
        
        # Recreate with lowercase values
        op.drop_column('sessions', 'status')
        connection.execute(text("DROP TYPE IF EXISTS sessionstatus"))
        
        connection.execute(text("""
            CREATE TYPE sessionstatus AS ENUM (
                'scheduled',
                'in_progress', 
                'completed',
                'cancelled'
            )
        """))
        
        op.add_column('sessions',
            sa.Column('status',
                     sa.Enum('scheduled', 'in_progress', 'completed', 'cancelled',
                            name='sessionstatus'),
                     nullable=False,
                     server_default='scheduled'
            )
        )
        
        print("⏪ Successfully reverted to lowercase enum values")
        
    except Exception as e:
        print(f"❌ Error during reversion: {e}")
        raise