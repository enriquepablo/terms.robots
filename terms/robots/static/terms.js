(function ($) {

    function Submitter (tosubmit, gen_mode) {
        this.elem = $('<button>' + gen_mode + '</button>');
        this.tosubmit = tosubmit;
        this.gen_mode = gen_mode;
    }

    Submitter.prototype.load_event = function () {
        var that = this;
        this.elem.click(function (e) {
            kb[that.gen_mode + '_' + that.tosubmit.gen_type](that.tosubmit);
        });
    };

    function Syntagm (type, parent, child_mode, gen_mode) {
        this.type = type;
        this.parent = parent;
        this.child_mode = child_mode;
        this.gen_mode = gen_mode;
        this.elem = $('<select></select>');
        this.elem.append($('<option>---</option>'));
        var that = this;
        $.get('/terms/' + this.type, function (data) {
            that.set_values(eval(data));
        });
    }

    Syntagm.prototype.load_event = function () {
        var that = this;
        this.elem.change(function (e) {
            that.parent.notify(that.elem.val(), that.child_mode);
        });
    };

    Syntagm.prototype.set_values = function (data) {
        for (var n in data) {
            e = $('<option>' + data[n] + '</option>');
            this.elem.append(e);
        }
    };

    Syntagm.prototype.to_trm = function () {
        return this.elem.val();
    };

    function Modifier (label, val, parent, gen_mode) {
        this.label = label;
        this.parent = parent;
        this.gen_mode = gen_mode;
        this.elem = $('<span class="arg"></span>');
        var lspan = $('<span class="label">' + label + '</span>');
        this.elem.append(lspan);
        this.val = val;
        this.elem.append(this.val.elem);
    }

    function Definition (type) {
        this.gen_type = 'name';
        this.elem = $('<span></span>');
        this.val = $('<input type="text">');
        this.elem.append(this.val);
        var econj = $('<span>is a</span>');
        this.elem.append(econj);
        this.type = new Syntagm(type, this, 'def', 'tell');
        this.type.load_event();
        this.elem.append(this.type.elem);
        this.submitter = new Submitter(this, 'tell');
        this.submitter.load_event();
        this.submitter.elem.hide();
        this.elem.append(this.submitter.elem);
    }

    Definition.prototype.notify = function (val, child_mode) {
        if (this.val.val() == '---') {
            this.submitter.elem.hide();
        } else {
            this.submitter.elem.show();
        }
    };

    function Fact (gen_mode, parent) {
        this.gen_type = 'fact';
        this.gen_mode = gen_mode;
        this.parent = parent;
        this.elem = $('<span></span>');
        this.lparen();
        this.verb = new Syntagm('verb', this, 'verb', gen_mode);
        this.verb.load_event();
        this.elem.append(this.verb.elem);
        if (this.parent === null) {
            this.submitter = new Submitter(this, gen_mode);
            this.submitter.load_event();
            this.submitter.elem.hide();
            this.elem.append(this.submitter.elem);
        }
        this.rparen();
    }

    Fact.prototype.lparen = function () {
        var lparen = $('<span>(</span>');
        this.elem.html(lparen);
    };

    Fact.prototype.rparen = function () {
        var rparen = $('<span>)</span>');
        this.elem.append(rparen);
    };

    Fact.prototype.notify = function (val, child_mode) {
        if (child_mode === 'verb'){
            this.update_verb(val);
        } else if (child_mode === 'arg') {
            if ((this.subject.elem.val() !== '---') &&
                (this.verb.elem.val() !== '---')) {
                  for (var arg in this.args) {
                      if (this.args[arg].val.elem.val() === '---') {
                          if (this.parent === null) {
                              this.submitter.elem.hide();
                          }
                          return
                      }
                  }
                  if (this.parent === null) {
                      this.submitter.elem.show();
                  } else {
                      this.parent.notify(this, 'arg');
                  }
            }
        }
    };

    Fact.prototype.update_verb = function (verb) {
        var that = this;
        $.get('/verb/' + verb, function (data) {
            that.update_fact(eval(data));
        });
    };

    Fact.prototype.load_event = function () {
    };

    Fact.prototype.update_fact = function (objs) {
        this.args = new Array();
        for (var ob in objs) {
            var o = objs[ob];
            if (o[0].indexOf('_') == o[0].length - 1) {
                continue;
            } else if (o[0] == 'subj') {
                this.subject = new Syntagm(o[1], this, 'subject', this.gen_mode);
            } else if (o[2]) {
                var val = new Fact(this.gen_mode, this);
                var mod = new Modifier (o[0], val, this, this.gen_mode)
                this.args.push(mod);
            } else {
                var val = new Syntagm(o[1], this, 'arg', this.gen_mode);
                val.load_event();
                var mod = new Modifier (o[0], val, this, this.gen_mode)
                this.args.push(mod);
            }
        }
        this.lparen();
        this.subject.load_event();
        this.elem.append(this.subject.elem);
        this.verb.load_event();
        this.elem.append(this.verb.elem);
        for (var arg in this.args) {
            var mod = this.args[arg];
            mod.val.load_event();
            this.elem.append(mod.elem);
        }
        this.rparen();
        if (this.parent === null) {
            this.submitter.load_event();
            this.submitter.elem.hide();
            this.elem.append(this.submitter.elem);
        }
    };

    Fact.prototype.to_trm = function () {
        var trm = '(';
        trm += this.verb.elem.val() + ' ';
        trm += this.subject.elem.val();
        for (var a in this.args) {
            var arg = this.args[a];
            trm += ', ' + arg.label + ' ' + arg.val.to_trm();
        }
        trm += ')';
        return trm
    };

    var kb = {
        tell_name: function (totell) {
            var type = totell.type.elem.val();
            var name = totell.val.val();
            $.post('/terms/' + name + '/' + type, function (d) {
                update_answer(eval(d));
            });
        },
        tell_fact: function (totell) {
            var trm = totell.to_trm();
            $.post('/facts/' + trm, function (d) {
                update_answer(eval(d));
            });
        },
        ask_fact: function (toask) {
            var trm = toask.to_trm();
            $.get('/facts/' + trm, function (d) {
                update_answer(eval(d));
            });
        }
    };

    function initialize () {
        elems.to_tell_name.click(function (e) {
            var def = new Definition('noun');
            elems.to_ask.html(def.elem);
        });
        elems.to_tell_fact.click(function () {
            var fact = new Fact('tell', null);
            elems.to_ask.html(fact.elem);
        });
        elems.to_ask_fact.click(function () {
            var fact = new Fact('ask', null);
            elems.to_ask.html(fact.elem);
        });
    }

    function update_answer (d) {
        if (typeof d === 'string') {
              elems.to_answer.html(d);
            } else {
              var tab = $('<table id="resp"></table>');
              var head = $('<tr></tr>');
              tab.append(head);
              for (var v in d[0]) {
                 head.append($('<th>' + v + '</th>'));
              }
              for (var r in d) {
                var res = d[r];
                var row = $('<tr></tr>');
                tab.append(row);
                for (var c in res) {
                  row.append('<td>' + res[c] + '</td>');
                }
              }
              elems.to_answer.html(tab);
          }
    }

    var elems = {
    };

    $(document).ready(function () {
        elems.to_tell_name = $('#to-tell-name');
        elems.to_tell_fact = $('#to-tell-fact');
        elems.to_ask_fact = $('#to-ask-fact');
        elems.to_ask = $('#to-ask');
        elems.to_answer = $('#to-answer');
        initialize();
    });

})(jQuery);
