from flask import Flask, g
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from routes import routes_blueprint
from cyclic_events import check_reservation_date
from apscheduler.schedulers.background import BackgroundScheduler
import pytz

# Database connection details
username = 'root'
password = 'Projektnastudia12'
host = 'localhost:3306'
database = 'Library'

# Create engine and session
engine = create_engine(f'mysql+pymysql://{username}:{password}@{host}/{database}')
Session = sessionmaker(bind=engine)
session_alchemy = Session()

# Set up metadata for the database structure
metadata = MetaData()
metadata.reflect(bind=engine)
for table_name in metadata.tables:
    print(f"Loaded table: {table_name}")

# Flask application setup
app = Flask(__name__)
app.secret_key = "secret_key"
def start_scheduler():

    timezone = pytz.utc
    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(check_reservation_date, 'cron', hour=0, minute=0, args=[session_alchemy], timezone=timezone)
    scheduler.start()
    print("Scheduler started")

@app.before_request
def create_session():
    g.db = session_alchemy

@app.teardown_request
def close_session(exception=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

app.register_blueprint(routes_blueprint)
start_scheduler()  # Start the scheduler

if __name__ == '__main__':
    app.run(threaded=True)  # Run Flask with threading enabled
