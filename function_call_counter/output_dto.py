from json import JSONEncoder
from timeit import Timer
class FunctionCall:
    def __init__(self, caller: str = None, lineno: int = 0, return_value = None, process_time: Timer = None):
        if caller is None:
            caller = "Null"
        self.caller = caller
        self.lineno = lineno
        self.return_value = return_value
        self.process_time = process_time

    def __set_process_time__(self, process_time: Timer):
        self.process_time = process_time
    
    def __get_process_time__(self):
        return self.process_time

# this class allows us to use the json dumping functions
class FunctionCallerInfoEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__