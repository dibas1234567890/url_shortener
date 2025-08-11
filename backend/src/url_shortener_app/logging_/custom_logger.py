import logging
import sys 

logger = logging.getLogger(name="shortener-logger")

logger.setLevel(logging.DEBUG)

if not logger.handlers: 
    logger.addHandler(logging.StreamHandler(sys.stdout))
