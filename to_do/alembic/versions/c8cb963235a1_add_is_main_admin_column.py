"""add is_main_admin column

Revision ID: c8cb963235a1
Revises: 8a2d45ab4c19
Create Date: 2026-09-23 15:36:51.747643
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c8cb963235a1"
down_revision: Union[str, Sequence[str], None] = "8a2d45ab4c19"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "users",
        sa.Column(
            "is_main_admin",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("users", "is_main_admin")