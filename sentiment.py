class Sentiment():

    def __init__(self, dt, text, quotes):
        self.dt = dt
        self.text = text
        self.quotes = quotes
        self.score = ''
        self.features = []

    def get_date(self):
        return self.dt

    def get_text(self):
        return self.text

    def get_score(self):
        return self.score

    def set_score(self,score):
        self.score = score

    def get_features(self):
        return self.features

    def set_features(self, features):
        self.score = features

    def get_quotes(self):
        return self.quotes









