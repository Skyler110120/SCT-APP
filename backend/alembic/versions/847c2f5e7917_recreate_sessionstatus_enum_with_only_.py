"""recreate sessionstatus enum with only lowercase values

Revision ID: 847c2f5e7917
Revises: 35b886513cfd
Create Date: 2025-08-14 17:32:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text  # ← Import for SQLAlchemy 2.x compatibility

revision = '847c2f5e7917'
down_revision = '35b886513cfd'
branch_labels = None  
depends_on = None

def upgrade():
    """Recreate sessionstatus enum with only clean lowercase values."""
    
    print("🧹 Recreating sessionstatus enum with only lowercase values...")
    
    # Get database connection
    connection = op.get_bind()
    
    try:
        # Step 1: Verify no session data exists (safety check)
        print("🔍 Checking if sessions table is empty...")
        
        # ✅ FIXED: Use text() for SQLAlchemy 2.x compatibility
        result = connection.execute(text("SELECT COUNT(*) FROM sessions"))
        session_count = result.scalar()
        
        if session_count > 0:
            raise Exception(f"❌ Cannot recreate enum: {session_count} sessions exist! Delete them first.")
        
        print(f"✅ Confirmed sessions table is empty ({session_count} sessions)")
        
        # Step 2: Drop the column that uses the enum (temporary)  
        print("🔄 Temporarily dropping status column...")
        op.drop_column('sessions', 'status')
        
        # Step 3: Drop the old enum type
        print("🗑️  Dropping old sessionstatus enum...")
        # ✅ FIXED: Use text() wrapper
        connection.execute(text("DROP TYPE IF EXISTS sessionstatus"))
        
        # Step 4: Create new enum with only lowercase values
        print("✨ Creating clean sessionstatus enum...")
        # ✅ FIXED: Use text() wrapper
        connection.execute(text("""
            CREATE TYPE sessionstatus AS ENUM (
                'scheduled',
                'in_progress', 
                'completed',
                'cancelled'
            )
        """))
        
        # Step 5: Re-add the status column with the clean enum
        print("🔄 Re-adding status column with clean enum...")
        
        # ✅ USING ALEMBIC'S HIGH-LEVEL API (recommended for column operations)
        op.add_column('sessions', 
            sa.Column('status', 
                     sa.Enum('scheduled', 'in_progress', 'completed', 'cancelled', 
                            name='sessionstatus'), 
                     nullable=False,
                     server_default='scheduled'  # Default for new sessions
            )
        )
        
        print("🎉 Successfully recreated sessionstatus enum!")
        print("📋 Clean enum values: scheduled, in_progress, completed, cancelled")
        print("🚀 Ready to create sessions with consistent lowercase statuses!")
        
    except Exception as e:
        print(f"❌ Error during enum recreation: {e}")
        print("🔧 Check that:")
        print("   - Sessions table exists")
        print("   - No other tables reference sessionstatus enum")
        print("   - Database connection is working")
        raise

def downgrade():
    """Revert to the previous enum state."""
    
    print("⏪ Reverting sessionstatus enum changes...")
    
    connection = op.get_bind()
    
    try:
        # Drop current setup
        print("🔄 Dropping current status column...")
        op.drop_column('sessions', 'status')
        
        print("🗑️  Dropping current enum...")
        connection.execute(text("DROP TYPE IF EXISTS sessionstatus"))
        
        # Recreate previous mixed-case enum (what existed before this migration)
        print("📋 Recreating previous enum with mixed case...")
        connection.execute(text("""
            CREATE TYPE sessionstatus AS ENUM (
                'SCHEDULED',
                'COMPLETED', 
                'CANCELLED',
                'in_progress'
            )
        """))
        
        # Re-add column with previous enum
        op.add_column('sessions',
            sa.Column('status',
                     sa.Enum('SCHEDULED', 'COMPLETED', 'CANCELLED', 'in_progress',
                            name='sessionstatus'),
                     nullable=False,
                     server_default='SCHEDULED'
            )
        )
        
        print("⏪ Successfully reverted to previous enum state")
        
    except Exception as e:
        print(f"❌ Error during reversion: {e}")
        raise