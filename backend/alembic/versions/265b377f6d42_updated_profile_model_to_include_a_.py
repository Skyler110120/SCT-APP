"""Updated profile model to include a relationship with courses

Revision ID: 265b377f6d42
Revises: 4babe5fa7548
Create Date: 2025-08-18 10:25:20.827652

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '265b377f6d42'
down_revision: Union[str, Sequence[str], None] = '4babe5fa7548'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
