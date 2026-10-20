"""add attempts colums

Revision ID: 1c3ad86f19ca
Revises: 78ed3d18345d
Create Date: 2026-09-15 14:25:39.997072

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1c3ad86f19ca'
down_revision: Union[str, Sequence[str], None] = '78ed3d18345d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('login_attempts', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('blocked_until', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'blocked_until')
    op.drop_column('users', 'login_attempts')