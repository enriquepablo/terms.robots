
'''
Eventually we have a web framework that is configured through
a Terms ontology,
and a python module that registers actions for verbs (on predicates),
and objects for terms.

actions put things in the response,
taking into account the predicated objects.

The templates that actions use query the kb to include/exclude components.
'''

import os
import sys
import json
import inspect


from terms.core.compiler import KnowledgeBase
from terms.core.terms import Term, Predicate, isa
from terms.core import sa
from terms.core.pluggable import init_environment

from terms.core.schemata import get_form_schema

from bottle import get, post, static_file

from deform import Form


STATIC = os.path.join(os.path.dirname(sys.modules['terms.robots'].__file__),
                      'static')


class TermsJSONEncoder(json.JSONEncoder):

    def default(self, obj):
        if type(obj) in (Term, Predicate):
            return str(obj)
        else:
            return super(TermsJSONEncoder, self).default(obj)


class TermsPlugin(object):
    ''' '''

    api = 2
    name = 'terms'

    def __init__(self, config):
        init_environment(config)
        Session = sa.get_sasession(config)
        self.kb = KnowledgeBase(Session(), config)

    def apply(self, callback, context):
        args = inspect.getargspec(context.callback)[0]
        if 'kb' not in args:
            return callback

        def wrapper(*args, **kwargs):
            kwargs['kb'] = self.kb
            return callback(*args, **kwargs)

        return wrapper


@get('/admin')
def index():
    return static_file('index.html', root=STATIC, mimetype='text/html')


@get('/static/<filepath:path>')
def static(filepath):
    return static_file(filepath, root=STATIC)


@get('/terms/<type_name>')
def get_terms(type_name, kb):
    term_type = kb.lexicon.get_term(type_name)
    terms = kb.lexicon.get_terms(term_type)
    return json.dumps(terms, cls=TermsJSONEncoder)


@get('/subterms/<superterm>')
def get_subterms(superterm, kb):
    sterm = kb.lexicon.get_term(superterm)
    terms = kb.lexicon.get_subterms(sterm)
    return json.dumps(terms, cls=TermsJSONEncoder)


@get('/facts/<facts>')
def get_facts(facts, kb):
    resp = kb.parse(facts + '?')
    return json.dumps(resp, cls=TermsJSONEncoder)


@get('/verb/<name>')
def get_verb(name, kb):
    verb = kb.lexicon.get_term(name)
    resp = []
    for ot in verb.object_types:
        isverb = isa(ot.obj_type, kb.lexicon.verb)
        resp.append([ot.label, ot.obj_type.name, isverb])
    return json.dumps(resp, cls=TermsJSONEncoder)


@post('/terms/<term>/<type>')
def post_term(term, type, kb):
    type = kb.lexicon.get_term(type)
    term = kb.lexicon.add_term(term, type)
    return json.dumps(term, cls=TermsJSONEncoder)


@post('/facts/<facts>')
def post_facts(facts, kb):
    resp = kb.parse(facts + '.')
    return json.dumps(resp, cls=TermsJSONEncoder)


@get('/form/<noun>')
def get_form(noun, kb):
    term = kb.lexicon.get_term(noun)
    schema = get_form_schema(term)
    form = Form(schema, buttons=('submit',))
    return form.render()
