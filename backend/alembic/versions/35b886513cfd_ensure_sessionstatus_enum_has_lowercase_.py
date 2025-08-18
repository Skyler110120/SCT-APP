"""ensure sessionstatus enum has lowercase values

Revision ID: 35b886513cfd
Revises: 63d9e6f887f6
Create Date: 2025-08-14 12:27:11.918235

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '35b886513cfd'
down_revision: Union[str, Sequence[str], None] = '63d9e6f887f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ensure sessionstatus enum has all required lowercase values."""
    
    print("🎯 Ensuring sessionstatus enum has clean lowercase values...")
    
    # The enum values we need for our SessionStatus Python enum
    required_values = ['scheduled', 'in_progress', 'completed', 'cancelled']
    
    try:
        # PostgreSQL enum operations need to be outside transactions
        op.execute("COMMIT")  # End current transaction
        
        # Add each required value (PostgreSQL ignores if already exists in newer versions)
        for value in required_values:
            try:
                # Note: IF NOT EXISTS isn't available in all PostgreSQL versions
                # So we use try/except to handle duplicates gracefully
                op.execute(f"ALTER TYPE sessionstatus ADD VALUE '{value}'")
                print(f"✅ Added '{value}' to sessionstatus enum")
            except Exception as e:
                # If the value already exists, that's perfectly fine
                if "already exists" in str(e).lower():
                    print(f"ℹ️  '{value}' already exists in enum (that's fine!)")
                else:
                    print(f"⚠️  Unexpected error adding '{value}': {e}")
                    # Re-raise if it's not a "already exists" error
                    raise e
        
        op.execute("BEGIN")  # Start new transaction for any remaining operations
        
    except Exception as e:
        print(f"❌ Error updating sessionstatus enum: {e}")
        op.execute("BEGIN")  # Ensure we're back in transaction state
        raise
    
    print("🎉 SessionStatus enum now has all required lowercase values!")
    print("📝 Next: Create new sessions through your app to test!")


def downgrade() -> None:
    """Downgrade schema."""
    pass