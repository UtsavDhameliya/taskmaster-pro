"""change todo id to uuid string

Revision ID: 924fde60fabe
Revises: 1c3ad86f19ca
Create Date: 2026-09-16 12:11:26.546676
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '924fde60fabe'
down_revision: Union[str, Sequence[str], None] = '1c3ad86f19ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Change OTP.created_at from VARCHAR to DateTime
    op.alter_column(
        'OTP',
        'created_at',
        existing_type=sa.VARCHAR(length=50),
        type_=sa.DateTime(),
        existing_nullable=False,
        postgresql_using='created_at::timestamp without time zone'
    )


def downgrade() -> None:
    # Change OTP.created_at back to VARCHAR
    op.alter_column(
        'OTP',
        'created_at',
        existing_type=sa.DateTime(),
        type_=sa.VARCHAR(length=50),
        existing_nullable=False,
        postgresql_using='created_at::text'
    )