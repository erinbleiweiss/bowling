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
    roll1 = int(request.args.get('roll1'))
    roll2 = int(request.args.get('roll2'))
    current_total = int(request.args.get('current_total'))
    return str(current_total + roll1 + roll2)


@app.route("/calc_score_spare", methods=["GET"])
def calc_score_spare():
    return


@app.route("/calc_score_strike", methods=["GET"])
def calc_score_strike():
    """
    Calculates frame totals following a strike

    Request parameters:
    :param roll1:          Pins knocked down on first roll of frame
    :param roll2:          Pins knocked down on second roll of frame
    :param current_total:  Cumulative total score before strike was rolled

    :return:               JSON object
                           {
                              "prev": Total for previous (strike) frame
                              "current": Total for current frame
                           }
    """
    roll1 = int(request.args.get('roll1'))
    roll2 = int(request.args.get('roll2'))
    current_total = int(request.args.get('current_total'))

    frame_score = roll1 + roll2
    strike_frame_total = current_total + frame_score + 10
    current_frame_total = strike_frame_total + frame_score

    response = {
        "prev": strike_frame_total,
        "current": current_frame_total
    }
    return jsonify(response)



