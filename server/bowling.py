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
    return


@app.route("/calc_score_spare", methods=["GET"])
def calc_score_spare():
    return


@app.route("/calc_score_strike", methods=["GET"])
def calc_score_strike():
    return

