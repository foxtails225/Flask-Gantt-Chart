import pandas as pd
import json

from flask import Response
from flask_restful import Resource
from datetime import datetime


class newDict(dict):
    def __init__(self):
        self = dict()

    def add(self, key, value):
        self[key] = value


class ReadExcelAPI(Resource):

    def get(self):
        data = {}
        chart_type = ''
        res_type = ''
        tmp_data = []

        chart_types_sheet = pd.read_excel(r'excel/data.xlsx', sheet_name='Chart_Types')
        ct_sheet_headers = pd.DataFrame(chart_types_sheet).columns.tolist()
        ct_sheet_values = pd.DataFrame(chart_types_sheet).values.tolist()

        res_sheet = pd.read_excel(r'excel/data.xlsx', sheet_name='Resource_Usage')
        res_sheet_headers = pd.DataFrame(res_sheet).columns.tolist()
        res_sheet_values = pd.DataFrame(res_sheet).values.tolist()

        for cv_list in ct_sheet_values:
            for idx, cv in enumerate(cv_list):
                if idx == 0:
                    chart_type = cv
                    data[chart_type] = newDict()
                for i, ch in enumerate(ct_sheet_headers):
                    if idx == i and i != 0:
                        data[chart_type].add(ch, cv)

        for rv_list in res_sheet_values:
            res_type = rv_list[1]
            tmp_data = newDict()
            for idx, cv in enumerate(rv_list):
                if ('data' in data[res_type]) is False:
                    data[res_type]['data'] = []
                for i, ch in enumerate(res_sheet_headers):
                    if idx == i:
                        if i == 5 or i == 6:
                            cv = pd.to_datetime(cv).strftime("%Y-%m-%d")
                        tmp_data.add(ch, cv)

            if res_type:
                data[res_type]['data'].append(tmp_data)

        return Response(json.dumps(data))
