class Quote(object):

    def __init__(self,d,o,h,l,c,v):
        self.d = d
        self.o = o
        self.h = h
        self.l = l
        self.c = c
        self.v = v

    def reprJSON(self):
        return dict(d = self.d,o = self.o, h = self.h, l = self.l, c = self.c, v = self.v)

