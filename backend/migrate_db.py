import sqlite3

def run_migration():
    conn = sqlite3.connect('ai_persona.db')
    cursor = conn.cursor()

    def add_col_if_missing(table, col, col_type):
        try:
            cursor.execute(f"PRAGMA table_info({table})")
            cols = [info[1] for info in cursor.fetchall()]
            if col not in cols:
                print(f"Adding {col} to {table}...")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        except Exception as e:
            print(f"Error on {table}.{col}: {e}")

    add_col_if_missing('users', 'age', 'INTEGER DEFAULT 25')
    add_col_if_missing('users', 'profession', 'VARCHAR')
    add_col_if_missing('users', 'interests', 'VARCHAR')
    add_col_if_missing('users', 'onboarding_completed', 'BOOLEAN DEFAULT 0')
    add_col_if_missing('users', 'is_verified', 'BOOLEAN DEFAULT 1')
    add_col_if_missing('users', 'avatar', 'VARCHAR')
    add_col_if_missing('users', 'bio', 'TEXT')
    add_col_if_missing('users', 'role', "VARCHAR DEFAULT 'user'")
    add_col_if_missing('users', 'active_persona_id', "VARCHAR DEFAULT 'krishna'")

    add_col_if_missing('conversations', 'is_pinned', 'BOOLEAN DEFAULT 0')
    add_col_if_missing('messages', 'attachment_url', 'VARCHAR')
    add_col_if_missing('messages', 'attachment_type', 'VARCHAR')

    add_col_if_missing('habits', 'icon', "VARCHAR DEFAULT '🧘'")
    add_col_if_missing('habits', 'category', "VARCHAR DEFAULT 'Wellness'")

    add_col_if_missing('journal_entries', 'gratitude', 'TEXT')
    add_col_if_missing('journal_entries', 'ai_summary', 'TEXT')

    add_col_if_missing('memories', 'title', 'VARCHAR')
    add_col_if_missing('memories', 'source_event', 'VARCHAR')
    add_col_if_missing('memories', 'date_label', "VARCHAR DEFAULT 'TODAY'")
    add_col_if_missing('memories', 'importance', "VARCHAR DEFAULT 'medium'")

    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == '__main__':
    run_migration()
