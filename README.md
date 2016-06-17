# Bowling Score Calculator
Demo at http://erinbleiweiss.com/bowling  

This project simulates scoring for a single-player game of bowling.

The bowling display, inputs, and core data models are written in Javascript/jQuery. Frame data is sent to a remote API for score calculations, and returned to the interface asynchronously.  

The backend application is a Flask API written in Python running on a CentOS server.

**Unit Tests**  
JS tests are run with QUnit (demo at http://erinbleiweiss.com/bowling/tests.html)
Python tests are run with PyTest `py.test tests.py`