# Copyright (c) 2007-2012 by Enrique Pérez Arnaud <enriquepablo@gmail.com>
#
# This file is part of the terms project.
# https://github.com/enriquepablo/terms
#
# The terms project is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# The terms project is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with any part of the terms project.
# If not, see <http://www.gnu.org/licenses/>.


#import distribute_setup
#distribute_setup.use_setuptools()
from setuptools import setup, find_packages

VERSION = '0.1.0a1dev2'

setup(
    name = 'terms.robots',
    version = VERSION,
    author = 'Enrique Pérez Arnaud',
    author_email = 'enriquepablo@gmail.com',
    url = 'http://pypi.python.org/terms.core',
    license = 'GNU GENERAL PUBLIC LICENSE Version 3',
    description = 'Serve terms through HTTP',
    long_description = (open('README.rst').read() +
                        '\n' + open('INSTALL.rst').read()) +
                        '\n' + open('SUPPORT.rst').read(),

    packages = find_packages(),
    namespace_packages = ['terms'],
    test_suite = 'nose.collector',
    include_package_data = True,

    entry_points = {
        'console_scripts': [
            'serve = terms.robots.scripts.serve:main',
        ],
    },
    tests_require = [
    ],
    extras_require = {
        },
    install_requires = [
        'bottle',
        'Terms[PG]',
        'deform',
        'colanderalchemy',
    ],
)
