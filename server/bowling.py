from flask import Flask, request, jsonify, make_response
from flask.ext.cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/calc_score", methods=["GET"])
def calc_score():
    """
    Calculates frane totals following an open frame

    Request parameters:
    :param roll1:          Pins knocked down on first roll of current frane
    :param roll2:          Pins knocked down on second roll of current frane

    :return:               New cumulative total (str)
    """
    roll1 = int(request.args.get('roll1'))
    roll2 = int(request.args.get('roll2'))
    current_total = int(request.args.get('current_total'))

    return str(current_total + roll1 + roll2)


@app.route("/calc_score_spare", methods=["GET"])
def calc_score_spare():
    """
    Calculates frane totals following a strike

    Request parameters:
    :param roll1:          Pins knocked down on first roll of next frane
    :param current_total:  Cumulative total score before spare was rolled

    :return:               New cumulative total (str)
    """
    roll1 = int(request.args.get('roll1'))
    current_total = int(request.args.get('current_total'))

    spare_frame_total = roll1 + 10
    return str(current_total + spare_frame_total)


@app.route("/calc_score_strike", methods=["GET"])
def calc_score_strike():
    """
    Calculates frane totals following a strike

    Request parameters:
    :param roll1:          Pins knocked down on first roll of next frane
    :param roll2:          Pins knocked down on second roll of next frane
    :param current_total:  Cumulative total score before strike was rolled

    :return:               New cumulative total (str)
    """
    roll1 = int(request.args.get('roll1'))
    roll2 = int(request.args.get('roll2'))
    current_total = int(request.args.get('current_total'))

    frame_score = roll1 + roll2
    strike_frame_total = current_total + frame_score + 10
    return str(strike_frame_total)



