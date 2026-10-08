import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="12943@a",
        database="supply_chain_db"
    )

    return connection