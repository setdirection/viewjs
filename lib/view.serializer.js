(function() {
  var ViewSerializer, XMLHttpRequest, create_empty_document, jsdom;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  jsdom = require('jsdom').jsdom;
  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  create_empty_document = function() {
    return jsdom('<html><head></head><body></body></html>');
  };
  ViewSerializer = {
    setup: function(options) {
      return this.stylesheets = options.stylesheets, this.javascripts = options.javascripts, this.execute = options.execute, this.public = options.public, this.domain = options.domain, this.routes = options.routes, this.url = options.url, this.meta = options.meta, options;
    },
    renderWindow: function(window) {
      var javascripts, output, stylesheets;
      output = window.document.documentElement.innerHTML;
      stylesheets = (this.stylesheets || []).map(__bind(function(href) {
        return "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + (href.replace(this.public, '/')) + "\"/>";
      }, this));
      javascripts = (this.javascripts || []).map(__bind(function(src) {
        var script_output;
        script_output = "<script type=\"text/javascript\" src=\"" + (src.replace(this.public, '/')) + "\"/></script>";
        if (src.match(/(^|\/)view\.js$/)) {
          script_output += "<script type=\"text/javascript\">\n  View.extend({\n    routes: " + (JSON.stringify(this.routes)) + "\n  });\n  window.domain = \"" + this.domain + "\";\n</script>";
        }
        return script_output;
      }, this));
      if (window.document.title != null) {
        this.meta.push("<title>" + window.document.title + "</title>");
      }
      output = output.replace(/<head>/, "<head>" + this.meta.join('') + javascripts.join('') + stylesheets.join(''));
      return "<!DOCTYPE html>\n<html>\n  " + output + "\n</html>";
    },
    createWindow: function(callback) {
      var add_script, document, executables, window;
      document = create_empty_document();
      window = document.createWindow();
      window.domain = this.domain;
      window.XMLHttpRequest = XMLHttpRequest;
      window.document.implementation.addFeature('MutationEvents', ['1.0']);
      window.document.implementation.addFeature('FetchExternalResources', ['script']);
      window.document.implementation.addFeature('ProcessExternalResources', ['script']);
      executables = this.execute;
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
    serialize: function(callback) {
      return this.createWindow(__bind(function(window) {
        if (window.View != null) {
          window.View.extend({
            on: {
              route: __bind(function(view_instance) {
                return callback(this.renderWindow(window));
              }, this)
            }
          });
          return window.View.extend({
            route: this.url
          });
        } else {
          return callback(this.renderWindow(window));
        }
      }, this));
    }
  };
  ViewSerializer.setup(JSON.parse(process.argv[2]));
  ViewSerializer.serialize(function(output) {
    return process.stdout.write(output);
  });
}).call(this);
