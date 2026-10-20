"""add is_deleted column

Revision ID: ce7a80ed5e54
Revises: 546774baade4
Create Date: 2026-09-16 16:49:15.473349

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce7a80ed5e54'
down_revision: Union[str, Sequence[str], None] = '546774baade4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'todos',
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
        )
    )

    op.alter_column(
        'todos',
        'is_deleted',
        server_default=None
    )


def downgrade() -> None:
    op.drop_column('todos', 'is_deleted')