import unittest
import requests


class BowlingTest(unittest.TestCase):

    def __init__(self, *args, **kwargs):
        unittest.TestCase.__init__(self, *args, **kwargs)

    def setUp(self):
        self.hostname = "http://108.84.181.177:5001"
        print("setUp")

    def tearDown(self):
        print("tearDown")

    def api_get(self, endpoint, payload=None):
        """
        Helper function to make HTTP GET requests to the server
        :param endpoint: (String) URL of HTTP call
        :return:
        """
        url = "{0}/{1}".format(self.hostname, endpoint)
        print(url)
        response = requests.get(url, params=payload)
        return response

    def test_score(self):
        payload = {
            'roll1': '3',
            'roll2': '5',
            'current_total': '0'
        }
        response = self.api_get('calc_score', payload)
        self.assertEqual(response.content, '8')

    def test_score_spare(self):
        payload = {
            'roll1': '10',
            'current_total': '8'
        }
        response = self.api_get('calc_score_spare', payload)
        self.assertEqual(response.content, '28')

    def test_score_strike(self):
        payload = {
            'roll1': '8',
            'roll2': '1',
            'current_total': '28'
        }
        response = self.api_get('calc_score_strike', payload)
        self.assertEqual(response.content, '47')

