import json
from Crawler.items import Items

class FinalData(object):

    def __init__(self, dt, item):
        self.dt = dt
        self.data = item

    def get_item(self):
        return self.data

    def reprJSON(self):
        return dict(dt=self.dt, data=self.data.reprJSON())



    def toJSONString(self):
        return json.dumps(self, default=lambda o: o.__dict__,
                          sort_keys=True)

class ComplexEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj,'reprJSON'):
            return obj.reprJSON()
        else:
            return json.JSONEncoder.default(self, obj)


