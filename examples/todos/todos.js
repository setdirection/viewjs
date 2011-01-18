(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $(function() {
    var AppView, Todo, TodoList, TodoView, Todos;
    Todo = Backbone.Model.extend({
      EMPTY: 'empty todo...',
      initialize: function() {
        if (!this.get('content')) {
          return this.set({
            content: this.EMPTY
          });
        }
      },
      toggle: function() {
        return this.save({
          done: !this.get('done')
        });
      },
      clear: function() {
        this.destroy();
        return this.view.remove();
      }
    });
    TodoList = Backbone.Collection.extend({
      model: Todo,
      localStorage: new Store("todos"),
      done: function() {
        return this.filter(function(todo) {
          return todo.get('done');
        });
      },
      remaining: function() {
        return this.without.apply(this, this.done());
      },
      nextOrder: function() {
        if (!this.length) {
          return 1;
        }
        return this.last().get('order' + 1);
      },
      comparator: function(todo) {
        return todo.get('order');
      }
    });
    Todos = new TodoList;
    TodoView = $.view({
      initialize: function() {
        this.model = this.get('model');
        this.model.view = this;
        this.model.bind('change', this.render);
        this.ready(this.render);
        return this.li(this.todoElement = this.div({
          className: 'todo'
        }, this.div({
          className: 'display'
        }, $(this.input({
          className: 'check',
          type: 'checkbox',
          checked: this.model.get('done')
        })).click(this.toggleDone), this.contentElement = $(this.div({
          className: 'todo-content'
        })).dblclick(this.edit), $(this.div({
          className: 'todo-destroy'
        })).click(this.clear)), this.div({
          className: 'edit'
        }, this.inputElement = $(this.input({
          className: 'todo-input',
          type: 'text',
          value: ''
        })).bind({
          keypress: this.updateOnEnter,
          blur: this.close
        }))));
      },
      toggleDone: function() {
        return this.model.toggle();
      },
      edit: function() {
        this.$.addClass('editing');
        return this.inputElement.focus();
      },
      clear: function() {
        return this.model.clear();
      },
      updateOnEnter: function(e) {
        if (e.keyCode === 13) {
          return this.close();
        }
      },
      close: function() {
        this.model.save({
          content: this.inputElement.val()
        });
        return this.$.removeClass('editing');
      },
      remove: function() {
        return this.$.remove();
      },
      render: function() {
        var content;
        content = this.model.get('content');
        this.contentElement.text(content);
        this.inputElement.val(content);
        return $(this.todoElement)[this.model.get('done') ? 'addClass' : 'removeClass']('done');
      }
    });
    AppView = $.view({
      template: "<div id=\"todoapp\">\n  <div class=\"title\">\n    <h1>Todos</h1>\n  </div>\n  <div class=\"content\">\n    <div id=\"create-todo\">\n      <input id=\"new-todo\" placeholder=\"What needs to be done?\" type=\"text\" />\n      <span class=\"ui-tooltip-top\" style=\"display:none;\">Press Enter to save this task</span>\n    </div>\n    <div id=\"todos\">\n      <ul id=\"todo-list\"></ul>\n    </div>\n    <div id=\"todo-stats\"></div>\n  </div>\n</div>",
      initialize: function() {
        this.inputElement = this.$("#new-todo").bind({
          keypress: this.createOnEnter,
          keyup: this.showTooltip
        });
        this.statsElement = this.$('#todo-stats');
        this.listElement = this.$('#todo-list');
        this.tooltipElement = this.$('.ui-tooltip-top');
        Todos.bind('add', this.addOne);
        Todos.bind('refresh', this.addAll);
        Todos.bind('all', this.render);
        return Todos.fetch();
      },
      render: function() {
        this.total = Todos.length;
        this.done = Todos.done().length;
        this.remaining = Todos.remaining().length;
        this.statsElement.empty();
        if (this.total) {
          this.statsElement.append(this.span({
            className: 'todo-count'
          }, this.span(this.remaining, {
            className: 'number'
          }), this.span((this.remaining === 1 ? ' item ' : ' items '), {
            className: 'word'
          }), 'left.'));
        }
        if (this.done) {
          return this.statsElement.append($(this.span({
            className: 'todo-clear'
          }, this.a({
            href: '#'
          }, 'Clear ', this.span(this.done, {
            className: 'number-done'
          }), ' completed ', this.span((this.done === 1 ? 'item' : 'items'), {
            className: 'word-done'
          })))).click(this.clearCompleted));
        }
      },
      addOne: function(todo) {
        return this.listElement.append(new TodoView({
          model: todo
        }));
      },
      addAll: function() {
        return Todos.each(this.addOne);
      },
      newAttributes: function() {
        return {
          content: this.inputElement.val(),
          order: Todos.nextOrder(),
          done: false
        };
      },
      createOnEnter: function(e) {
        if (e.keyCode !== 13) {
          return;
        }
        Todos.create(this.newAttributes());
        return this.inputElement.val('');
      },
      clearCompleted: function() {
        this.map(Todos.done(), function(todo) {
          return todo.clear();
        });
        return false;
      },
      showTooltip: function(e) {
        var value;
        value = this.inputElement.val();
        this.tooltipElement.fadeOut();
        if (this.tooltipTimeout) {
          clearTimeout(this.tooltipTimeout);
        }
        if (value === '' || value === this.inputElement.attr('placeholder')) {
          return;
        }
        return this.tooltipTimeout = setTimeout(__bind(function() {
          return this.tooltipElement.show().fadeIn();
        }, this), 1000);
      }
    });
    return $(new AppView().element()).appendTo('#app');
  });
}).call(this);
