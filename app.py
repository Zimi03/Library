from flask import Flask, g
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.orm import sessionmaker
from routes import routes_blueprint

# Dane połączenia
username = 'root'  # Użytkownik bazy danych
password = 'Kawilacak123'  # Hasło bazy danych
host = 'localhost:3306'  # Adres serwera MySQL
database = 'Library'  # Nazwa Twojej bazy

# Tworzenie połączenia z bazą danych
engine = create_engine(f'mysql+pymysql://{username}:{password}@{host}/{database}')


Session = sessionmaker(bind=engine)
session = Session()

# Pobierz metadane bazy
metadata = MetaData()

# Refleksja (wczytanie struktury tabel)
metadata.reflect(bind=engine)

# Wyświetl załadowane tabele
for table_name in metadata.tables:
    print(f"Załadowano tabelę: {table_name}")

app = Flask(__name__)

@app.before_request
def create_session():
    g.db = session

@app.teardown_request
def close_session(exception=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
app.register_blueprint(routes_blueprint)

if __name__ == '__main__':
    app.run()
