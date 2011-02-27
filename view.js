(function() {
  var View, array_flatten, array_from, array_without_value, attribute_map, attribute_translations, cache, constructor, create_server, exports, extend, extend_api, files_with_extension, ie, ie_attribute_translation_sniffing_cache, ie_attribute_translations, is_$, is_array, is_collection, is_directory, is_element, is_model, is_server, is_view, node_in_dom_tree, process_node_argument, proxy, servers, supported_events, supported_html_tags, tag, wrap_function, _fn, _i, _len;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  constructor = function() {
    return function() {
      if (this instanceof arguments.callee) {
        this.initialize.apply(this, arguments);
        return this;
      } else {
        throw 'View called as a constructor without the "new" keyword.';
      }
    };
  };
  View = constructor();
  View._methods = {};
  View.prototype._methods = {};
  View.method = View.prototype.method = View._methods.method = View.prototype._methods.method = function(method_name, method) {
    var _method_name, _results;
    this._methods || (this._methods = {});
    if (this.prototype) {
      this.prototype._methods || (this.prototype._methods = {});
    }
    if (arguments.length === 1) {
      _results = [];
      for (_method_name in method_name) {
        method = method_name[_method_name];
        _results.push(this.method(_method_name, method));
      }
      return _results;
    } else {
      this._methods[method_name] = this[method_name] = method;
      if (this.prototype) {
        return this.prototype._methods[method_name] = this.prototype[method_name] = method;
      }
    }
  };
  extend_api = {
    env: function(envs) {
      var args, env_name, response, _results;
      _results = [];
      for (env_name in envs) {
        args = envs[env_name];
        _results.push(!envs[env_name] ? envs[env_name] = args : envs[env_name]() ? typeof args === 'function' ? (response = args(), response ? this.extend(response) : void 0) : this.extend(args) : void 0);
      }
      return _results;
    },
    server: function(server) {
      var _name;
      if (is_server(server)) {
        if (!servers[Number(server.address().port)]) {
          servers[Number(server.address().port)] = server;
        }
        this.server = server;
      } else {
        server.port || (server.port = 80);
        this.server = servers[_name = server.port] || (servers[_name] = create_server(server));
      }
      if (this.prototype) {
        return this.prototype.server = this.server;
      }
    },
    base: function(base) {
      return this.base(base);
    },
    javascripts: function() {
      var scripts;
      scripts = arguments;
      return this.env({
        server: function() {
          return this.document.javascripts.apply(this.document, scripts);
        }
      });
    },
    stylesheets: function() {
      var styles;
      styles = arguments;
      return this.env({
        server: function() {
          return this.document.stylesheets.apply(this.document, styles);
        }
      });
    },
    initialize: function(_initialize) {
      this._initialize = _initialize;
    },
    publish: function(path) {},
    route: function(route) {
      return this.env({
        server: function() {
          if (!this.server) {
            this.extend({
              server: {}
            });
          }
          return this.server.get(route, __bind(function(request, response) {
            return response.send(this.document.toString());
          }, this));
        },
        client: function() {}
      });
    },
    model: function(model) {
      return this._model(model);
    },
    collection: function(collection) {
      return this._model(collection);
    },
    bind: function(events) {
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
    },
    render: function() {
      var args;
      if (typeof arguments[0] === 'function') {
        return this.method({
          _render: arguments[0]
        });
      } else {
        args = arguments;
        return this.method({
          _render: function() {
            return this.render.apply(this, args);
          }
        });
      }
    },
    delegate: function() {},
    $: function($) {
      return this.$($);
    },
    register: function(registers) {
      return this.register(registers);
    },
    before: function(methods) {
      return this.before(methods);
    },
    after: function(methods) {
      return this.after(methods);
    },
    logging: function() {}
  };
  View.method({
    create: function() {
      var klass;
      klass = this.clone();
      klass.extend.apply(klass, arguments);
      return klass;
    },
    extend: function() {
      var argument, item, key, process_item, value, _i, _len, _results;
      this._mixin || (this._mixin = []);
      if (this.prototype) {
        this.prototype._mixin || (this.prototype._mixin = []);
      }
      process_item = function(key, value) {
        this._mixin.push([key, value]);
        if (this.prototype) {
          this.prototype._mixin.push([key, value]);
        }
        if (extend_api[key]) {
          return extend_api[key].apply(this, [value]);
        } else if (typeof value === 'function') {
          return this.method(key, value);
        } else {
          this[key] = value;
          if (this.prototype) {
            return this.prototype[key] = value;
          }
        }
      };
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        argument = arguments[_i];
        _results.push((function() {
          var _i, _len, _ref, _results, _results2;
          if (!is_view(argument) && typeof argument === 'function') {
            return this.bind('ready', argument);
          } else if (argument) {
            if (argument._mixin != null) {
              _ref = argument._mixin;
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
    },
    clone: function() {
      var klass;
      if (this.prototype) {
        klass = constructor();
        klass.method = View.method;
        klass.method(this._methods);
        klass.env(this._envs);
        klass.extend(this);
        return klass;
      } else {
        return extend({}, this);
      }
    },
    initialize: function(model) {
      this._model(model || {});
      if (arguments.length > 1) {
        this.extend.apply(this, array_from(arguments).slice(1));
      }
      this.render();
      this._initialize();
      return this.trigger('ready');
    },
    _initialize: function() {},
    _model: function(model) {
      if (model && !is_model(model)) {
        this.attributes = {};
        this._changed = false;
        return this.set(model);
      } else if (is_model(model)) {
        this.attributes = model.attributes;
        this.model = model;
        return this.model.bind('all', __bind(function() {
          return this.trigger.apply(this, arguments);
        }, this));
      } else if (is_collection(model)) {
        this.attributes = {};
        this.collection = model;
        return this.model.bind('all', __bind(function() {
          return this.trigger.apply(this, arguments);
        }, this));
      }
    },
    register: function(registrations) {
      var callback, extension, handler, _results;
      this._registers || (this._registers = {});
      extend(this._registers, registrations);
      if (this.prototype) {
        this.prototype._registers || (this.prototype._registers = {});
        extend(this.prototype._registers, registrations);
      }
      _results = [];
      for (extension in registrations) {
        handler = registrations[extension];
        callback = function(content, context, view) {
          return handler(content, context, view);
        };
        this._extensions || (this._extensions = {});
        this._extensions[extension] = callback;
        _results.push(this.prototype ? (this.prototype._extensions || (this.prototype._extensions = {}), this.prototype._extensions[extension] = callback) : void 0);
      }
      return _results;
    },
    render: function() {
      var content, context, extension, response, _ref, _ref2;
      this._extensions || (this._extensions = {});
      context = this.model ? this.model.attributes : this.attributes;
      if (arguments.length === 0) {
        response = this._render(context);
        if (is_array(response)) {
          response = this.render(response);
        }
        return this.$(response);
      } else {
        if (typeof arguments[0] === 'function') {
          response = this.render(arguments[0].call(this, context));
        } else if (is_element(arguments[0])) {
          response = arguments[0];
        } else {
          if (is_array(arguments[0])) {
            _ref = arguments[0], extension = _ref[0], content = _ref[1];
            if (typeof content === 'function') {
              content = content.call(this);
            }
          } else if (typeof arguments[0] === 'object') {
            _ref2 = arguments[0];
            for (extension in _ref2) {
              content = _ref2[extension];
              if (typeof content === 'function') {
                content = content.call(this, context);
              }
              break;
            }
          } else if (arguments.length === 2) {
            extension = arguments[0], content = arguments[1];
          }
          if (!this._extensions[extension]) {
            this.trigger('error', extension + ' is not a registered template engine');
          } else {
            response = this._extensions[extension](content, context, this);
          }
        }
        if (this._$) {
          response = this._$(response);
        }
        return response;
      }
    },
    _render: function() {
      return this.div();
    },
    env: function(envs) {
      var callback, env_name, _results;
      this._envs || (this._envs = {});
      if (this.prototype) {
        this.prototype._envs || (this.prototype._envs = {});
      }
      if (arguments.length === 2) {
        env_name = arguments[0], callback = arguments[1];
        if (!(this._envs[env_name] != null)) {
          this._envs[env_name] = callback;
          if (this.prototype) {
            return this.prototype._envs[env_name] = callback;
          }
        } else if (this._envs[env_name]()) {
          return callback.call(this);
        }
      } else {
        _results = [];
        for (env_name in envs) {
          callback = envs[env_name];
          _results.push(this.env(env_name, callback));
        }
        return _results;
      }
    },
    base: function(base) {
      if (!base) {
        return this._base;
      } else {
        this._base = base;
        this._javascripts || (this._javascripts = []);
        return this._stylesheets || (this._stylesheets = []);
      }
    },
    get: function(key) {
      if (this.model) {
        return this.model.apply.get(this.model, arguments);
      } else {
        return this.attributes[key];
      }
    },
    set: function(attributes, options) {
      var attribute, now, value;
      if (this.model) {
        return this.model.apply.set(this.model, arguments);
      } else {
        options || (options = {});
        if (!attributes) {
          return this;
        }
        if (attributes.attributes != null) {
          attributes = attributes.attributes;
        }
        now = this.attributes;
        for (attribute in attributes) {
          value = attributes[attribute];
          if (now[attribute] !== value) {
            now[attribute] = value;
            if (!options.silent) {
              this._changed = true;
              this.trigger('change:' + attribute, this, value, options);
            }
          }
        }
        if (!options.silent && this._changed) {
          this.trigger('change', this, options);
        }
        this._changed = false;
        return attributes;
      }
    },
    toJSON: function() {
      if (this.model) {
        return this.model.toJSON();
      } else if (this.collection) {
        return this.collection.toJSON();
      } else {
        return this.attributes;
      }
    },
    bind: function(event_name, callback) {
      var calls, list;
      calls = this._callbacks || (this._callbacks = {});
      list = this._callbacks[event_name] || (this._callbacks[event_name] = []);
      list.push(callback);
      return this;
    },
    unbind: function(event_name, callback) {
      var calls, i, item, list, _len;
      if (!event_name) {
        this._callbacks = {};
      }
      calls = this._callbacks;
      if (!callback) {
        calls[event_name] = [];
      } else {
        list = calls[event_name];
        if (!list) {
          return this;
        }
        for (i = 0, _len = list.length; i < _len; i++) {
          item = list[i];
          if (item === callback) {
            list.splice(i, 1);
            break;
          }
        }
      }
      return this;
    },
    trigger: function(event_name) {
      var calls, item, list, _i, _j, _len, _len2;
      calls = this._callbacks;
      if (!calls) {
        return this;
      }
      if (list = calls[event_name]) {
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          item = list[_i];
          item.apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
      if (list = calls.all) {
        for (_j = 0, _len2 = list.length; _j < _len2; _j++) {
          item = list[_j];
          item.apply(this, arguments);
        }
      }
      return this;
    },
    $: function(element) {
      if ((typeof jQuery != "undefined" && jQuery !== null) && element === jQuery) {
        this._$ = element;
        if (this.prototype) {
          return this.prototype._$ = element;
        }
      } else if (arguments.length > 0 && element && (is_element(element) || is_$(element))) {
        if (is_$(element)) {
          this[0] = element[0];
        } else {
          this[0] = element;
        }
        this.length = 1;
        return extend(this.$, this[0]);
      } else if (arguments.length > 0 && element && typeof element === 'string') {
        if (!(this._$ != null)) {
          return this.trigger('error', 'No DOM library is available in the View');
        } else {
          return this._$(element, this[0]);
        }
      } else {
        return this[0];
      }
    },
    callback: function(method) {
      var args, context;
      args = array_from(arguments).slice(1);
      context = this;
      return function() {
        if (typeof method === 'string') {
          context[method].apply(context, args);
        } else {
          method.apply(context, args);
        }
        return false;
      };
    },
    before: function(methods) {
      var method, method_name, _results;
      if (arguments.length === 2) {
        methods = [];
        methods[argument[0]] = argument[1];
      }
      _results = [];
      for (method_name in methods) {
        method = methods[method_name];
        _results.push(__bind(function(method_name, method) {
          var callback, original;
          original = this[method_name];
          callback = __bind(function() {
            var args, next;
            args = array_from(arguments);
            next = __bind(function() {
              if (arguments.length > 0) {
                args = arguments;
              }
              return original.apply(this, args);
            }, this);
            return method.apply(this, [args, next, original]);
          }, this);
          this[method_name] = callback;
          if (this.prototype) {
            return this.prototype[method_name] = callback;
          }
        }, this)(method_name, method));
      }
      return _results;
    }
  });
  View.bind('error', function(error) {
    throw error;
  });
  View.method({
    on: View.bind,
    removeListener: View.unbind,
    emit: View.trigger
  });
  extend_api.on = extend_api.bind;
  View.method({
    tag: function(tag_name) {
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
        if (!cache[tag_name]) {
          cache[tag_name] = this.document.createElement(tag_name);
        }
        element = cache[tag_name].cloneNode(false);
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
      return element;
    }
  });
  process_node_argument = function(view, elements, attributes, argument) {
    var attribute, attribute_name, flattened, flattened_argument, _i, _len;
    if (!(argument != null) || argument === false) {
      return;
    }
    if (typeof argument === 'function') {
      argument = argument();
    }
    if (is_view(argument) || (is_$(argument.$) || is_element(argument.$))) {
      return elements.push(argument.$);
    }
    if (typeof argument !== 'string' && typeof argument !== 'number' && !is_array(argument) && !is_$(argument) && !is_element(argument)) {
      for (attribute_name in argument) {
        attribute = argument[attribute_name];
        attributes[attribute_name] = attribute;
      }
      return;
    }
    if ((argument.toArray != null) && typeof argument.toArray === 'function') {
      argument = argumen.toArray();
    }
    if (is_array(argument)) {
      flattened = array_flatten(argument);
      for (_i = 0, _len = flattened.length; _i < _len; _i++) {
        flattened_argument = flattened[_i];
        process_node_argument(view, elements, attributes, flattened_argument);
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
  cache = {};
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
  _fn = function(tag) {
    return View.method(tag, function() {
      var args, argument, _i, _len;
      args = [tag];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        argument = arguments[_i];
        args.push(argument);
      }
      return this.tag.apply(this, args);
    });
  };
  for (_i = 0, _len = supported_html_tags.length; _i < _len; _i++) {
    tag = supported_html_tags[_i];
    _fn(tag);
  }
  servers = {};
  create_server = function(params) {
    var express, port, public, server;
    express = require('express');
    port = Number(params.port);
    server = servers[port] = express.createServer();
    public = params.public || './public';
    server.use(express.methodOverride());
    server.use(express.bodyDecoder());
    server.use(express.cookieDecoder());
    server.use(server.router);
    server.use(express.logger());
    if (public) {
      server.use(express.staticProvider(public));
    }
    server.listen(port);
    console.log("ViewJS + Express Server listening on port " + port);
    return server;
  };
  extend = function(destination, source) {
    var key, value;
    for (key in source) {
      value = source[key];
      destination[key] = value;
    }
    return destination;
  };
  is_view = function(object) {
    return object && object.$ && object.render;
  };
  is_model = function(object) {
    return object && object.get && object.set && object.trigger && object.bind;
  };
  is_collection = function(object) {
    return object && object.add && object.remove && object.trigger && object.bind;
  };
  is_server = function(server) {
    return server && server.address && server.connections && server.routes;
  };
  is_array = function(array) {
    return array && Object.prototype.toString.call(array) === '[object Array]';
  };
  is_element = function(element) {
    return (element != null ? element.nodeType : void 0) === 1 || (element != null ? element.nodeType : void 0) === 2;
  };
  is_$ = function($) {
    var _ref;
    return ($ != null ? $[0] : void 0) && ($ != null ? (_ref = $[0]) != null ? _ref.nodeType : void 0 : void 0);
  };
  wrap_function = function(func, wrapper) {
    return function() {
      return wrapper.apply(this, [proxy(func, this)].concat(array_from(arguments)));
    };
  };
  node_in_dom_tree = function(node) {
    var ancestor;
    ancestor = node;
    while (ancestor.parentNode) {
      ancestor = ancestor.parentNode;
    }
    return !!ancestor.body;
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
  is_directory = function(dir) {
    return require('fs').statSync(dir).isDirectory();
  };
  files_with_extension = function(dir, extension) {
    var fs, paths, traverse;
    fs = require('fs');
    paths = [];
    try {
      fs.statSync(dir);
    } catch (e) {
      return [];
    }
    traverse = function(dir, stack) {
      stack.push(dir);
      fs.readdirSync(stack.join('/')).map(function(file) {
        var path, stat;
        path = stack.concat([file]).join('/');
        stat = fs.statSync(path);
        if (file[0] === '.' || file === 'vendor') {
          return;
        }
        if (stat.isFile() && extension.test(file)) {
          paths.push(path);
        }
        if (stat.isDirectory()) {
          return traverse(file, stack);
        }
      });
      return stack.pop();
    };
    traverse(dir || '.', []);
    return paths;
  };
  View.env({
    server: function() {
      return !(typeof window != "undefined" && window !== null);
    },
    client: function() {
      return (typeof window != "undefined" && window !== null) && (window.document != null);
    }
  });
  View.env({
    server: function() {
      View.Document = function() {
        var document, jsdom, window;
        jsdom = require('jsdom').jsdom;
        document = jsdom('<html><head></head><body></body></html>');
        window = document.createWindow();
        window.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
        window.document.implementation.addFeature('FetchExternalResources', ['script']);
        window.document.implementation.addFeature('ProcessExternalResources', ['script']);
        window.document.implementation.addFeature('MutationEvents', ['1.0']);
        document.javascripts = function() {
          var add_script, script, scripts, _i, _len, _results;
          if (arguments.length === 0) {
            return this._javascripts;
          }
          scripts = array_flatten(array_from(arguments));
          if (!this._javascripts) {
            this._javascripts = [];
          }
          add_script = __bind(function(script) {
            if (!(__indexOf.call(this._javascripts, script) >= 0)) {
              this._javascripts.push(script);
              tag = this.createElement('script');
              tag.type = 'text/javascript';
              tag.src = script;
              return this.head.appendChild(tag);
            }
          }, this);
          _results = [];
          for (_i = 0, _len = scripts.length; _i < _len; _i++) {
            script = scripts[_i];
            _results.push(is_directory(script) ? files_with_extension(script, /\.(js|coffee)$/).map(add_script) : add_script(script));
          }
          return _results;
        };
        document.stylesheets = function() {
          var add_style, style, styles, _i, _len, _results;
          if (arguments.length === 0) {
            return this._stylesheets;
          }
          styles = array_flatten(array_from(arguments));
          if (!this._stylesheets) {
            this._stylesheets = [];
          }
          add_style = __bind(function(style) {
            if (!(__indexOf.call(this._stylesheets, style) >= 0)) {
              this._stylesheets.push(style);
              tag = this.createElement('link');
              tag.rel = 'stylesheet';
              tag.type = 'text/css';
              tag.href = style;
              return this.head.appendChild(tag);
            }
          }, this);
          _results = [];
          for (_i = 0, _len = styles.length; _i < _len; _i++) {
            style = styles[_i];
            _results.push(is_directory(style) ? files_with_extension(style, /\.css$/).map(add_style) : add_style(style));
          }
          return _results;
        };
        document.toString = function() {
          return "<!DOCTYPE html>\n<html>\n  " + this.documentElement.innerHTML + "\n</html>";
        };
        return document;
      };
      return View.extend({
        document: new View.Document
      });
    },
    client: function() {
      return View.extend({
        document: window.document
      });
    }
  });
  View.register({
    html: function(content, context, view) {
      var div, response;
      div = view.div();
      div.innerHTML = content;
      response = array_from(div.childNodes);
      if (response.length === 1) {
        return response[0];
      } else {
        return response;
      }
    },
    jade: function(content, context, view) {},
    haml: function(content, context, view) {},
    eco: function(content, context, view) {},
    coffeekup: function(content, context, view) {},
    template: function(content, context, view) {}
  });
  exports = (typeof module != "undefined" && module !== null ? module.exports : void 0) != null ? module.exports : window;
  exports.View = View;
}).call(this);
