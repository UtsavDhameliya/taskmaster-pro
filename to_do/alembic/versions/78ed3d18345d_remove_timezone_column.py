"""remove timezone column

Revision ID: 78ed3d18345d
Revises: 77d86c21f509
Create Date: 2026-09-15 12:09:06.987383

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '78ed3d18345d'
down_revision: Union[str, Sequence[str], None] = '77d86c21f509'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('users', 'timezone')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        'users',
        sa.Column('timezone', sa.VARCHAR(length=50), nullable=True)
    )