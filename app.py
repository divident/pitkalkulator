import csv
import io
import os
import secrets
import tempfile
import uuid
import re
from collections import defaultdict
import datetime as dt
from functools import lru_cache
import decimal
from decimal import Decimal, Context, ROUND_DOWN, ROUND_UP
import PyPDF2
import requests
from flask import Flask, request, redirect, url_for, make_response, Response, send_from_directory, \
    jsonify
from flask_admin import Admin
from flask_admin.contrib import sqla
from flask_basicauth import BasicAuth
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename
from wtforms import StringField, TextAreaField, Form, validators
import config
import six

NBP_API = 'http://api.nbp.pl/api/exchangerates/rates/a/{currency}/{date}/?format=json'
UPLOAD_FOLDER = 'upload'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
app.config['BASIC_AUTH_USERNAME'] = 'admin'
app.config['BASIC_AUTH_PASSWORD'] = 'your_basic_auth_password'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
if os.environ.get('ENV', 'Development') == 'PROD':
    app.config.from_object(config.ProductionConfig)
else:
    app.config.from_object(config.DevelopmentConfig)

admin = Admin(app, name='pitkalkulator', template_mode='bootstrap3')
db = SQLAlchemy(app)
migrate = Migrate(app, db)
basic_auth = BasicAuth(app)


def cors(func):
    @six.wraps(func)
    def wrapper(*args, **kwargs):
        resp = func(*args, **kwargs)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    return wrapper


class AuthException(HTTPException):
    def __init__(self, message):
        super().__init__(message, Response(
            message, 401,
            {'WWW-Authenticate': 'Basic realm="Login Required"'}
        ))


class ModelView(sqla.ModelView):
    def is_accessible(self):
        if not basic_auth.authenticate():
            raise AuthException('Not authenticated. Refresh the page.')
        else:
            return True

    def inaccessible_callback(self, name, **kwargs):
        return redirect(basic_auth.challenge())

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    settle_date = db.Column(db.Date, index=True)
    currency = db.Column(db.String(3))
    symbol = db.Column(db.String(32))
    type = db.Column(db.String(16))
    quantity = db.Column(db.DECIMAL(scale=8, precision=20))
    price = db.Column(db.DECIMAL(scale=5, precision=20))
    request_id = db.Column(db.String(36), index=True)
    created_at = db.Column(db.Date, default=dt.datetime.utcnow)

    @property
    def serialize(self):
        return {
            'id': self.id,
            'settle_date': str(self.settle_date),
            'currency': self.currency,
            'symbol': self.symbol,
            'type': self.type,
            'price': str(self.price),
            'quantity': str(self.quantity)
        }


admin.add_view(ModelView(Activity, db.session))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        statement = AccountStatement()
        app.logger.error(request.files)
        files = request.files.getlist("files[]")
        app.logger.error(f"count={len(files)}")
        if len(files) < 1:
             return make_response(jsonify({'error': 'Nie wysłano żanych plików'}), 400)
        with tempfile.TemporaryDirectory(dir=app.config['UPLOAD_FOLDER']) as tmpdirname:
            filenames = []
            for file in files:
                if file and allowed_file(file.filename):
                    try:
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(tmpdirname, filename))
                        statement.create_from_pdf_file(
                            os.path.join(tmpdirname, filename))
                    except Exception as e:
                        app.logger.error(str(e))
                        return make_response(jsonify({'error': 'Niepoprawna zawartość pliku!'}), 400)

        request_id = statement.save_data()
        return make_response(jsonify({'request_id': request_id}), 200)


@lru_cache(maxsize=10)
def get_symbols(request_id):
    activities = Activity.query.filter_by(request_id=request_id).all()
    return sorted(list(set([a.symbol for a in activities])))


@app.route('/activity/<request_id>', methods=['POST'])
def acitvity_post(request_id):
    if request_id == 'demo':
        return make_response(jsonify(error="Dodawanie akcji do dema jest zablokowane"), 400) 
    if request.json is None:
        return make_response(jsonify(error="Niepoprawne zapytanie"), 400)
    else:
        symbol = request.json.get("symbol")
        settle_date = request.json.get("settle_date")
        currency = request.json.get("currency")
        type = "BUY"
        quantity = request.json.get("quantity")
        price = request.json.get("price")
        try:
            price = Decimal(price)
            quantity = Decimal(quantity)
            if price < Decimal(0) or quantity < Decimal(0):
                raise Exception()
        except Exception:
            return make_response(jsonify(error="Niepoprawna cena lub ilość"), 400) 
        if not symbol or not settle_date or not currency or not type:
            return make_response(jsonify(error="Brak wymagancyh parametrów"), 400)
        try:
            settle_date = dt.datetime.strptime(settle_date, '%Y-%m-%dT%H:%M:%S.%fZ')
        except ValueError as e:
            return make_response(jsonify(error="Nieprawidłowy format daty"), 400)
        activity = Activity(settle_date=settle_date, currency=currency, symbol=symbol, 
            type=type, quantity=quantity, price=price, request_id=request_id)
        db.session.add(activity)
        db.session.commit()
        return make_response(jsonify(settle_date=settle_date, currency=currency, 
            symbol=symbol, type=type, quantity=str(quantity), price=str(price), request_id=request_id), 201)


@app.route('/activity/<request_id>', methods=['GET'])
def activity_list(request_id):
    try:
        year = int(request.args.get('year'))
    except ValueError:
        year = None

    acitvity = Activity.query

    activities = acitvity.filter_by(
        request_id=request_id).order_by(Activity.settle_date.asc(), Activity.type.asc()).all()

    if len(activities) > 0:
        try:
            income, cost, year = AccountStatement.calculate_profit(activities, year=year)
            revenue = income - cost
            revenue = revenue.quantize(Decimal('.01'), rounding=ROUND_UP)
            income = income.quantize(Decimal('.01'), rounding=ROUND_UP)
            cost = cost.quantize(Decimal('.01'), rounding=ROUND_UP)
            return jsonify(activities=[a.serialize for a in activities], cost=str(cost),
            income=str(income), revenue=str(revenue), year=year)
        except AccountException as ex:
            return make_response(jsonify(
                error=str(ex),
                activities=[a.serialize for a in activities],
                income=str(0), cost=str(0), revenue=str(0), year=year
            ))
    else:
        return make_response(jsonify(error="Brak operacji o podanych kryteriach"), 404)


@app.route('/download/<request_id>/', methods = ['GET'])
def activity_download(request_id):
    activities=Activity.query.filter_by(request_id = request_id).all()
    file=io.StringIO()
    writer=csv.writer(file)
    writer.writerow(["Data", "Waluta", "Cena", "Ilość", "Spółka", "Operacja"])
    for activity in activities:
        writer.writerow([activity.settle_date, activity.currency, activity.price,
                         activity.quantity, activity.symbol, activity.type])

    output=make_response(file.getvalue())
    output.headers["Content-Disposition"]="attachment; filename=activities.csv"
    output.headers["Content-type"]="text/csv"
    return output


class AccountException(Exception):
    pass


@lru_cache(maxsize = 100)
def exchange_rate(currency, date):
    try:
        date -= dt.timedelta(days = 1)
        url=NBP_API.format(currency = currency,
                           date = date.strftime('%Y-%m-%d'))
        response=requests.get(url)
        retry=6
        while retry and response.status_code == 404:
            retry -= 1
            date -= dt.timedelta(days = 1)
            url=NBP_API.format(currency = currency,
                               date = date.strftime('%Y-%m-%d'))
            response=requests.get(url)

        rate=response.json()['rates'][0]['mid']
        return Decimal(format(rate, ".15g"))
    except Exception as e:
        app.logger.error(str(e))
        raise AccountException("Nastąpił błąd przy próbie pobrania kursu waluty. "
                               "Spróbuj ponownie za kilka minut")


class AccountStatement:
    ACTIVITY_PAGE = 4
    ROW_NUM = 8
    BEG_STR = "ACTIVITY"
    END_STR = "SWEEP ACTIVITY"
    SIX_FIELD_ACTIVITY = ["CSD", "CDEP"]
    FILTER_WORDS = set(['ACTIVITY', 'Trade Date', 'Settle Date', 'Currency',
                    'Activity Type', 'Symbol / Description', 'Quantity', 'Price', 'Amount', 'Agency.', 'Principal.', '.Principal', 'Principal'])
    FILTER_SYMBOL = re.compile(r'^\d+\.\d+ \w+\.$')
    DATE = re.compile(r'^\d{2}/\d{2}/\d{4}$')

    def __init__(self):
        self._activity_data = []
        self._request_id = str(uuid.uuid4())

    def create_from_pdf_file(self, file_path):
        with open(file_path, 'rb') as pdf_file:
            pdf = PyPDF2.PdfFileReader(pdf_file)
            activity_rows = []
            pages = pdf.getNumPages()
            for page in range(pages):
                activity_page = pdf.getPage(page)
                activity_rows += activity_page.extractText().split('\n')[:-12]
        beg_idx = activity_rows.index(self.BEG_STR)
        try:
            end_idx = activity_rows.index(self.END_STR)
        except ValueError:
            end_idx = len(activity_rows)

        activity_rows = activity_rows[beg_idx:end_idx]
        activity_rows = [row.strip()
                         for row in activity_rows if row and
                         not row.startswith("@") and row not in self.FILTER_WORDS]
        activity_rows = [
            row for row in activity_rows if not self.FILTER_SYMBOL.match(row)]
        row_idx = [i for i, e in enumerate(
            activity_rows) if self.DATE.match(e)]
        if len(row_idx) > 0:
            start_idx = [e for i, e in enumerate(row_idx) if i % 2 == 0]
            for i in range(len(start_idx) - 1):
                beg, end = start_idx[i], start_idx[i+1]
                self._activity_data.append(activity_rows[beg:end])

            beg = start_idx[-1]
            try:
                action_type = beg + 3
                if activity_rows[action_type] == 'BUY' or activity_rows[action_type] == 'SELL':
                    end = beg + 8
                    self._activity_data.append(activity_rows[beg:end])
            except IndexError as e:
                app.log_exception(e)

    def parse_activities(self):
        settle_date = 1
        currency = 2
        activity_type = 3
        symbol = 4
        quantity = -3
        price = -2

        activities = []

        for row in self._activity_data:
            if len(row) < 4:
                continue
            try:
                parsed_date = dt.datetime.strptime(
                    row[settle_date], '%m/%d/%Y')
            except ValueError as e:
                app.logger.error(str(e))
                continue
            # Handle special case
            if row.count("Your Default Tax Lot Disposition Method is:") > 0:
                row = row[0:row.index("Your Default Tax Lot Disposition Method is:")]
            if row[activity_type] == "BUY":
                share_name = row[symbol].split('-')[0].strip()
                [share_name].append(
                    (Decimal(row[price]), Decimal(row[quantity])))
                activity = Activity(settle_date=parsed_date, currency=row[currency], type=row[activity_type],
                                    symbol=share_name,
                                    quantity=Decimal(row[quantity]), price=Decimal(row[price]),
                                    request_id=self._request_id)
                activities.append(activity)
            if row[activity_type] == "SELL":
                share_name = row[symbol].split('-')[0].strip()
                activity = Activity(settle_date=parsed_date, currency=row[currency], type=row[activity_type],
                                    symbol=share_name,
                                    quantity=-Decimal(row[quantity]), price=Decimal(row[price]),
                                    request_id=self._request_id)
                activities.append(activity)
        return activities

    def save_data(self):
        activities = self.parse_activities()
        for activity in activities:
            db.session.add(activity)
        db.session.commit()
        return self._request_id

    @staticmethod
    def calculate_profit(activities, test_only=False, year=None, splits=None):
        buy_action = defaultdict(list)
        if year is None:
            if len(activities) > 0:
                last_year = activities[-1].settle_date.year
            else:
                last_year = 2020
        else:
            last_year = year

        income = Decimal(0)
        cost = Decimal(0)
        context = Context(prec=12, rounding=ROUND_DOWN)
        for activity in activities:
            if activity.type == 'BUY':
                if test_only:
                    rate = 1
                else:
                    rate = exchange_rate(activity.currency.lower(), activity.settle_date)
                buy_action[activity.symbol].append(
                    (activity.quantity, activity.price * rate))
            else:
                actions = buy_action[activity.symbol]
                actions_q = [q for q, _ in actions]
                sum_quantity = Decimal(0)
                for q in actions_q:
                    sum_quantity = context.add(sum_quantity, q)

                if sum_quantity < activity.quantity:
                    raise AccountException(f"Brakuje cen akcji {activity.symbol} w ilości "
                                           f"{activity.quantity - sum_quantity}. Dodaj pliki z brakującymi danymi")
                else:
                    avg_price = sum([q * p for q, p in actions]) / sum_quantity
                    # calculate profit only for the last year
                    if activity.settle_date.year == last_year:
                        # get exchange rate from nbp
                        if test_only:
                            rate = 1
                        else:
                            rate = exchange_rate(activity.currency.lower(
                            ), activity.settle_date)
                        income += activity.quantity * activity.price * rate
                        cost += avg_price * activity.quantity

                    current_quantity = activity.quantity
                    for i, item in enumerate(actions):
                        q, p = item
                        if q < current_quantity:
                            current_quantity = current_quantity - q
                            actions[i] = (0, p)
                        else:
                            q -= current_quantity
                            actions[i] = (q, p)
                            current_quantity = 0
        return income, cost, last_year

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
