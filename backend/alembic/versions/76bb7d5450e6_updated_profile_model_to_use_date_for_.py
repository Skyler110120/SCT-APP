"""Updated profile model to use Date for date of birth

Revision ID: 76bb7d5450e6
Revises: 265b377f6d42
Create Date: 2025-08-18 15:40:56.608989

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '76bb7d5450e6'
down_revision: Union[str, Sequence[str], None] = '265b377f6d42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
