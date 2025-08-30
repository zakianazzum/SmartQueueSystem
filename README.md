# Database Migrations with Alembic

This project uses **Alembic** for database migrations.  
All SQLAlchemy models live in `app/models/`, with a shared `Base` in `app/db/base.py`.

---

## 🔧 Setup

Install dependencies:

```bash
pip install alembic sqlalchemy
```

```bash
alembic init alembic
```

```bash
alembic revision --autogenerate -m "describe_your_change"
```

```bash
alembic upgrade head
```
