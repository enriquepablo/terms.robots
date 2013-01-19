

(function ($) {

  var Term = Backbone.View.extend({
    render: function () {
      if (!this.options.elem) {
        var that = this;
        $.get('/terms/' + this.options.type, function (data) {
          var verbs = eval('(' + data + ')');
          var opts = '<option> -- </option>';
          for (var verb in verbs) {
            opts += '<option>' + verbs[verb] + '</option>';
          }
          var html = '<select class="verbs" name="verbs">' + opts + '</select>';
          that.options.elem = $(html);
          that.$el.append(that.options.elem);
          that.options.elem.change(function () {
            that.update($(this).val());
          });
        });
        window.finished = false;
      } else {
        this.$el.empty();
        this.$el.append(this.options.elem);
        if (!this.options.name) {
          var that = this;
          this.options.elem.change(function () {
            that.update($(this).val());
          });
          window.finished = false;
        }
      }
    },
    update: function (value) {
      this.options.name = value;
      var html = '<span class="term">' + value + '</span>';
      this.options.elem = $(html);
      app.render();
    },
    to_string: function () {
      return this.options.name;
    }
  });

  var Fact = Backbone.View.extend({
    render: function () {
      this.$el.empty();
      this.$el.append(this.options.verb.$el);
      this.options.verb.render();
      if ((this.options.verb.options.name) && (this.options.objects.length == 0)) {
        window.finished = false;
        var that = this;
        $.get('/verb/' + this.options.verb.options.name, function (data) {
          var objs = eval('(' + data + ')');
          for (var ob in objs) {
            var o = objs[ob];
            if (o[0].indexOf('_') == o[0].length - 1) {
              continue;
            }
            var elem = $('<span class="object"></span>');
            if (o[2]) {  // fact
              var elem2 = $('<span class="verb"></span>');
              elem.append(elem2);
              that.options.objects.push([o[0], new Fact({el: elem, verb: new Term({el: elem2, elem: null, type: 'verb', name: ''}), objects: []})]);
            } else {
              that.options.objects.push([o[0], new Term({el: elem, elem: null, type: o[1], name: ''})]);
            }
            that.$el.append(elem);
          }
          that.render_objects();
        });
      }
      else {
        this.render_objects();
      }
    },
    render_objects: function () {
      for (var ob in this.options.objects) {
        var o = this.options.objects[ob];
        elem = o[1].$el.detach();
        if (o[0] == 'subj') {
          this.options.verb.$el.prepend(o[1].$el);
          o[1].render();
        } else {
          this.options.verb.$el.append(o[1].$el);
          o[1].render();
          if (!o[1].$el.children().first().hasClass('label')) {
            var elem = $('<span class="label">' + o[0] + '</span>');
            o[1].$el.prepend(elem);
          }
        }
      }
      var lparen = $('<span class="paren">(</span>');
      var rparen = $('<span class="paren">)</span>');
      this.$el.prepend(lparen);
      this.$el.append(rparen);
    },
    to_string: function () {
      var subj = '';
      var objs = '';
      for (obj in this.options.objects) {
        o = this.options.objects[obj];
        if (o[0] == 'subj') {
          subj = o[1].to_string();
        } else {
          objs += ', ' + o[0] + ' ' + o[1].to_string();
        }
      }
      return '(' + this.options.verb.to_string() + ' ' + subj + objs + ')';
    }
  });


  var App = Backbone.View.extend({
    initialize: function () {
      var elem = $('<span class="fact"></span>');
      var elem2 = $('<span class="verb"></span>');
      elem.append(elem2);
      this.fact = new Fact({el: elem, verb: new Term({el: elem2, elem: null, type: 'verb', name: ''}), objects: []});
      this.$el.append(elem);
      this.render();
    },
    render: function () {
      window.finished = true;
      this.fact.render();
      if (window.finished) {
        var that = this;
        var tell = $('<button>tell</button>');
        this.fact.$el.after(tell);
        tell.click(function () {
          $.post('/facts/' + that.fact.to_string(), function (data) {
            var resp = eval('(' + data + ')');
            $('div#response').html(resp);
          });
        });
        var ask = $('<button>ask</button>');
        tell.after(ask);
        ask.click(function () {
          $.get('/facts/' + that.fact.to_string(), function (data) {
            var resp = eval('(' + data + ')');
            if (typeof resp === 'string') {
              $('div#response').html(resp);
            } else {
              var tab = $('<table id="resp"></table>');
              var head = $('<tr></tr>');
              tab.append(head);
              for (var v in resp[0]) {
                 head.append($('<th>' + v + '</th>'));
              }
              for (var r in resp) {
                var res = resp[r];
                var row = $('<tr></tr>');
                tab.append(row);
                for (var c in res) {
                  row.append('<td>' + res[c] + '</td>');
                }
              }
              $('div#response').html(tab);
            }
          });
        });
      }
    }
  });

  $(document).ready( function () {
    window.app = new App({el: $("#fact-builder")});
  });

})(jQuery);
