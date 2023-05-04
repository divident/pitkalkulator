#  PITKALKULATOR

![Pitkalkulator](./client/public/favicon.png "Pitkalkulator")

Pitkalkulator is an application designed to facilitate the settlement of tax on stock profits obtained on the Revolut platform.

The application was developed using a REST API written with the [flask](https://flask.palletsprojects.com/en/1.1.x/)library. The [nextjs](https://nextjs.org/) library was used to present data in the client's browser.


### Running the Application

#### Development Environment

To run the application in a development environment, first install the dependencies using the following commands:
```
# REST API
pip install -r requirements.txt

# nextjs
npm install
```

Then run both applications:

```
# REST API
python app.py

# Database migration, only required for first run
flask db upgrade

# nextjs
npm run dev
```

#### Production Environment
To run in a production environment, you must install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/), and run the following command:

```
docker-compose up -d

# Database migration, only required for first run
docker exec -i <container_name> flask db upgrade 

```
A production environment is required for the correct functioning of `Decimal` numbers because the test SQLite database does not support them.

### Testing
The client layer currently does not have any tests (nextjs).

For the REST API, tests are located in the `test.py` file, and can be run with the following command:

```
python test.py
```
Unfortunately, the test data sets located in the `test_data` folder have been deleted because they contain personal data. To run the tests fully, you must add the reports you have to the `test_data` folder.

