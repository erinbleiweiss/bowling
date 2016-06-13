from flask import Flask, request, jsonify, make_response
from flask.ext.cors import CORS #pip install flask-cors

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello world!"


@app.route("/test", methods=["GET"])
def test():
    return "hey what's up hello"


@app.route("/calc_score", methods=["GET"])
def calc_score():
    roll1 = request.args.get('roll1')
    roll2 = request.args.get('roll2')
    current_total = request.args.get('current_total')
    return str(int(current_total) + int(roll1) + int(roll2))


@app.route("/calc_score_spare", methods=["GET"])
def calc_score_spare():
    return


@app.route("/calc_score_strike", methods=["GET"])
def calc_score_strike():
    return

