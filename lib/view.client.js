(function() {
  var Builder, RouteResolver, Router, View, ViewManager, array_flatten, array_from, array_without_value, attribute_map, attribute_translations, bind_extend_handler, create_router, deffered, delegate_events, dispatcher, element_cache, environments, extend, has_change_callback, ie, ie_attribute_translation_sniffing_cache, ie_attribute_translations, is_$, is_array, is_collection, is_element, is_model, is_view, named_param, params_from_ordered_params_and_route, process_node_argument, proxy, reverse_lookup, router_initialized, routes_by_path, routes_by_view, routes_regexps_by_path, set_element, splat_param, supported_events, supported_html_tags, tag, tag_name, template_helpers, templates, wrap_function, _fn, _i, _len;
  var __slice = Array.prototype.slice, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  extend = function(destination, source) {
    var key, value;
    for (key in source) {
      value = source[key];
      destination[key] = value;
    }
    return destination;
  };
  is_view = function(object) {
    return Boolean(object && object.element && object.render);
  };
  is_model = function(object) {
    return Boolean(object && object.get && object.set && object.trigger && object.bind);
  };
  is_collection = function(object) {
    return Boolean(object && object.add && object.remove && object.trigger && object.bind);
  };
  is_array = function(array) {
    return Boolean(array && Object.prototype.toString.call(array) === '[object Array]');
  };
  is_element = function(element) {
    return Boolean((element != null ? element.nodeType : void 0) === 1 || (element != null ? element.nodeType : void 0) === 3);
  };
  is_$ = function($) {
    var _ref;
    return Boolean(($ != null ? $[0] : void 0) && ($ != null ? (_ref = $[0]) != null ? _ref.nodeType : void 0 : void 0) && ($.length != null));
  };
  wrap_function = function(func, wrapper) {
    return function() {
      return wrapper.apply(this, [proxy(func, this)].concat(array_from(arguments)));
    };
  };
  proxy = function(func, object) {
    var args;
    if (object === void 0) {
      return func;
    }
    if (arguments.length < 3) {
      return function() {
        return func.apply(object, arguments);
      };
    } else {
      args = array_from(arguments);
      args.shift();
      args.shift();
      return function() {
        return func.apply(object, args.concat(array_from(arguments)));
      };
    }
  };
  array_without_value = function(array) {
    var item, response, values, _i, _len;
    response = [];
    values = array_from(arguments).slice(1);
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (!(in_array(item, values) > -1)) {
        response.push(item);
      }
    }
    return response;
  };
  array_flatten = function(array) {
    var flattened, item, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (is_array(item)) {
        flattened = flattened.concat(array_flatten(item));
      } else {
        flattened.push(item);
      }
    }
    return flattened;
  };
  array_from = function(object) {
    var length, results;
    if (!object) {
      return [];
    }
    length = object.length || 0;
    results = new Array(length);
    while (length--) {
      results[length] = object[length];
    }
    return results;
  };
  View = {
    extend: function() {
      var argument, item, key, process_item, value, _base, _i, _len, _results;
      (_base = this.extend).api || (_base.api = {});
      this.mixin || (this.mixin = []);
      process_item = function(key, value) {
        var discard, should_add, _key;
        should_add = true;
        discard = function() {
          return should_add = false;
        };
        if (key === 'extend') {
          for (_key in value) {
            this.extend.api[_key] = value[_key];
          }
        } else {
          if (this.extend.api[key]) {
            this.extend.api[key].apply(this, [value, discard]);
          } else {
            this[key] = value;
          }
        }
        if (should_add) {
          return this.mixin.push([key, value]);
        }
      };
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        argument = arguments[_i];
        _results.push((function() {
          var _i, _len, _ref, _results, _results2;
          if (!is_view(argument) && typeof argument === 'function' && !(argument.mixin != null)) {
            return this.bind('ready', argument);
          } else if (argument) {
            if (argument.mixin != null) {
              _ref = argument.mixin;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                item = _ref[_i];
                _results.push(process_item.apply(this, item));
              }
              return _results;
            } else {
              _results2 = [];
              for (key in argument) {
                value = argument[key];
                _results2.push(process_item.apply(this, [key, value]));
              }
              return _results2;
            }
          }
        }).call(this));
      }
      return _results;
    }
  };
  View.extend({
    stack: function(commands) {
      var callback, command_name, method_name, _results;
      this._stack || (this._stack = {});
      _results = [];
      for (method_name in commands) {
        if (!this[method_name]) {
          this._stack[method_name] = {
            complete: function() {},
            stack: []
          };
          this[method_name] = function() {
            var step, _stack;
            _stack = array_from(this._stack[method_name].stack);
            step = function() {
              return (_stack.shift() || this._stack[method_name].complete).apply(this, array_from(arguments).concat([proxy(step, this)]));
            };
            return step.apply(this, array_from(arguments));
          };
        }
        _results.push((function() {
          var _ref, _results;
          _ref = commands[method_name];
          _results = [];
          for (command_name in _ref) {
            callback = _ref[command_name];
            _results.push((function() {
              switch (command_name) {
                case 'complete':
                  return this._stack[method_name].complete = callback;
                case 'add':
                  return this._stack[method_name].stack.push(callback);
                case 'clear':
                  return this._stack[method_name].stack = [];
              }
            }).call(this));
          }
          return _results;
        }).call(this));
      }
      return _results;
    }
  });
  View.extend({
    extend: {
      stack: function(commands) {
        return this.stack(commands);
      }
    }
  });
  View.extend({
    create: function() {
      var callback, class_name, created_views, instance, mixin, mixins, _i, _len, _ref;
      if (arguments.length === 0 || (arguments.length === 1 && typeof arguments[0] === 'function')) {
        instance = this.clone();
        instance.element();
        if (arguments[0]) {
          arguments[0].call(instance);
        }
        return instance;
      }
      created_views = {};
      _ref = arguments[0];
      for (class_name in _ref) {
        mixins = _ref[class_name];
        if (ViewManager.views[class_name] != null) {
          this.trigger('warning', class_name + ' already exists, overwriting.');
        }
        ViewManager.views[class_name] = created_views[class_name] = this.clone();
        ViewManager.views[class_name].name = class_name;
        if (is_array(mixins)) {
          for (_i = 0, _len = mixins.length; _i < _len; _i++) {
            mixin = mixins[_i];
            created_views[class_name].extend(mixin);
          }
        } else {
          created_views[class_name].extend(mixins);
        }
        created_views[class_name].element();
        if (deffered[class_name] != null) {
          while (callback = deffered[class_name].pop()) {
            callback.call(created_views[class_name]);
          }
        }
      }
      return created_views;
    },
    clone: function() {
      var klass;
      klass = {};
      klass.extend = this.extend;
      klass.extend.api = {};
      klass.attributes = {};
      klass._changed = false;
      klass._ready = false;
      klass._callbacks = {};
      klass.extend(this);
      return klass;
    }
  });
  View.extend({
    stack: {
      initialize: {
        add: function() {
          var args, next, _i;
          args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), next = arguments[_i++];
          if (this._initialized != null) {
            return;
          }
          this._initialized = true;
          if (args.length > 0) {
            if (is_model(args[0])) {
              this._model(args[0]);
            } else if (is_collection(args[0])) {
              this._collection(args[0]);
            } else if (typeof args[0] !== 'function') {
              this.set(args[0]);
            }
            if (typeof args[args.length - 1] === 'function') {
              this._initialize_callback = args[args.length - 1];
            }
          }
          return setTimeout(next, 0);
        }
      }
    }
  });
  View.extend({
    stack: {
      initialize: {
        complete: function() {
          this.render();
          if (this._initialize_callback) {
            this._initialize_callback.call(this);
          }
          return this.trigger.apply(this, ['initialize'].concat(__slice.call(arguments)));
        }
      }
    }
  });
  View.extend({
    extend: {
      initialize: function(callback) {
        return this.stack({
          initialize: {
            add: callback
          }
        });
      }
    }
  });
  View.extend({
    extend: {
      views: function(dependents) {
        var caller, dependent, _i, _len, _results;
        this.views = dependents;
        caller = this;
        _results = [];
        for (_i = 0, _len = dependents.length; _i < _len; _i++) {
          dependent = dependents[_i];
          _results.push((function(dependent) {
            return caller.extend({
              stack: {
                initialize: {
                  add: function() {
                    var args, next, view, _i;
                    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), next = arguments[_i++];
                    view = ViewManager(dependent);
                    view.bind({
                      ready: function() {
                        caller[dependent] = view;
                        return next.apply(next, args);
                      }
                    });
                    return view.initialize();
                  }
                }
              }
            });
          })(dependent));
        }
        return _results;
      }
    }
  });
  View.extend({
    bind: function(event_name, callback) {
      var _base, _callback, _event_name;
      if (arguments.length === 1 && typeof event_name === 'object') {
        for (_event_name in event_name) {
          _callback = event_name[_event_name];
          this.bind(_event_name, _callback);
        }
      } else {
        this._callbacks || (this._callbacks = {});
        (_base = this._callbacks)[event_name] || (_base[event_name] = []);
        if (!(__indexOf.call(this._callbacks[event_name], callback) >= 0)) {
          this._callbacks[event_name].push(callback);
        }
        if (event_name === 'ready' && this._ready) {
          callback.call(this);
        }
      }
      return this;
    },
    unbind: function(event_name, callback) {
      var calls, i, item, _len, _ref;
      if (!event_name) {
        this._callbacks = {};
      }
      calls = this._callbacks;
      if (!callback) {
        this._callbacks[event_name] = [];
      } else {
        if (!this._callbacks[event_name]) {
          return this;
        }
        _ref = this._callbacks[event_name];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          item = _ref[i];
          if (item === callback) {
            this._callbacks[event_name].splice(i, 1);
            break;
          }
        }
      }
      return this;
    },
    trigger: function(event_name) {
      var calls, item, _i, _j, _len, _len2, _ref, _ref2;
      calls = this._callbacks;
      if (!this._callbacks) {
        return this;
      }
      if (this._callbacks[event_name]) {
        _ref = this._callbacks[event_name];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          item.apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
      if (this._callbacks.all) {
        _ref2 = this._callbacks.all;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          item = _ref2[_j];
          item.apply(this, arguments);
        }
      }
      return this;
    }
  });
  View.extend({
    on: View.bind,
    removeListener: View.unbind,
    emit: View.trigger
  });
  bind_extend_handler = function(events) {
    var callback, event_name, _callback, _event_name, _results;
    _results = [];
    for (event_name in events) {
      callback = events[event_name];
      _results.push((function() {
        var _ref, _results;
        if (event_name === 'change' && typeof callback === 'object') {
          _ref = events.change;
          _results = [];
          for (_event_name in _ref) {
            _callback = _ref[_event_name];
            _results.push(this.bind('change:' + _event_name, _callback));
          }
          return _results;
        } else {
          return this.bind(event_name, callback);
        }
      }).call(this));
    }
    return _results;
  };
  View.extend({
    extend: {
      bind: bind_extend_handler
    }
  });
  View.extend({
    extend: {
      on: bind_extend_handler
    }
  });
  View.extend({
    on: {
      warning: function(warning) {
        if ((typeof console != "undefined" && console !== null ? console.log : void 0) != null) {
          return console.log.apply(console, ["" + this.name + " warning: "].concat(array_from(arguments)));
        }
      },
      error: function(error) {
        if ((typeof console != "undefined" && console !== null ? console.log : void 0) != null) {
          console.log.apply(console, ["" + (this.name || 'View') + " error: "].concat(array_from(arguments)));
        }
        throw error;
      }
    }
  });
  environments = {};
  View.extend({
    env: function(envs) {
      var callback, env_name, should_call, _callback, _env_name, _results;
      if (arguments.length === 2) {
        env_name = arguments[0], callback = arguments[1];
        if (!(environments[env_name] != null)) {
          should_call = false;
        } else if (typeof environments[env_name] === 'boolean') {
          should_call = environments[env_name];
        } else {
          should_call = environments[env_name]();
        }
        if (should_call) {
          return callback.call(this);
        }
      } else {
        _results = [];
        for (env_name in envs) {
          callback = envs[env_name];
          _results.push((function() {
            var _results;
            if (env_name === 'set') {
              _results = [];
              for (_env_name in callback) {
                _callback = callback[_env_name];
                _results.push(environments[_env_name] = _callback);
              }
              return _results;
            } else {
              return this.env(env_name, callback);
            }
          }).call(this));
        }
        return _results;
      }
    }
  });
  View.env({
    set: {
      server: function() {
        return ((typeof window != "undefined" && window !== null) && window.name === 'nodejs') || ((typeof process != "undefined" && process !== null) && (typeof require != "undefined" && require !== null) && (typeof global != "undefined" && global !== null) && (typeof module != "undefined" && module !== null));
      },
      client: function() {
        return (typeof window != "undefined" && window !== null) && (window.document != null);
      },
      browser: function() {
        return (typeof window != "undefined" && window !== null) && (window.name != null) && window.name !== 'nodejs';
      }
    }
  });
  View.extend({
    extend: {
      env: function(envs) {
        var args, env_name, response, _callback, _env_name, _results;
        _results = [];
        for (env_name in envs) {
          args = envs[env_name];
          _results.push((function() {
            var _results;
            if (env_name === 'set') {
              _results = [];
              for (_env_name in args) {
                _callback = args[_env_name];
                _results.push(environments[_env_name] = _callback);
              }
              return _results;
            } else {
              if (environments[env_name]()) {
                if (typeof args === 'function') {
                  response = args();
                  if (response) {
                    return this.extend(response);
                  }
                } else {
                  return this.extend(args);
                }
              }
            }
          }).call(this));
        }
        return _results;
      }
    }
  });
  View.extend({
    element: function() {
      var element;
      if (this[0]) {
        return this[0];
      }
      element = this.document.createElement('div');
      if (this.name) {
        element.setAttribute('class', this.name);
      }
      return set_element.call(this, element);
    },
    $: function(selector) {
      if (!(this._$ != null)) {
        this.trigger('error', "No DOM library is available in " + name);
      }
      return this._$(selector, this[0]);
    },
    delegate: function(events) {
      return this._delegatedEvents = events;
    }
  });
  View.extend({
    extend: {
      element: function(generator) {
        return this.element = function() {
          if (this[0]) {
            return this[0];
          }
          return set_element.call(this, generator.call(this));
        };
      },
      delegate: function(events) {
        return this.delegate(events);
      },
      $: function(dom_library, discard) {
        if (dom_library && dom_library.fn) {
          this._$ = dom_library;
          return dom_library.fn.view = reverse_lookup;
        } else {
          return this.trigger('error', 'Unsupported DOM library specified, use jQuery or Zepto', dom_library);
        }
      }
    }
  });
  set_element = function(element) {
    this.length = 1;
    this[0] = element;
    if (this._$) {
      extend(this.$, this._$(this[0]));
    }
    if (this._delegatedEvents) {
      return delegate_events.call(this, this._delegatedEvents, this[0]);
    }
  };
  delegate_events = function(events, element) {
    var discard, event_name, key, method_name, process_item, selector, _method_name, _ref, _ref2, _ref3, _results;
    if (!(events || (events = this._delegatedEvents))) {
      return;
    }
    if (!(((_ref = this._$) != null ? (_ref2 = _ref.fn) != null ? _ref2.delegate : void 0 : void 0) != null)) {
      this.trigger('error', 'No DOM library the supports delegate() available');
    }
    this._$(element).unbind();
    process_item = function(event_name, selector, method_name) {
      var method;
      method = proxy((typeof method_name === 'string' ? this[method_name] : method_name), this);
      if (selector === '') {
        return this._$(element).bind(event_name, method);
      } else {
        return this._$(element).delegate(selector, event_name, method);
      }
    };
    _results = [];
    for (key in events) {
      method_name = events[key];
      _ref3 = key.match(/^(\w+)\s*(.*)$/), discard = _ref3[0], event_name = _ref3[1], selector = _ref3[2];
      _results.push((function() {
        var _results;
        if (typeof method_name === 'string' || typeof method_name === 'function') {
          return process_item.call(this, event_name, selector, method_name);
        } else {
          _results = [];
          for (selector in method_name) {
            _method_name = method_name[selector];
            _results.push(process_item.call(this, event_name, selector, _method_name));
          }
          return _results;
        }
      }).call(this));
    }
    return _results;
  };
  reverse_lookup = function() {
    return ViewManager(this[0].className);
  };
  View.extend({
    env: {
      client: function() {
        return {
          document: window.document
        };
      }
    }
  });
  View.extend({
    extend: {
      defaults: function(defaults) {
        return this.set(defaults, {
          silent: true
        });
      }
    }
  });
  View.extend({
    _model: function(model) {
      if (is_model(model)) {
        return this.model = model;
      } else {
        return this.trigger('error', 'The model object passed is not a valid model.');
      }
    },
    _collection: function(collection) {
      if (is_collection(collection)) {
        this.collection = collection;
        this.collection.bind('all', __bind(function() {
          return this.trigger.apply(this, arguments);
        }, this));
        this.bind({
          add: function(model) {
            this._elements[model.cid] = this._render(model);
            return this[0].insertBefore(this._elements[model.cid], this[0].childNodes[this.collection.models.indexOf(model)] || null);
          }
        });
        this.bind({
          remove: function(model) {
            if (this._elements[model.cid]) {
              return this[0].removeChild(this._elements[model.cid]);
            }
          }
        });
        return this.bind({
          refresh: function() {
            return this.render();
          }
        });
      } else {
        return this.trigger('error', 'The collection object passed is not a valid collection.');
      }
    },
    get: function(key) {
      return this.attributes[key];
    },
    set: function(attributes, options) {
      var attribute, key_change_events, now, trigger_arguments, value, _i, _len;
      options || (options = {});
      if (!attributes) {
        return this;
      }
      if (attributes.attributes != null) {
        attributes = attributes.attributes;
      }
      now = this.attributes;
      key_change_events = [];
      for (attribute in attributes) {
        value = attributes[attribute];
        if (now[attribute] !== value) {
          now[attribute] = value;
          if (!options.silent) {
            this._changed = true;
            key_change_events.push(['change:' + attribute, value, options]);
          }
        }
      }
      for (_i = 0, _len = key_change_events.length; _i < _len; _i++) {
        trigger_arguments = key_change_events[_i];
        this.trigger.apply(this, trigger_arguments);
      }
      if (!options.silent && this._changed) {
        this.trigger('change', this, options);
      }
      this._changed = false;
      return attributes;
    }
  });
  View.extend({
    extend: {
      model: function(model) {
        return this._model(model);
      }
    }
  });
  View.extend({
    extend: {
      collection: function(collection) {
        return this._collection(collection);
      }
    }
  });
  View.extend({
    before: function(methods) {
      var method, method_name, _methods, _results;
      if (arguments.length === 2) {
        _methods = {};
        _methods[arguments[0]] = arguments[1];
      } else {
        _methods = methods;
      }
      _results = [];
      for (method_name in _methods) {
        method = _methods[method_name];
        _results.push(this[method_name] = wrap_function(this[method_name], method));
      }
      return _results;
    }
  });
  View.extend({
    extend: {
      before: function(methods) {
        return this.before(methods);
      }
    }
  });
  templates = {};
  View.extend({
    extend: {
      templates: function(_templates, discard) {
        templates = _templates;
        return discard();
      }
    }
  });
  View.extend({
    _render: function() {},
    render: function(options) {
      var element, _element, _i, _len;
      options || (options = {});
      if (!(options.update != null)) {
        options.update = true;
      }
      if (this.collection != null) {
        this._elements = {};
        element = this.collection.map(function(model) {
          return this._elements[model.cid] = this._render(model);
        }, this);
      } else {
        element = this._render(this.model ? this.model.attributes : this.attributes);
      }
      if (!options.update) {
        return element;
      }
      if (element) {
        if (!is_element(element) && !is_array(element) && !is_$(element)) {
          this.trigger('error', 'render() did not return an element or array, returned ' + typeof element);
        }
        this[0].innerHTML = '';
        if (!is_array(element) && !is_$(element)) {
          element = [element];
        }
        for (_i = 0, _len = element.length; _i < _len; _i++) {
          _element = element[_i];
          this[0].appendChild(_element);
        }
      }
      if (!this._ready) {
        this._ready = true;
        this.trigger('ready', element);
      }
      return this.trigger('render', element);
    }
  });
  View.extend({
    extend: {
      render: function(filename) {
        var add_helpers_to_context, callback;
        add_helpers_to_context = __bind(function(context) {
          var helper, helper_name, _results;
          _results = [];
          for (helper_name in template_helpers) {
            helper = template_helpers[helper_name];
            _results.push(context[helper_name] = proxy(template_helpers[helper_name], this));
          }
          return _results;
        }, this);
        if (typeof filename === 'string') {
          callback = function(context) {
            var final_context, output;
            if (!templates[filename]) {
              this.trigger('error', 'Template ' + filename + ' not found');
            }
            if (context.attributes != null) {
              final_context = extend({}, context.attributes);
              final_context = extend(final_context, context);
              add_helpers_to_context(final_context);
              output = templates[filename](final_context);
            } else {
              final_context = extend({}, context);
              add_helpers_to_context(final_context);
              output = templates[filename](final_context);
            }
            return output;
          };
        } else {
          callback = filename;
        }
        return this._render = callback;
      }
    }
  });
  template_helpers = {};
  View.extend({
    extend: {
      helpers: function(helpers) {
        return extend(template_helpers, helpers);
      }
    }
  });
  View.extend({
    helpers: {
      url: function(params) {
        var url;
        url = RouteResolver(params);
        View.env({
          browser: function() {
            return url = '#' + url;
          }
        });
        return url;
      }
    }
  });
  tag = function(tag_name) {
    var argument, attribute_name, attributes, element, elements, name, tag, test_element, value, _element, _i, _j, _len, _len2, _ref;
    elements = [];
    attributes = {};
    _ref = array_from(arguments).slice(1);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      argument = _ref[_i];
      process_node_argument(this, elements, attributes, argument);
    }
    tag_name = tag_name.toLowerCase();
    if (ie && (attributes.name || (tag_name === 'input' && attributes.type))) {
      tag = '<' + tag_name;
      if (attributes.name) {
        tag += ' name="' + attributes.name + '"';
      }
      if (tag_name === 'input' && attributes.type) {
        tag += ' type="' + attributes.type + '"';
      }
      tag += '>';
      delete attributes.name;
      delete attributes.type;
      element = this.document.createElement(tag);
    } else {
      if (!element_cache[tag_name]) {
        element_cache[tag_name] = this.document.createElement(tag_name);
      }
      element = element_cache[tag_name].cloneNode(false);
    }
    for (attribute_name in attributes) {
      name = attribute_translations[attribute_name] || attribute_name;
      if (ie && ie_attribute_translations[name]) {
        if (ie_attribute_translation_sniffing_cache[name] != null) {
          name = ie_attribute_translations[name];
        } else {
          test_element = this.document.createElement('div');
          test_element.setAttribute(name, 'test');
          if (test_element[ie_attribute_translations[name]] !== 'test') {
            test_element.setAttribute(ie_attribute_translations[name], 'test');
            if (ie_attribute_translation_sniffing_cache[name] = test_element[ie_attribute_translations[name]] === 'test') {
              name = ie_attribute_translations[name];
            }
          }
        }
      }
      value = attributes[attribute_name];
      if (value === false || !(value != null)) {
        element.removeAttribute(name);
      } else if (value === true) {
        element.setAttribute(name, name);
      } else if (name === 'style') {
        element.style.cssText = value;
      } else {
        element.setAttribute(name, value);
      }
    }
    for (_j = 0, _len2 = elements.length; _j < _len2; _j++) {
      _element = elements[_j];
      if (is_element(_element)) {
        element.appendChild(_element);
      } else {
        element.appendChild(this.document.createTextNode(String(_element)));
      }
    }
    if (this._$) {
      element = this._$(element);
    }
    return element;
  };
  View.extend({
    tag: function() {
      return tag.apply(this, arguments);
    }
  });
  process_node_argument = function(view, elements, attributes, argument) {
    var attribute, attribute_name, flattened, flattened_argument, _element, _i, _j, _len, _len2;
    if (!(argument != null) || argument === false) {
      return;
    }
    if (typeof argument === 'function') {
      argument = argument.call(view);
    }
    if (is_view(argument)) {
      return elements.push(argument[0]);
    }
    if (is_$(argument)) {
      for (_i = 0, _len = argument.length; _i < _len; _i++) {
        _element = argument[_i];
        return elements.push(_element);
      }
    }
    if (is_element(argument)) {
      return elements.push(argument);
    }
    if (typeof argument !== 'string' && typeof argument !== 'number' && !is_array(argument) && !is_$(argument) && !is_element(argument)) {
      for (attribute_name in argument) {
        attribute = argument[attribute_name];
        attributes[attribute_name] = attribute;
      }
      return;
    }
    if ((argument.toArray != null) && typeof argument.toArray === 'function') {
      argument = argument.toArray();
    }
    if (is_array(argument)) {
      flattened = array_flatten(argument);
      for (_j = 0, _len2 = flattened.length; _j < _len2; _j++) {
        flattened_argument = flattened[_j];
        process_node_argument.call(this, view, elements, attributes, flattened_argument);
      }
      return;
    }
    if (is_element(argument) || typeof argument === 'string' || typeof argument === 'number') {
      return elements.push(argument);
    }
  };
  ie = (typeof window != "undefined" && window !== null) && !!(window.attachEvent && !window.opera);
  ie_attribute_translations = {
    "class": 'className',
    checked: 'defaultChecked',
    usemap: 'useMap',
    "for": 'htmlFor',
    readonly: 'readOnly',
    colspan: 'colSpan',
    bgcolor: 'bgColor',
    cellspacing: 'cellSpacing',
    cellpadding: 'cellPadding'
  };
  ie_attribute_translation_sniffing_cache = {};
  attribute_translations = {
    className: 'class',
    htmlFor: 'for'
  };
  element_cache = {};
  supported_events = 'blur focus focusin focusout load resize scroll unload click dblclick\
	mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\
	change select submit keydown keypress keyup error'.split(/\s+/m);
  supported_html_tags = 'a abbr acronym address applet area b base basefont bdo big blockquote body\
  br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset\
  font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex\
  kbd label legend li link menu meta nobr noframes noscript object ol optgroup option p\
  param pre q s samp script select small span strike strong style sub sup table tbody td\
  textarea tfoot th thead title tr tt u ul var\
  article aside audio command details figcaption figure footer header hgroup keygen mark\
  meter nav output progress rp ruby section source summary time video'.split(/\s+/m);
  attribute_map = {
    htmlFor: 'for',
    className: 'class'
  };
  Builder = {};
  _fn = function(tag_name) {
    return Builder[tag_name] = function() {
      return tag.apply(this, [tag_name].concat(array_from(arguments)));
    };
  };
  for (_i = 0, _len = supported_html_tags.length; _i < _len; _i++) {
    tag_name = supported_html_tags[_i];
    _fn(tag_name);
  }
  router_initialized = false;
  routes_by_path = {};
  routes_by_view = {};
  routes_regexps_by_path = {};
  named_param = /:([\w\d]+)/g;
  splat_param = /\*([\w\d]+)/g;
  Router = {
    _initializedViews: {},
    mixin: []
  };
  RouteResolver = function() {
    var fragment, optional_param_matcher, ordered_params, param_matcher, param_name, params, path, response, router_params, url, view, _ref;
    if (typeof arguments[0] === 'string' && (ViewManager.views[arguments[0]] != null)) {
      router_params = {};
      router_params[arguments[0]] = {};
      arguments[0] = router_params;
    }
    if (typeof arguments[0] === 'object') {
      _ref = arguments[0];
      for (view in _ref) {
        params = _ref[view];
        ViewManager(view);
        if (is_array(params)) {
          params = params_from_ordered_params_and_route(params, routes_by_view[view]);
        }
        url = String(routes_by_view[view]);
        if (params.path) {
          url = url.replace(/\*/, params.path.replace(/^\//, ''));
        }
        param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?(\\?)?(/|$)', 'g');
        for (param_name in params) {
          url = url.replace(param_matcher, function() {
            if (arguments[2] === param_name) {
              return params[param_name] + arguments[5];
            } else {
              return (arguments[1] || '') + ':' + arguments[2] + (arguments[3] || '') + (arguments[4] || '') + arguments[5];
            }
          });
        }
        optional_param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?\\?(/|$)', 'g');
        url = url.replace(optional_param_matcher, '');
        if (typeof arguments[1] === 'function') {
          dispatcher(ViewManager(view), params, arguments[1]);
        }
        return url.replace(/\([^\)]+\)/g, '');
      }
    } else if (typeof arguments[0] === 'string') {
      fragment = arguments[0];
      for (path in routes_by_path) {
        view = routes_by_path[path];
        ViewManager(view);
        if (routes_regexps_by_path[path].test(fragment)) {
          ordered_params = routes_regexps_by_path[path].exec(fragment).slice(1);
          params = params_from_ordered_params_and_route(ordered_params, path);
          response = {};
          response[view] = params;
          if (typeof arguments[1] === 'function') {
            dispatcher(ViewManager(view), params, arguments[1]);
          }
          return response;
        }
      }
      return View.trigger('error', 'Could not resolve the url: ' + arguments[0]);
    }
  };
  View.extend({
    extend: {
      route: function(route, discard) {
        RouteResolver(route, function() {});
        return discard();
      }
    }
  });
  View.extend({
    extend: {
      routes: function(routes, discard) {
        var dependent_views, path, regexp, view;
        dependent_views = [];
        for (path in routes) {
          view = routes[path];
          dependent_views.push(view);
          routes_by_path[path] = view;
          regexp = '^' + path.replace(named_param, "([^\/]*)").replace(splat_param, "(.*?)") + '$';
          routes_regexps_by_path[path] = new RegExp(regexp);
          routes_by_view[view] = path;
        }
        View.env({
          browser: function() {
            return create_router();
          }
        });
        Router.mixin.push([
          'initialize', function(next) {
            var view, _i, _len;
            Router.view = this;
            this.router = [];
            for (_i = 0, _len = dependent_views.length; _i < _len; _i++) {
              view = dependent_views[_i];
              this.router.push(ViewManager(view));
            }
            this.on({
              ready: function() {
                return View.env({
                  browser: function() {
                    return Backbone.history.start();
                  }
                });
              }
            });
            return next();
          }
        ]);
        return discard();
      }
    }
  });
  View.extend({
    url: function(params) {
      var params_contain_view_name, router_params, url;
      params_contain_view_name = function(params) {
        var key_count, param_name;
        key_count = 0;
        for (param_name in params) {
          ++key_count;
        }
        return key_count === 1 && (ViewManager.views[param_name] != null);
      };
      if (params_contain_view_name(params)) {
        router_params = params;
      } else {
        router_params = {};
        router_params[this.name] = {};
        extend(router_params[this.name], this.attributes);
        extend(router_params[this.name], params || {});
      }
      url = RouteResolver(router_params);
      View.env({
        browser: function() {
          return url = '#' + url;
        }
      });
      return url;
    }
  });
  create_router = function() {
    var route, router, view, _results;
    router = new Backbone.Controller;
    _results = [];
    for (route in routes_by_path) {
      view = routes_by_path[route];
      _results.push((function(route, view) {
        return router.route(route, view, function() {
          var ordered_params, router_params;
          ordered_params = array_from(arguments);
          router_params = {};
          router_params[view] = params_from_ordered_params_and_route(ordered_params, route);
          return RouteResolver(router_params, function() {});
        });
      })(route, view));
    }
    return _results;
  };
  has_change_callback = function(view) {
    var event_name;
    if (!(view._callbacks != null)) {
      return false;
    }
    for (event_name in view._callbacks) {
      if (event_name === 'change' || event_name.match(/^change\:/)) {
        if (view._callbacks[event_name].length > 0) {
          return true;
        }
      }
    }
    return false;
  };
  dispatcher = function(view_instance, params, callback) {
    var did_change, did_change_observer, dispatch, ensure_parent_node, next, siblings;
    siblings = function() {
      return view_instance[0].parentNode.childNodes;
    };
    did_change = false;
    did_change_observer = function() {
      return did_change = true;
    };
    ensure_parent_node = function() {
      if (!view_instance[0].parentNode) {
        return view_instance.trigger('error', 'This view is part of a Router, and must be attched to a parent node.');
      }
    };
    next = function() {
      var hide, remove, _i, _len, _ref, _view, _view_instance;
      view_instance.unbind('render', next);
      _ref = view_instance.views || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _view = _ref[_i];
        _view_instance = ViewManager(_view);
        _view_instance.unbind('render', next);
      }
      hide = function() {
        var sibling, _i, _len, _ref, _results;
        _ref = siblings();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sibling = _ref[_i];
          _results.push(sibling.style.display = 'none');
        }
        return _results;
      };
      remove = function() {
        var sibling, _i, _len, _ref, _results;
        _ref = siblings();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sibling = _ref[_i];
          _results.push(sibling && sibling !== view_instance[0] ? view_instance[0].parentNode.removeChild(sibling) : void 0);
        }
        return _results;
      };
      ensure_parent_node();
      View.env({
        test: hide,
        browser: hide,
        server: remove
      });
      view_instance[0].style.display = null;
      callback.call(view_instance, view_instance, params);
      View.trigger('route', view_instance);
      return View.trigger('route:' + view_instance.name, view_instance);
    };
    dispatch = function() {
      var _i, _len, _ref, _view, _view_instance;
      view_instance.bind('render', next);
      _ref = view_instance.views || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _view = _ref[_i];
        _view_instance = ViewManager(_view);
        _view_instance.bind('render', next);
      }
      view_instance.bind('change', did_change_observer);
      view_instance.set(params);
      view_instance.unbind('change', did_change_observer);
      if (!did_change) {
        return next();
      } else if (!has_change_callback(view_instance)) {
        return view_instance.trigger('error', 'View with route must respond to a change, or change:key event with a render() call.');
      }
    };
    if (!Router._initializedViews[view_instance.name]) {
      Router._initializedViews[view_instance.name] = true;
      view_instance.bind({
        ready: dispatch
      });
      return view_instance.initialize();
    } else {
      return dispatch();
    }
  };
  params_from_ordered_params_and_route = function(ordered_params, route) {
    var i, key, keys, params, _len;
    params = {};
    keys = [];
    String(route).concat('/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
      return keys.push(key);
    });
    for (i = 0, _len = keys.length; i < _len; i++) {
      key = keys[i];
      params[key] = ordered_params[i];
    }
    return params;
  };
  View.extend({
    log: function(method_name) {
      var execute, _i, _len, _method_name, _results;
      execute = function(method_name) {
        return this.before(method_name, function() {
          var args, next, response;
          next = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          response = next.apply(this, args);
          console.log("" + this.name + "." + method_name, array_from(args), ' -> ', response);
          return response;
        });
      };
      if (is_array(method_name)) {
        _results = [];
        for (_i = 0, _len = method_name.length; _i < _len; _i++) {
          _method_name = method_name[_i];
          _results.push(execute.call(this, _method_name));
        }
        return _results;
      } else {
        return execute.call(this, method_name);
      }
    }
  });
  View.extend({
    extend: {
      log: function(method_name) {
        return this.log(method_name);
      }
    }
  });
  deffered = {};
  ViewManager = function() {
    var callback, class_name, response, _callback, _i, _len, _ref, _ref2;
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }
    if (is_array(arguments[0]) || typeof arguments[0] === 'string') {
      response = [];
      _ref = array_flatten(array_from(arguments));
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        class_name = _ref[_i];
        if (typeof class_name === 'string') {
          if (!(ViewManager.views[class_name] != null)) {
            View.trigger('error', "" + class_name + " has not been created.");
          }
          response.push(ViewManager.views[class_name]);
        }
      }
      if (typeof arguments[0] === 'string') {
        return response[0];
      } else {
        return response;
      }
    } else {
      response = {};
      _ref2 = arguments[0];
      for (class_name in _ref2) {
        _callback = _ref2[class_name];
        if (!(ViewManager.views[class_name] != null)) {
          response[class_name] = null;
          if (!(deffered[class_name] != null)) {
            deffered[class_name] = [];
          }
          deffered[class_name].push(_callback);
        } else {
          response[class_name] = ViewManager.views[class_name];
          _callback.call(response[class_name], response[class_name]);
        }
      }
      return response;
    }
  };
  ViewManager.views = {};
  ViewManager.create = proxy(View.create, View);
  ViewManager.extend = proxy(View.extend, View);
  ViewManager.env = proxy(View.env, View);
  if (typeof window != "undefined" && window !== null) {
    window.View = ViewManager;
    window.Builder = Builder;
    window.Router = Router;
    window.RouteResolver = RouteResolver;
  }
  if ((typeof module != "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports.View = ViewManager;
    module.exports.Builder = Builder;
    module.exports.Router = Router;
    module.exports.RouteResolver = RouteResolver;
  }
}).call(this);
