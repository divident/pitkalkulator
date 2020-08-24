import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'your_secret_key'


class ProductionConfig(Config):
    DEBUG = False
    user='admin'
    pw='your_password'
    db='pitkalkulator'
    host='db'
    
    SQLALCHEMY_DATABASE_URI = f'postgresql+psycopg2://{user}:{pw}@{host}/{db}'

class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'


class TestingConfig(Config):
    TESTING = True