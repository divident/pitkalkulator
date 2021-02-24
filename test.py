import uuid
import unittest
from datetime import datetime
from unittest import TestCase
from unittest.mock import patch
from decimal import Decimal
from app import AccountStatement, AccountException


class Activity:
    def __init__(self, symbol, type, quantity, price, currency='USD',
                 request_id=uuid.uuid4(), id=0, settle_date=datetime.now()):
        self.symbol = symbol
        self.type = type
        self.quantity = quantity
        self.price = price
        self.currency = currency
        self.request_id = request_id
        self.id = id
        self.settle_date = settle_date

    def __repr__(self):
        return f"{self.symbol} {self.type} {self.price}"


class Response:
    status_code = 200

    @staticmethod
    def json():
        return {'rates': [{'mid': 1.0}]}


class TestApp(TestCase):
    @patch('requests.get', return_value=Response)
    def test_calculate_profit_return_positive_profit(self, mock_get):
        buy = Activity('CCC', 'BUY', Decimal(20), Decimal('0.2'))
        sell = Activity('CCC', 'SELL', Decimal(20), Decimal('0.3'))
        activities = [buy, sell]
        income, cost, _ = AccountStatement.calculate_profit(activities)
        self.assertEqual(Decimal(2.0), income - cost)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_return_negative_profit(self, mock_get):
        buy = Activity('CCC', 'BUY', Decimal(20), Decimal('0.4'))
        sell = Activity('CCC', 'SELL', Decimal(20), Decimal('0.3'))
        activities = [buy, sell]
        income, cost, _ = AccountStatement.calculate_profit(activities)
        self.assertEqual(Decimal(-2.0), income - cost)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_return_profit_only_for_sold_quantity(self, mock_get):
        buy = Activity('CCC', 'BUY', Decimal(40), Decimal('0.4'))
        sell = Activity('CCC', 'SELL', Decimal(20), Decimal('0.3'))
        activities = [buy, sell]
        income, cost, _ = AccountStatement.calculate_profit(activities)
        self.assertEqual(Decimal(-2.0), income - cost)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_return_profit_from_fifo_buy_price(self, mock_get):
        buy_q, buy2_q, sell_q = 40, 20, 60
        buy = Activity('CCC', 'BUY', Decimal(buy_q), Decimal('0.4'))
        buy2 = Activity('CCC', 'BUY', Decimal(buy2_q), Decimal('0.2'))
        sell = Activity('CCC', 'SELL', Decimal(sell_q), Decimal('0.3'))
        activities = [buy, buy2, sell]
        income, cost, _ = AccountStatement.calculate_profit(activities)
        expected_profit = sell_q * 0.3 - (buy_q * 0.4 + buy2_q * 0.2)
        self.assertAlmostEqual(expected_profit, income - cost, places=6)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_return_exception_when_too_much_sell_quantity(self, mock_get):
        buy = Activity('CCC', 'BUY', Decimal(40), Decimal('0.4'))
        buy2 = Activity('CCC', 'BUY', Decimal(20), Decimal('0.2'))
        sell = Activity('CCC', 'SELL', Decimal(61), Decimal('0.3'))
        activities = [buy, buy2, sell]
        with self.assertRaises(AccountException):
            AccountStatement.calculate_profit(activities)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_return_profit_only_for_last_year(self, mock_get):
        buy2_q = 20
        buy2 = Activity('CCC', 'BUY', buy2_q, Decimal('0.2'),
                        settle_date=datetime.strptime("2018/12/22", "%Y/%m/%d"))
        sell_q = 10
        sell = Activity('CCC', 'SELL', sell_q, Decimal('0.3'),
                        settle_date=datetime.strptime("2019/12/22", "%Y/%m/%d"))
        buy_q = 40
        buy = Activity('CCC', 'BUY', buy_q, Decimal('0.4'),
                       settle_date=datetime.strptime("2020/12/21", "%Y/%m/%d"))
        sell2_q = 30
        sell2 = Activity('CCC', 'SELL', sell2_q, Decimal('0.3'),
                         settle_date=datetime.strptime("2020/12/22", "%Y/%m/%d"))
        # activities are sorted by date in db
        activities = sorted([buy, buy2, sell2, sell],
                            key=lambda x: x.settle_date)
        expected_profit = sell2_q * 0.3 - ((buy2_q - sell_q) * 0.2 + (buy_q - 20) * 0.4)


        income, cost, _ = AccountStatement.calculate_profit(activities)
        self.assertAlmostEqual(Decimal(expected_profit), income - cost)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_include_buy_before_sell_only(self, mock_get):
        buy_q = 40
        buy = Activity('CCC', 'BUY', buy_q, Decimal('0.4'),
                       settle_date=datetime.strptime("2020/12/21", "%Y/%m/%d"))
        buy2_q = 20
        buy2 = Activity('CCC', 'BUY', buy2_q, Decimal('0.2'),
                        settle_date=datetime.strptime("2018/12/22", "%Y/%m/%d"))
        sell_q = 10
        sell = Activity('CCC', 'SELL', sell_q, Decimal('0.3'),
                        settle_date=datetime.strptime("2020/11/22", "%Y/%m/%d"))

        # activities are sorted by date in db
        activities = sorted([buy, buy2, sell], key=lambda x: x.settle_date)
        income, cost, _ = AccountStatement.calculate_profit(activities)
        self.assertAlmostEqual(
            (Decimal('0.3') - Decimal('0.2')) * sell_q, income - cost)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_multiple_action_symbol(self, mock_get):
        buy_q = 40
        buy = Activity('CCC', 'BUY', buy_q, Decimal('0.4'))
        buy2_q = 20
        buy2 = Activity('INT', 'BUY', buy2_q, Decimal('0.2'))

        sell_q = 20
        sell = Activity('CCC', 'SELL', sell_q, Decimal('0.4'))
        sell2_q = 10
        sell2 = Activity('INT', 'SELL', sell2_q, Decimal('0.3'))

        activities = [buy, buy2, sell2, sell]
        income, cost, _ = AccountStatement.calculate_profit(activities)
        self.assertAlmostEqual((Decimal('0.4') - Decimal('0.4')) * sell_q +
                               (Decimal('0.3') - Decimal('0.2')) * sell2_q, income - cost)

    @patch('requests.get', return_value=Response)
    def test_calculate_profit_fifo_multile_buys(self, mock_get):
        buy_q = 10
        buy = Activity('CCC', 'BUY', buy_q, Decimal('0.4'))
        sell_q = 5
        sell = Activity('CCC', 'SELL', sell_q, Decimal('0.4'))

        buy2_q = 20
        buy2 = Activity('CCC', 'BUY', buy2_q, Decimal('0.2'))
        sell2_q = 15
        sell2 = Activity('CCC', 'SELL', sell2_q, Decimal('0.3'))

        activities = [buy, buy2, sell2, sell]
        expected_profit = sell_q * 0.4 - sell_q * 0.4 + sell2_q * 0.3 - (5 * 0.4 + 10 * 0.2)

        income, cost, _ = AccountStatement.calculate_profit(activities)
        self.assertAlmostEqual(expected_profit, income - cost)

class TestAccountStatement(TestCase):
    def test_create_from_pdf_multiple_pages(self):
        statement = AccountStatement()
        statement.create_from_pdf_file('test_data/april.pdf')
        self.assertEqual(Decimal(108), len(statement._activity_data))

    def test_create_from_pdf_with_strange_ending(self):
        statement = AccountStatement()
        statement.create_from_pdf_file('test_data/sie.pdf')
        activities = statement.parse_activities()
        activities = [e for e in activities if e.type == 'SELL']
        self.assertEqual(12, len(activities))

    def test_create_from_pdf(self):
        months = [
            # Należy podać nazwy raportów w folderze test_data
            # Niestety posiadają one dane personalne i publiczne repozytorium nie jest dobrym miejscem dla nich
        ]
        statement = AccountStatement()
        for month in months:
            statement.create_from_pdf_file(f'test_data/{month}')
        self.assertEqual(106, len(statement._activity_data))

    def test_calculate_income(self):
        months = [
            # Należy podać nazwy raportów w folderze test_data
            # Niestety posiadają one dane personalne i publiczne repozytorium nie jest dobrym miejscem dla nich
        ]
        statement = AccountStatement()

        for month in months:
            statement.create_from_pdf_file(f'test_data/{month}')
        activites = sorted(statement.parse_activities(),
                           key=lambda x: x.settle_date)
        activites = [e for e in activites if e.symbol == 'RLGY']
        # quantity, type, price
        #'71',         'BUY',  '5.5899', 
        #'0.55813953', 'BUY',  '5.59', 
        #'60',         'SELL', '7.40', 
        #'11',         'SELL', '7.40', 
        #'0.55813953', 'SELL', '7.40'
        income, cost, _ = statement.calculate_profit(activites, test_only=True)
        expected_profit = (60 * 7.40 - 60 * 5.5899 + 11 
            * 7.40 - (11 * 5.5899) + 0.55813953 * 7.40 - 0.55813953 * 5.59)
        self.assertAlmostEqual(Decimal(expected_profit), income - cost)

    def test_calculate_income_error_data(self):
        months = [
            # Należy podać nazwy raportów w folderze test_data
            # Niestety posiadają one dane personalne i publiczne repozytorium nie jest dobrym miejscem dla nich
        ]
        statement = AccountStatement()

        for month in months:
            statement.create_from_pdf_file(f'test_data/{month}')
        activites = sorted(statement.parse_activities(),
                           key=lambda x: x.settle_date)
        self.assertEqual(46, len(
            [row for row in statement._activity_data if row[3] == 'BUY' or row[3] == 'SELL']))
        statement.calculate_profit(activites, test_only=True)

if __name__ == '__main__':
    unittest.main()
