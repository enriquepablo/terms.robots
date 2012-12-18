import sys
from bottle import run, install
from terms.robots.robot import TermsPlugin

def main():
    if len(sys.argv) > 1:
        name = sys.argv[1]
    else:
        name = 'default'
    tplugin = TermsPlugin(name)
    install(tplugin)
    config = tplugin.config
    host = 'http_host' in config and config['http_host'] or 'localhost'
    port = 'http_port' in config and config['http_port'] or 8080
    debug = 'debug' in config and config.getboolean('debug') or False
    run(host=host, port=port, debug=True)
