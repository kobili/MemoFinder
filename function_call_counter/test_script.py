import sys

arg = sys.argv[1]
if (arg):
  print("arg = {}".format(arg))
else:
  raise Exception("No argument passed")