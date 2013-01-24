from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm.exc import NoResultFound


class Schema(object):

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    _id = Column(String, primary_key=True)

    def __init__(self, name, **kwargs):
        self._id = name
        self.edit(**kwargs)

    def edit(self, **kwargs):
        for k in kwargs:
            setattr(self, k, kwargs[k])

Schema = declarative_base(cls=Schema)


def get_schema(noun):
    return globals()[noun.name]


def get_data(kb, name):
    schema = get_schema(name.term_type)
    try:
        return kb.session.query(schema).filter_by(_id=name).one()
    except NoResultFound:
        new = schema(name)
        kb.session.add(new)
        return new


def set_data(kb, name, **kwargs):
    data = get_data(name)
    data.edit(**kwargs)
