(function() {
  var ViewServer, ViewServerManager, XMLHttpRequest, array_flatten, array_from, bind_extend_handler, create_empty_document, create_server, deffered, eco, environments, express, extend, files_with_extension, fs, http, is_array, is_directory, jade, jsdom, proxy, _;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  express = require('express');
  http = require('http');
  fs = require('fs');
  _ = require('underscore');
  jsdom = require('jsdom').jsdom;
  XMLHttpRequest = require('XMLHttpRequest').XMLHttpRequest;
  extend = function(destination, source) {
    var key, value;
    for (key in source) {
      value = source[key];
      destination[key] = value;
    }
    return destination;
  };
  is_array = function(array) {
    return array && Object.prototype.toString.call(array) === '[object Array]';
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
    var paths, traverse;
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
  create_empty_document = function() {
    return jsdom('<html><head></head><body></body></html>');
  };
  ViewServer = {
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
          if (argument) {
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
  ViewServer.extend({
    create: function() {
      var callback, class_name, created_servers, instance, mixin, mixins, _i, _len, _ref;
      if (arguments.length === 0 || (arguments.length === 1 && typeof arguments[0] === 'function')) {
        instance = this.clone();
        instance.element();
        if (arguments[0]) {
          arguments[0].call(instance);
        }
        return instance;
      }
      created_servers = {};
      _ref = arguments[0];
      for (class_name in _ref) {
        mixins = _ref[class_name];
        if (ViewServerManager.servers[class_name] != null) {
          this.trigger('warning', class_name + ' already exists, overwriting.');
        }
        ViewServerManager.servers[class_name] = created_servers[class_name] = this.clone();
        ViewServerManager.servers[class_name].name = class_name;
        if (is_array(mixins)) {
          for (_i = 0, _len = mixins.length; _i < _len; _i++) {
            mixin = mixins[_i];
            created_servers[class_name].extend(mixin);
          }
        } else {
          created_servers[class_name].extend(mixins);
        }
        if (deffered[class_name] != null) {
          while (callback = deffered[class_name].pop()) {
            callback.call(created_servers[class_name]);
          }
        }
      }
      return created_servers;
    },
    clone: function() {
      var klass;
      klass = {};
      klass.extend = this.extend;
      klass.extend.api = {};
      klass._callbacks = {};
      klass.extend(this);
      return klass;
    }
  });
  ViewServer.extend({
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
  ViewServer.extend({
    on: ViewServer.bind,
    removeListener: ViewServer.unbind,
    emit: ViewServer.trigger
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
  ViewServer.extend({
    extend: {
      bind: bind_extend_handler
    }
  });
  ViewServer.extend({
    extend: {
      on: bind_extend_handler
    }
  });
  ViewServer.extend({
    on: {
      warning: function(warning) {
        if ((typeof console != "undefined" && console !== null ? console.log : void 0) != null) {
          return console.log.apply(console, ["" + this.name + " warning: "].concat(array_from(arguments)));
        }
      },
      error: function(error) {
        if ((typeof console != "undefined" && console !== null ? console.log : void 0) != null) {
          console.log.apply(console, ["" + (this.name || 'ViewServer') + " error: "].concat(array_from(arguments)));
        }
        throw error;
      }
    }
  });
  ViewServer.extend({
    extend: {
      server: function(server) {
        return this.server = server;
      }
    }
  });
  ViewServer.extend({
    extend: {
      port: function(port) {
        this.port = port;
        this.extend({
          server: !this.server ? create_server() : void 0
        });
        if (this.public) {
          this.server.use(express.static(this.public));
        }
        this.server.listen(this.port);
        return console.log("Express ViewServer listening on port " + this.port);
      }
    }
  });
  ViewServer.extend({
    extend: {
      public: function(public_dir) {
        this.public = public_dir;
        if (this.server) {
          return this.server.use(express.static(this.public));
        }
      }
    }
  });
  create_server = function() {
    var server;
    server = express.createServer();
    server.use(express.methodOverride());
    server.use(express.bodyParser());
    server.use(express.cookieParser());
    server.use(server.router);
    server.use(express.logger());
    return server;
  };
  jade = require('jade');
  eco = require('eco');
  ViewServer.extend({
    compileTemplates: function(as_string, document, templates_dir) {
      var child_nodes_from_html, compiled, contents, filename, output, prefix, suffix;
      if (as_string == null) {
        as_string = false;
      }
      if (templates_dir == null) {
        templates_dir = this.templates;
      }
      compiled = {};
      child_nodes_from_html = "(function(html){    var div = (typeof(document) != 'undefined' ? document : View.document).createElement('div');    div.innerHTML = html;    return div.childNodes.length === 1 ? div.childNodes[0] : div.childNodes;  })";
      prefix = "(function(___obj){return " + child_nodes_from_html + "((";
      suffix = ')(___obj))})';
      files_with_extension(templates_dir, /\.html$/).map(__bind(function(filename) {
        var content;
        content = String(fs.readFileSync(filename));
        content = content.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'');
        return compiled[filename.substring(templates_dir.length + 1)] = "(function(){return " + child_nodes_from_html + "('" + content + "')})";
      }, this));
      files_with_extension(templates_dir, /\.jade$/).map(__bind(function(filename) {
        var content, output;
        content = String(fs.readFileSync(filename));
        output = require('jade').compile(content).toString();
        output = prefix + output + suffix;
        return compiled[filename.substring(templates_dir.length + 1)] = output;
      }, this));
      files_with_extension(templates_dir, /\.eco$/).map(__bind(function(filename) {
        var content, output;
        content = String(fs.readFileSync(filename));
        output = eco.compile(content);
        output = output.replace(/module.exports = /, prefix);
        output = output.replace(/;$/, suffix);
        return compiled[filename.substring(templates_dir.length + 1)] = output;
      }, this));
      if (!as_string) {
        for (filename in compiled) {
          compiled[filename] = (new Function("with(this){return " + compiled[filename] + "}")).call({
            document: document
          });
        }
        return compiled;
      }
      output = "{";
      for (filename in compiled) {
        contents = compiled[filename];
        output += "'" + filename + "':" + contents + ',';
      }
      output = output.replace(/,$/, '') + '}';
      return output;
    }
  });
  ViewServer.extend({
    stylesheets: function(stylesheets) {
      var add_style, style, styles, _i, _len, _results;
      this._stylesheets || (this._stylesheets = []);
      add_style = __bind(function(style) {
        if (!(__indexOf.call(this.stylesheets, style) >= 0)) {
          return this._stylesheets.push(style);
        }
      }, this);
      styles = array_flatten(array_from(arguments));
      _results = [];
      for (_i = 0, _len = styles.length; _i < _len; _i++) {
        style = styles[_i];
        _results.push(is_directory(style) ? files_with_extension(style, /\.css$/).map(add_style) : add_style(style));
      }
      return _results;
    }
  });
  ViewServer.extend({
    extend: {
      stylesheets: function(stylesheets) {
        return this.stylesheets(stylesheets);
      }
    }
  });
  ViewServer.extend({
    javascripts: function(javascripts) {
      var add_script, script, scripts, _i, _len, _results;
      this._javascripts || (this._javascripts = []);
      add_script = __bind(function(script) {
        if (!(__indexOf.call(this._javascripts, script) >= 0)) {
          return this._javascripts.push(script);
        }
      }, this);
      scripts = array_flatten(array_from(arguments));
      _results = [];
      for (_i = 0, _len = javascripts.length; _i < _len; _i++) {
        script = javascripts[_i];
        _results.push(is_directory(script) ? files_with_extension(script, /\.js$/).map(add_script) : add_script(script));
      }
      return _results;
    }
  });
  ViewServer.extend({
    extend: {
      javascripts: function(javascripts) {
        return this.javascripts(javascripts);
      }
    }
  });
  ViewServer.extend({
    execute: function(executables) {
      var add_script, script, scripts, _i, _len, _results;
      this._execute || (this._execute = []);
      add_script = __bind(function(script) {
        if (!(__indexOf.call(this._execute, script) >= 0)) {
          return this._execute.push(script);
        }
      }, this);
      scripts = array_flatten(array_from(arguments));
      _results = [];
      for (_i = 0, _len = executables.length; _i < _len; _i++) {
        script = executables[_i];
        _results.push(is_directory(script) ? files_with_extension(script, /\.js$/).map(add_script) : add_script(script));
      }
      return _results;
    }
  });
  ViewServer.extend({
    extend: {
      execute: function(executables) {
        return this.execute(executables);
      }
    }
  });
  ViewServer.extend({
    extend: {
      routes: function(routes) {
        var path, view, _results;
        this.routes || (this.routes = {});
        _results = [];
        for (path in routes) {
          view = routes[path];
          _results.push(typeof view === 'function' ? this.server.get(path, view) : typeof view === 'number' ? this.proxy({
            host: 'localhost',
            port: view,
            base: path
          }) : (this.routes[path] = view, this.server.get(path, __bind(function(request, response) {
            return this.respond(request, response);
          }, this))));
        }
        return _results;
      }
    }
  });
  ViewServer.extend({
    JSONFromRoutes: function() {
      var fragments, path, view, _len, _ref;
      fragments = [];
      _ref = this.routes || {};
      for (view = 0, _len = _ref.length; view < _len; view++) {
        path = _ref[view];
        fragments.push('"' + path + '":"' + view + '"');
      }
      return "{" + (fragments.join(',')) + "}";
    }
  });
  ViewServer.extend({
    cache: function(url, contents) {
      var filename;
      filename = this.public.replace(/\/$/, '') + url;
      if (url === '' || url.match(/\/$/)) {
        filename += 'index.html';
      } else if (!url.match(/\.[a-zA-Z]+$/)) {
        filename += '.html';
      }
      return fs.writeFileSync(filename, contents);
    }
  });
  ViewServer.extend({
    extend: {
      cache: function(views) {
        var view, _i, _len, _ref, _results;
        _ref = array_flatten(array_from(views));
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view = _ref[_i];
          _results.push(this.cache[view] = true);
        }
        return _results;
      }
    }
  });
  ViewServer.extend({
    respond: function(request, response) {
      var args, envs, _i, _len, _ref;
      request._stylesheets = array_from(this._stylesheets);
      request._javascripts = array_from(this._javascripts);
      request._execute = array_from(this._execute);
      _ref = this.env_callbacks || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        envs = _ref[_i];
        args = ViewServer.env(request, envs);
        if (args.stylesheets) {
          request._stylesheets = request._stylesheets.concat(args.stylesheets);
        }
        if (args.javascripts) {
          request._javascripts = request._javascripts.concat(args.javascripts);
        }
        if (args.execute) {
          request._execute = request._execute.concat(args.execute);
        }
      }
      request._stylesheets = _.uniq(request._stylesheets);
      request._javascripts = _.uniq(request._javascripts);
      request._execute = _.uniq(request._execute);
      return this.createWindow(request, __bind(function(window) {
        if (window.View != null) {
          window.View.extend({
            on: {
              route: __bind(function(view_instance) {
                var output;
                output = this.renderWindow(request, window);
                if (this.cache[view_instance.name]) {
                  this.cache(request.originalUrl, output);
                }
                return response.send(output);
              }, this)
            }
          });
          return window.View.extend({
            route: request.originalUrl
          });
        } else {
          return response.send(this.renderWindow(request, window));
        }
      }, this));
    },
    createWindow: function(request, callback) {
      var add_script, document, executables, window;
      document = create_empty_document();
      window = document.createWindow();
      window.XMLHttpRequest = XMLHttpRequest;
      window.document.implementation.addFeature('MutationEvents', ['1.0']);
      window.document.implementation.addFeature('FetchExternalResources', ['script']);
      window.document.implementation.addFeature('ProcessExternalResources', ['script']);
      executables = array_from(request._execute);
      add_script = __bind(function() {
        var script;
        script = executables.shift();
        if (script) {
          return __bind(function(script) {
            var tag;
            tag = window.document.createElement('script');
            tag.onload = __bind(function() {
              if (script.match(/(^|\/)view\.js$/)) {
                window.View.extend({
                  routes: this.routes
                });
              }
              tag.parentNode.removeChild(tag);
              return add_script();
            }, this);
            tag.type = 'text/javascript';
            tag.src = script;
            return window.document.head.appendChild(tag);
          }, this)(script);
        } else {
          return callback.call(this, window);
        }
      }, this);
      if (executables.length > 0) {
        return add_script();
      } else {
        return callback.call(this, window);
      }
    },
    renderWindow: function(request, window) {
      var javascripts, output, stylesheets;
      output = window.document.documentElement.innerHTML;
      stylesheets = (request._stylesheets || []).map(function(href) {
        return "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + (href.replace(this.public, '/')) + "\"/>";
      });
      javascripts = (request._javascripts || []).map(__bind(function(src) {
        var script_output;
        script_output = "<script type=\"text/javascript\" src=\"" + (src.replace(this.public, '/')) + "\"/></script>";
        if (src.match(/(^|\/)view\.js$/)) {
          script_output += "<script type=\"text/javascript\">\n  View.extend({\n    routes: " + (this.JSONFromRoutes()) + "\n  });\n</script>";
        }
        return script_output;
      }, this));
      output = output.replace(/<head>/, "<head>" + javascripts.join('') + stylesheets.join(''));
      return "<!DOCTYPE html>\n<html>\n  " + output + "\n</html>";
    }
  });
  ViewServer.extend({
    proxy: function(options) {
      var option, _i, _len, _ref;
      _ref = ['port', 'host', 'base'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        if (!options[option]) {
          this.trigger('error', "no host specified for " + option);
        }
      }
      if (!options.base.match(/\/$/)) {
        options.base = options.base + '/';
      }
      return this.server.get(new RegExp('^' + options.base.replace(/\//g, '\\/') + '(.+)$'), function(request, response) {
        var key, proxy_request, request_options, value, _ref;
        request_options = {
          host: options.host,
          port: options.port,
          path: '/' + request.params[0],
          method: request.method
        };
        proxy_request = http.request(request_options, function(proxy_response) {
          var key, value, _ref;
          response.statusCode = proxy_response.statusCode;
          _ref = proxy_response.headers;
          for (key in _ref) {
            value = _ref[key];
            response.setHeader(key, value);
          }
          proxy_response.on('data', function(chunk) {
            return response.write(chunk);
          });
          return proxy_response.on('end', function() {
            return response.end();
          });
        });
        _ref = request.headers;
        for (key in _ref) {
          value = _ref[key];
          proxy_request.setHeader(key, value);
        }
        return proxy_request.end();
      });
    }
  });
  ViewServer.extend({
    extend: {
      proxy: function(options) {
        return this.proxy(options);
      }
    }
  });
  environments = {};
  ViewServer.extend({
    env: function(request, envs) {
      var callback, env_name, response, should_call, type, _i, _len, _ref, _ref2, _response, _results;
      if (typeof request === 'object' && (request.set != null)) {
        _ref = request.set;
        _results = [];
        for (env_name in _ref) {
          callback = _ref[env_name];
          _results.push(environments[env_name] = callback);
        }
        return _results;
      } else {
        response = {
          stylesheets: [],
          javascripts: [],
          execute: []
        };
        for (env_name in envs) {
          callback = envs[env_name];
          if (!(environments[env_name] != null)) {
            should_call = false;
          } else if (typeof environments[env_name] === 'boolean') {
            should_call = environments[env_name];
          } else {
            should_call = environments[env_name](request);
          }
          if (should_call) {
            _response = typeof callback === 'function' ? callback.call(this, request) : callback;
            _ref2 = ['stylesheets', 'javascripts', 'execute'];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              type = _ref2[_i];
              if (_response[type]) {
                response[type] = response[type].concat(array_flatten(array_from((is_array(_response[type]) ? _response[type] : [_response[type]]))));
              }
            }
          }
        }
        return response;
      }
    }
  });
  ViewServer.extend({
    extend: {
      env: function(envs) {
        var args, env_name, _callback, _env_name, _results;
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
              this.env_callbacks || (this.env_callbacks = []);
              return this.env_callbacks.push(envs);
            }
          }).call(this));
        }
        return _results;
      }
    }
  });
  deffered = {};
  ViewServerManager = function() {
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
          if (!(ViewServerManager.servers[class_name] != null)) {
            ViewServer.trigger('error', "" + class_name + " has not been created.");
          }
          response.push(ViewServerManager.servers[class_name]);
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
        if (!(ViewServerManager.servers[class_name] != null)) {
          response[class_name] = null;
          if (!(deffered[class_name] != null)) {
            deffered[class_name] = [];
          }
          deffered[class_name].push(_callback);
        } else {
          response[class_name] = ViewManager.servers[class_name];
          _callback.call(response[class_name], response[class_name]);
        }
      }
      return response;
    }
  };
  ViewServerManager.servers = {};
  ViewServerManager.create = proxy(ViewServer.create, ViewServer);
  ViewServerManager.extend = proxy(ViewServer.extend, ViewServer);
  ViewServerManager.env = proxy(ViewServer.env, ViewServer);
  ViewServerManager.compileTemplates = proxy(ViewServer.compileTemplates, ViewServer);
  module.exports.ViewServer = ViewServerManager;
}).call(this);
