import json

class Items(object):

    def __init__(self,w,u,t):
        self.w = w
        self.u = u
        self.t = t


    def set_date(self,d):
        self.d = d

    def set_url(self,u):
        self.u = u

    def set_text(self,t):
        self.t = t

    def set_keyWord(self,w):
        self.w = w

    def get_date(self):
        return self.d

    def get_url(self):
        return self.u

    def get_text(self):
        return self.t

    def get_keyWord(self):
        return self.w

    def reprJSON(self):
        return dict(u=self.u, t= self.t, w=self.w )

    def toJSONString(self):
        return json.dumps(self, default=lambda o: o.__dict__,
                          sort_keys=True, indent=4)

