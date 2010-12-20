// jQuery View v1.0
// http://viewjs.com/
// 
// Copyright (c) 2011 Ryan Johnson
// http://syntacticx.com/
// 
// Released under the MIT license.

/*
* TODO:
* - make routing the first plugin and define a plugin architcture
*   - add linkTo, etc
* - Demonstrate good application practices in docs (jQuery View manifesto)
*   - each app should have it's own small View plugin system (adding app specific functions to $.view.fn)
*   - application / file structure
*   - you don't need MVC pattern, View + Routing + Model + Server
*   - point out in docs how most id="whatever" in HTML is for jQuery to reference
*     - jQuery View removes the need to write markup for the sake of identifaction in the code
*     - jQuery View allows more meaningful connections between DOM elements and your data model
* - ensure routing only listens when a match happens, that all other hash changes defer to the page (and ids on the page)
* 
* Existing functionality to document
* - all class and instance attributes (in "internals" section)
* 
* New functionality to document:
* 
* MyView = $.view(function(){
*   $(this.div()).click()
* });
* 
* $('li a',new MyView())
* $(new MyView())
* 
* Hypothetical routes API:
* 
* $.view.routes({
*   '/': function(){
* 	},
* 	'/test': [MyView,'method']
* });
* $.view.routes.change(function(path,target){
* 
* });
* $.view.routes.set('');
* MyView.method() //also calls $.view.routes.set('/test');
*
* Attributes
* ----------
* MyViewWithAttributes = $.view(function(){
*   this.get('key');
* });
* new MyViewWithAttributes({
*   key: 'value'
* });
* 
* Routing
* -------
* By default nothing happens if you
* Second parameter to routes() is boolean "lazy"
*/

(function($,context){
  $.view = function view(structure,methods){
    var parent_class;
    if($.view.isViewClass(structure)){
      parent_class = structure;
      structure = arguments[1];
      methods = arguments[2];
    }
    var klass = function klass(attributes){
      this.observers = {};
      this.attributes = {};
      //proxy all user specified methods
      for(var i = 0; i < this.constructor.methodsToProxy.length; ++i){
        this[this.constructor.methodsToProxy[i]] = $.proxy(this[this.constructor.methodsToProxy[i]],this);
      }
      this.initialize.apply(this,arguments);
      if(klass.observers && 'ready' in klass.observers){
        $.view.triggerOrDelayAttachedEventOnInstance(this);
      }
    };
    klass.methodsToProxy = [];
    for(var method_name in methods){
      klass.methodsToProxy.push(method_name);
    }
    klass.observers = {};
    klass.instance = false;
    $.extend(klass,$.view.classMethods);
    if(parent_class){
      $.extend(klass.prototype,parent_class.prototype);
      klass.prototype.structure = $.view.wrapFunction(parent_class.prototype.structure,function(proceed){
        return structure.apply(this,[$.proxy(proceed,this)()]);
      });
      for(var i = 0; i < parent_class.methodsToProxy.length; ++i){
        klass.methodsToProxy.push(parent_class.methodsToProxy[i]);
      }
    }else{
      $.extend(klass.prototype,$.view.fn);
      klass.prototype.structure = structure;
    }
    klass.prototype.bind = $.view.wrapFunction(klass.prototype.bind,$.view.observeWrapperForAttachedEventOnInstance);
    if(parent_class){
      klass.observers = {};
      for(var observer_name in parent_class.observers){
        klass.observers[observer_name] = parent_class.observers[observer_name];
      }
      klass.prototype.observers = {};
      $.view.wrapEventMethodsForChildClass(klass,parent_class);
    }
    $.extend(klass.prototype,methods || {});
    return klass;
  };
  
  $.view.logging = false;
  
  $.view.isViewInstance = function isViewInstance(object){
    return object && object.getElement && object.getElement().nodeType == 1 && object.attributes;
  };
  
  $.view.isViewClass = function isViewClass(object){
    return object && object.prototype && object.prototype.structure && object.prototype.getElement;
  };
  
  $.view.isjQueryObject = function isjQueryObject(object){
    return typeof(object) == 'object' && ('jquery' in object) && ('selector' in object) && ('context' in object) && ('length' in object);
  };
  
  $.view.arrayFrom = function arrayFrom(object){
    if(!object){
      return [];
    }
    var length = object.length || 0;
    var results = new Array(length);
    while(length--){
      results[length] = object[length];
    }
    return results;
  };
  
  $.view.arrayWithoutValue = function without(arr){
    var values = $.view.arrayFrom(arguments).slice(1);
    var response = [];
    for(var i = 0 ; i < arr.length; i++){
      if(!($.inArray(arr[i],values) > -1)){
        response.push(arr[i]);
      }
    }
    return response;
  };
  
  $.view.proxyAndCurryFunction = function proxyAndCurryFunction(func,object){
    if(typeof(object) == 'undefined'){
      return func;
    }
    if(arguments.length < 3){
      return function bound(){
        return func.apply(object,arguments);
      };
    }else{
      var args = $.view.arrayFrom(arguments);
      args.shift();
      args.shift();
      return function bound(){
        return func.apply(object,args.concat($.view.arrayFrom(arguments)));
      }
    }
  };
  
  $.view.wrapFunction = function wrapFunction(func,wrapper){
    return function wrapped(){
      return wrapper.apply(this,[$.view.proxyAndCurryFunction(func,this)].concat($.view.arrayFrom(arguments)));
    };
  };
  
  $.view.nodeInDomTree = function nodeInDomTree(node){
    var ancestor = node;
    while(ancestor.parentNode){
      ancestor = ancestor.parentNode;
    }
    return !!(ancestor.body);
  };
  
  $.view.wrapEventMethodsForChildClass = function wrapEventMethodsForChildClass(child_class,parent_class){
    var methods = ['bind','unbind','one'];
    for(var i = 0; i < methods.length; ++i){
      (function method_wrapper_iterator(method_name){
        parent_class[method_name] = $.view.wrapFunction(parent_class[method_name],function method_wrapper(proceed){
          var arguments_array = $.view.arrayFrom(arguments).slice(1);
          child_class[method_name].apply(child_class,arguments_array);
          return proceed.apply(proceed,arguments_array);
        });
      })(methods[i]);
    }
  };
  
  $.view.observeWrapperForAttachedEventOnInstance = function observeWrapperForAttachedEventOnInstance(proceed,event_name){
    var arguments_array = $.view.arrayFrom(arguments).slice(1);
    var response = proceed.apply(proceed,arguments_array);
    if(event_name == 'ready'){
      $.view.triggerOrDelayAttachedEventOnInstance(this);
    }
    return response;
  };
  
  $.view.triggerOrDelayAttachedEventOnInstance = function triggerOrDelayAttachedEventOnInstance(instance){
    if(!instance._readyEventFired && instance.element && $.view.nodeInDomTree(instance.element)){
      instance.trigger('ready');
      instance._readyEventFired = true;
      if(instance._readyEventInterval){
        clearInterval(instance._readyEventInterval);
      }
    }else if(!('_readyEventInterval' in instance)){
      instance._readyEventInterval = setInterval(function(){
        if(instance.element && $.view.nodeInDomTree(instance.element)){
          instance.trigger('ready');
          instance._readyEventFired = true;
          clearInterval(instance._readyEventInterval);
          instance._readyEventInterval = false;
        }
      },10);
    }
  };
  
  $.view.classMethods = {
    getInstance: function getInstance(params){
      if(!this.instance){
        this.instance = new this(params || {});
      }
      return this.instance;
    },
    bind: function bind(event_name,observer,context){
      if(context){
        observer = $.view.proxyAndCurryFunction.apply($.view,[observer].concat($.view.arrayFrom(arguments).slice(2)));
      }
      if(typeof(event_name) === 'string' && typeof(observer) !== 'undefined'){
        if(!(event_name in this.observers)){
          this.observers[event_name] = [];
        }
        this.observers[event_name].push(observer);
      }
      return observer;
    },
    one: function one(event_name,observer,context){
      if(context){
        outer_observer = $.view.proxyAndCurryFunction.apply($.view,[outer_observer].concat($.view.arrayFrom(arguments).slice(2)));
      }
      var inner_observer = $.view.proxyAndCurryFunction(function bound_inner_observer(){
        outer_observer.apply(this,arguments);
        this.unbind(event_name,inner_observer);
      },this);
      if(!(event_name in this.observers)){
        this.observers[event_name] = [];
      }
      this.observers[event_name].push(inner_observer);
      return inner_observer;
    },
    unbind: function unbind(event_name,observer){
      if(!(event_name in this.observers)){
        this.observers[event_name] = [];
      }
      if(event_name && observer){
        this.observers[event_name] = $.view.arrayWithoutValue(this.observers[event_name],observer);
      }
      else if(event_name){
        this.observers[event_name] = [];
      }else{
        this.observers = {};
      }
    },
    trigger: function trigger(event_name){
      if(!this.observers || !this.observers[event_name] || (this.observers[event_name] && this.observers[event_name].length == 0)){
        return [];
      }
      if(!(event_name in this.observers)){
        this.observers[event_name] = [];
      }
      var collected_return_values = [];
      var args = $.view.arrayFrom(arguments).slice(1);
      for(var i = 0; i < this.observers[event_name].length; ++i){
        var response = this.observers[event_name][i].apply(this.observers[event_name][i],args);
        if(response === false){
          return false;
        }else{
          collected_return_values.push(response);
        }
      }
      return collected_return_values;
    },
    ready: function ready(){
      var args = $.view.arrayFrom(arguments);
      args.unshift('ready');
      return this.bind.apply(this,args);
    }
  };
  
  $.view.fn = {
    initialize: function initialize(attributes){
      this.length = 0;
      if($.view.logging){
        console.log('jQuery.View: initialized ',this,' with attributes:',attributes);
      }
      for(var key in attributes){
        this.set(key,attributes[key]);
      }
      var response = this.structure();
      if(response && !this.element){
        this.setElement(response);
      }
      if(!this.element || !this.element.nodeType || this.element.nodeType !== 1){
        throw 'The view constructor must return either a DOM element or jQuery object, or set this.element as a DOM element. View constructor returned:' + typeof(this.element);
      }
      this.trigger('initialized');
    },
    bind: $.view.classMethods.bind,
    one: $.view.classMethods.one,
    unbind: $.view.classMethods.unbind,
    ready: $.view.classMethods.ready,
    trigger: function trigger(event_name){
      if(
        (!this.constructor.observers || !this.constructor.observers[event_name] ||
          (this.constructor.observers[event_name] && this.constructor.observers[event_name].length == 0)) &&
        (!this.observers || !this.observers[event_name] || (this.observers[event_name] && this.observers[event_name].length == 0))
      ){
        return [];
      }
      var args = $.view.arrayFrom(arguments).slice(1);
      var collected_return_values = [];
      constructor_args = $.view.arrayFrom(arguments).slice(1);
      constructor_args.unshift(this);
      constructor_args.unshift(event_name);
      var collected_return_values_from_constructor = this.constructor.trigger.apply(this.constructor,constructor_args);
      if(collected_return_values_from_constructor === false){
        return false;
      }
      collected_return_values = collected_return_values.concat(collected_return_values_from_constructor);
      if(!(event_name in this.observers)){
        this.observers[event_name] = [];
      }
      var response;
      for(var i = 0; i < this.observers[event_name].length; ++i){
        response = this.observers[event_name][i].apply(this.observers[event_name][i],args);
        if(response === false){
          return false;
        }else{
          collected_return_values.push(response);
        }
      }
      return collected_return_values;
    },
    get: function get(key){
      return this.attributes[key];
    },
    set: function set(key,value){
      return this.attributes[key] = value;
    },
    setElement: function setElement(element){
      if($.view.isjQueryObject(element)){
        element = element[0];
      }
      this.element = element;
      this.length = 1;
      this[0] = this.element;
    },
    getElement: function getElement(){
      return this.element;
    }
  };
    
  $.view.builder = {
    cache: {},
    methods: {},
    tags: ('a abbr acronym address applet area b base basefont bdo big blockquote body ' +
      'br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset ' +
      'font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex ' +
      'kbd label legend li link map menu meta nobr noframes noscript object ol optgroup option p ' +
      'param pre q s samp script select small span strike strong style sub sup table tbody td ' +
      'textarea tfoot th thead title tr tt u ul var ' +
      //html5 additions
      'article aside audio command details figcaption figure footer header hgroup keygen mark ' +
      'meter nav output progress rp ruby section source summary time video').split(/\s+/),
    processNodeArgument: function processNodeArgument(elements,attributes,argument){
      if(typeof(argument) === 'undefined' || argument === null || argument === false){
        return;
      }
      if(typeof(argument) === 'function' && !$.view.isViewClass(argument)){
        argument = argument();
      }
      if($.view.isViewInstance(argument) || typeof(argument.getElement) == 'function'){
        elements.push(argument.getElement());
        return;
      }else if($.view.isViewClass(argument)){
        elements.push(new argument().getElement());
        return;
      }
      if(typeof(argument) === 'function'){
        argument = argument();
      }
      if(
        typeof(argument) !== 'string' &&
        typeof(argument) !== 'number' &&
        !$.isArray(argument) &&
        !$.view.isjQueryObject(argument) &&
        !(argument && argument.nodeType === 1)
      ){
        for(attribute_name in argument){
          attributes[attribute_name] = argument[attribute_name];
        }
        return;
      }
      if($.view.isjQueryObject(argument)){
        argument = argument.toArray();
      }
      if($.isArray(argument)){
        for(ii = 0; ii < argument.length; ++ii){
          $.view.builder.processNodeArgument(elements,attributes,argument[ii]);
        }
        return;
      }
      if((argument && argument.nodeType === 1) || typeof(argument) === 'string' || typeof(argument) === 'number'){
        elements.push(argument);
        return;
      }
    },
    createElement: function createElement(tag_name){
      var i, argument, attributes, attribute_name, elements, element;
      elements = [];
      attributes = {};
      for(i = 1; i < arguments.length; ++i){
        $.view.builder.processNodeArgument(elements,attributes,arguments[i]);
      }
      tag_name = tag_name.toLowerCase();
      if(!!(document.attachEvent && !window.opera) && (attributes.name || (tag_name == 'input' && attributes.type))){
        //ie needs these attributes to be written in the string passed to createElement
        tag = '<' + tag_name;
        if(attributes.name){
          tag += ' name="' + attributes.name + '"';
        }
        if(tag_name == 'input' && attributes.type){
          tag += ' type="' + attributes.type + '"';
        }
        tag += '>';
        delete attributes.name;
        delete attributes.type;
        element = document.createElement(tag);
      }else{
        if(!$.view.builder.cache[tag_name]){
          $.view.builder.cache[tag_name] = document.createElement(tag_name);
        }
        element = $.view.builder.cache[tag_name].cloneNode(false);
      }
      $(element).attr(attributes);
      for(i = 0; i < elements.length; ++i){
        if(elements[i] && elements[i].nodeType === 1){
          element.appendChild(elements[i]);
        }else{
          element.appendChild(document.createTextNode(String(elements[i])));
        }
      }
      return element;
    },
    generateBuilderMethod: function generateBuilderMethod(tag_name){
      return function element_generator(){
        var args = [tag_name];
        for(var i = 0; i < arguments.length; ++i){
          args.push(arguments[i]);
        }
        return $.view.builder.createElement.apply($.view.builder,args);
      };
    }
  };
  
  //generate tag methods
  for(var i = 0; i < $.view.builder.tags.length; ++i){
    $.view[$.view.builder.tags[i]] = $.view.fn[$.view.builder.tags[i]] = $.view.builder.generateBuilderMethod($.view.builder.tags[i]);
  }
  
  //routing
  $.view.routes = function(routes,lazy_loading){
    if(typeof($.address) == 'undefined'){
      throw 'jQuery Address (http://www.asual.com/jquery/address/) is required to run jQuery View Routes';
    }
    if(typeof(routes) == 'string'){
      var method_name = routes;
      if($.inArray(method_name,[
        'start',
        'stop',
        'match',
        'set',
        'get',
        'url'
      ])){
        return $.view.routes[method_name].apply($.view.routes,$.view.arrayFrom(arguments).slice(1));
      }else{
        throw method_name + ' is not a supported method.';
      }
    }else{
      $.view.routes.setRoutes(routes);
      if(!lazy_loading){
        for(var i = 0; i < $.view.routes.routes.length; ++i){
          $.view.routes.setupCallback($.view.routes.routes[i][1],i);
        }
      }
    }
  };
  $.extend($.view.routes,{
    historyManager: {
      initialize: function(){
        $.address.bind('externalChange',$.view.routes.externalChangeHandler);
      },
      onChange: function(path){
        $.address.value(path);
      }
    },
    startObserver: false,
    ready: false,
    routes: [], //array of [path,method]
    routePatterns: [], //array of [regexp,param_name_array]
    currentRoute: false,
    history: [],
    paramPattern: '([\\w]+)(/|$)',
    enabled: false,
    setRoutes: function setRoutes(routes){
      for(var path in routes){
        var route_is_array = routes[path] && typeof(routes[path]) == 'object' && 'length' in routes[path] && 'splice' in routes[path] && 'join' in routes[path];
        if(route_is_array){
          $.view.routes.addRoute(path,routes[path][0],routes[path][1]);
        }else{
          $.view.routes.addRoute(path,routes[path]);
        }
      }
      $.view.routes.start();
    },
    addRoute: function addRoute(path,callback){
      $.view.routes.routes.push([path,callback]);
      $.view.routes.routePatterns.push($.view.routes.routeMatcherFromPath(path));
    },
    routeMatcherFromPath: function routeMatcherFromPath(path){
      var params = [];
      var reg_exp_pattern = String(path);
      reg_exp_pattern = reg_exp_pattern.replace(/\((\:?[\w]+)\)/g,function(){
        return '' + arguments[1] + '?'; //regex for optional params "/:one/:two/(:three)"
      });
      reg_exp_pattern = reg_exp_pattern.replace(/\:([\w]+)(\/?)/g,function(){
        params.push(arguments[1]);
        return '(' + $.view.routes.paramPattern + ')';
      });
      reg_exp_pattern = reg_exp_pattern.replace(/\)\?\/\(/g,')?('); //cleanup for optional params 
      if(reg_exp_pattern.match(/\*/)){
        params.push('path');
        reg_exp_pattern = reg_exp_pattern.replace(/\*/g,'((.+$))?');
      }
      return [new RegExp('^' + reg_exp_pattern + '$'),params];
    },
    setupCallback: function setupCallback(callback,index_of_route){
      //context var comes from outer plugin wrapper and usually refers to window
      if(typeof(callback) == 'function'){
        return callback;
      }
      var path = $.view.routes.routes[index_of_route][0];
      var callback_bits = callback.split(/(\.|\#)/);
      var object = context[callback_bits[0]];
      if(callback.match(/[\w]+\#[\w]+/)){
        object = object.getInstance();
      }
      var method_name = callback_bits[2];
      if('callOriginal' in object[method_name]){
        return object[method_name];
      }
      var original_method = object[method_name];
      if(typeof(object[method_name]) == 'undefined'){
        throw 'The method "' + method_name + '" does not exist for the route "' + path + '"';
      }
      object[method_name] = function routing_wrapper(params){
        $.view.routes.setRoute($.view.routes.generateUrl(path,params));
        original_method.apply(object,arguments);
      };
      object[method_name].callOriginal = function original_method_callback(){
        return original_method.apply(object,arguments);
      };
      return object[method_name];
    },
    dispatcher: function dispatcher(method,params,path){
      method(params);
    },
    set: function set(path,force){
      var match = $.view.routes.match(path);
      var should_dispatch = path != $.view.routes.currentRoute;
      if(!should_dispatch && force == true){
        should_dispatch = true;
      }
      if($.view.routes.enabled && should_dispatch && match){
        match[0] = $.view.routes.setupCallback(match[0],match[2]);
        if(!('callOriginal' in match[0])){
          $.view.routes.setRoute(path);
        }
        this.history.push([path,match[0],match[1]]);
        $.view.routes.dispatcher(match[0],match[1],path);
        return true;
      }else{
        return false;
      }
    },
    match: function match(path){
      for(var i = 0; i < $.view.routes.routes.length; ++i){
        if($.view.routes.routes[i][0] == path){
          return [$.view.routes.setupCallback($.view.routes.routes[i][1],i),{},i];
        }
      }
      for(var i = 0; i < $.view.routes.routePatterns.length; ++i){
        var matches = $.view.routes.routePatterns[i][0].exec(path);
        if(matches){
          var params = {};
          for(var ii = 0; ii < $.view.routes.routePatterns[i][1].length; ++ii){
            params[$.view.routes.routePatterns[i][1][ii]] = matches[((ii + 1) * 3) - 1];
          }
          return [$.view.routes.setupCallback($.view.routes.routes[i][1],i),params,i];
        }
      }
      return false;
    },
    generateUrl: function generateUrl(url,params){
      url = url.replace(/(\(|\))/g,'');
      params = params || {};
      if(typeof(params) == 'string' && url.match(/\*/)){
        url = url.replace(/\*/,params).replace(/\/\//g,'/');
      }else{
        var param_matcher = new RegExp('\\:' + $.view.routes.paramPattern,'g');
        for(var param_name in params){
          url = url.replace(param_matcher,function(){
            return arguments[1] == param_name ? params[param_name] + arguments[2] : ':' + arguments[1] + arguments[2];
          });
        }
      }
      return url;
    },
    setRoute: function setRoute(path){
      if($.view.routes.enabled){
        if($.view.routes.currentRoute != path){
          $.view.routes.historyManager.onChange(path);
          $.view.routes.currentRoute = path;
        }
      }
    },
    get: function get(){
      var path_bits = window.location.href.split('#');
      return path_bits[1] && (path_bits[1].match(/^\//) || path_bits[1] == '') ? path_bits[1] : '';
    },
    externalChangeHandler: function externalChangeHandler(){
      if($.view.routes.enabled){
        var current_path = $.view.routes.get();
        if($.view.routes.ready){
          if(current_path != $.view.routes.currentRoute){
            $.view.routes.set(current_path);
          }
        }
      }
    },
    start: function start(){
      if(!$.view.routes.startObserver && !$.view.routes.ready){
        $.view.routes.startObserver = $(document).ready(function document_ready_observer(){
          $.view.routes.historyManager.initialize();
          $.view.routes.ready = true;
          $.view.routes.enabled = true;
          setTimeout(function initial_route_dispatcher(){
            if(!$.view.routes.set($.view.routes.get(),true)){
              $.view.routes.set('/');
            }
          });
        });
      }else{
        $.view.routes.ready = true;
        $.view.routes.enabled = true;
      }
    },
    stop: function stop(){
      $.view.routes.enabled = false;
    },
    url: function url(class_and_method,params){
      for(var i = 0; i < $.view.routes.routes.length; ++i){
        if($.view.routes.routes[i][1] == class_and_method){
          return $.view.routes.generateUrl($.view.routes.routes[i][0],params);
        }
      }
      return false;
    }
  });
  $.view.fn.url = $.view.routes.url;
  
})(jQuery,this);