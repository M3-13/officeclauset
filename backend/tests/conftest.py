import os

DB_PATH = "test.db"

if os.path.exists(DB_PATH):
    os.unlink(DB_PATH)

os.environ["DB_PATH"] = DB_PATH
