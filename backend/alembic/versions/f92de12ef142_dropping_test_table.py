"""dropping test table

Revision ID: f92de12ef142
Revises: 55b85abd5b5f
Create Date: 2025-06-18 14:39:24.190041

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f92de12ef142'
down_revision: Union[str, Sequence[str], None] = '55b85abd5b5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
