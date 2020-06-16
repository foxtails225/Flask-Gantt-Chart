from flask import Flask, render_template
from flask_restful import Api
from flask_cors import CORS

from dashboard.dashboard import ReadExcelAPI

app = Flask(__name__)

api = Api(app)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

api.add_resource(ReadExcelAPI, '/readExcel/api/v1.0/dashboard', endpoint='get_data')


@app.route('/')
def dashboard():
    return render_template('dashboard.html')


if __name__ == '__main__':
    app.run()
