// jQuery View v1.0
// http://viewjs.com/
// 
// Copyright (c) 2011 Ryan Johnson
// http://syntacticx.com/
// 
// Released under the MIT license.

/*
* TODO:
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
* $.routes({
*   '/': function(){
* 	},
* 	'/test': [MyView,'method']
* });
* $.routes.change(function(path,target){
* 
* });
* $.routes.set('');
* MyView.method() //also calls $.routes.set('/test');
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
* Builder
* =======
* 
* $.builder.tag(\*args)
* --------------------------
* **tag** can be any HTML or HTML5 element name.
* 
* $.builder("static")
* -------------------
* By default builder will export all tag methods (**br**,**h3**, etc) to **$.view.fn**
* which in turn makes them available inside your views as **this.br()**, **this.h3()**.
* Calling static will disable this. Tag methods are always availble in the **$.builder**
* object wether or not static has been called.
* 
*     $.builder.h3("My Title")
* 
* 
*/
(function($,context){
  
  (function(){
    $.view = function view(structure,methods){
      var parent_class;
      if(is_view_class(structure)){
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
          trigger_or_delay_ready_event_on_instance(this);
        }
      };
      klass.methodsToProxy = [];
      for(var method_name in methods){
        klass.methodsToProxy.push(method_name);
      }
      klass.observers = {};
      klass._instance = false;
      $.extend(klass,$.view.classMethods);
      if(parent_class){
        $.extend(klass.prototype,parent_class.prototype);
        klass.prototype.structure = wrap_function(parent_class.prototype.structure,function(proceed){
          return structure.apply(this,[$.proxy(proceed,this)()]);
        });
        for(var i = 0; i < parent_class.methodsToProxy.length; ++i){
          klass.methodsToProxy.push(parent_class.methodsToProxy[i]);
        }
      }else{
        $.extend(klass.prototype,$.view.fn);
        klass.prototype.structure = structure;
      }
      klass.prototype.bind = wrap_function(klass.prototype.bind,observe_wrapper_for_ready_event_on_instance);
      if(parent_class){
        klass.observers = {};
        for(var observer_name in parent_class.observers){
          klass.observers[observer_name] = parent_class.observers[observer_name];
        }
        klass.prototype.observers = {};
        wrap_event_methods_for_child_class(klass,parent_class);
      }
      $.extend(klass.prototype,methods || {});
      return klass;
    };

    $.view.logging = false;

    /* $.view.classMethods -> Object
     * -------------------
     * Methods that will become available to all $.view classes.
     * 
     *     $.view.classMethods.myClassMethod = function(){};
     *     MyClass = $.view(function(){});
     *     MyClass.myClassMethod();
     */ 
    $.view.classMethods = {
      instance: function instance(instance){
        if(typeof(instance) == 'undefined'){
          if(!this._instance){
            this._instance = new this();
          }
        }else{
          this._instance = instance;
        }
        return this._instance;
      },
      bind: function bind(event_name,observer,context){
        if(context){
          observer = proxy_and_curry.apply($.view,[observer].concat(array_from(arguments).slice(2)));
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
          outer_observer = proxy_and_curry.apply($.view,[outer_observer].concat(array_from(arguments).slice(2)));
        }
        var inner_observer = proxy_and_curry(function bound_inner_observer(){
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
          this.observers[event_name] = array_without_value(this.observers[event_name],observer);
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
        var args = array_from(arguments).slice(1);
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
        var args = array_from(arguments);
        args.unshift('ready');
        return this.bind.apply(this,args);
      }
    };

    /* $.view.fn -> Object
     * ---------
     * Methods that will be available to all instances of all $.view classes.
     * 
     *     $.view.fn.myMethod = function(){
     *       return this.get('key');
     *     };
     *     MyClass = $.view(function(){});
     *     var instance = new MyClass({
     *       key: 'value'
     *     });
     *     instance.myMethod(); //returns "value"
     */
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
        if(response && !this._element){
          this.element(response);
        }
        if(!this._element || !this._element.nodeType || this._element.nodeType !== 1){
          throw 'The view constructor must return either a DOM element or jQuery object, or call this.element() with a DOM element. View constructor returned:' + typeof(this._element);
        }
        this.trigger('initialized');
      },
      get: function get(key){
        return this.attributes[key];
      },
      set: function set(key,value){
        return this.attributes[key] = value;
      },
      /* instance.element() -> Element<br/>instance.element(Element element) -> Element
       * -----------------------------
       * Set or get the outermost element in the view. The element should only be set
       * from within the view constructor.
       * 
       *     var instance = new MyView(function(){
       *       return this.div();
       *     });
       *     instance.element().tagName == 'div'
       */ 
      element: function element(element){
        if(typeof(element) == 'undefined'){
          return this._element;
        }else{
          if(is_jquery_object(element)){
            element = element[0];
          }
          this._element = element;
          this.length = 1;
          this[0] = this._element;
          return this._element;
        }
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
        var args = array_from(arguments).slice(1);
        var collected_return_values = [];
        constructor_args = array_from(arguments).slice(1);
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
      }
    };
    
    function wrap_event_methods_for_child_class(child_class,parent_class){
      var methods = ['bind','unbind','one'];
      for(var i = 0; i < methods.length; ++i){
        (function method_wrapper_iterator(method_name){
          parent_class[method_name] = wrap_function(parent_class[method_name],function method_wrapper(proceed){
            var arguments_array = array_from(arguments).slice(1);
            child_class[method_name].apply(child_class,arguments_array);
            return proceed.apply(proceed,arguments_array);
          });
        })(methods[i]);
      }
    };

    function observe_wrapper_for_ready_event_on_instance(proceed,event_name){
      var arguments_array = array_from(arguments).slice(1);
      var response = proceed.apply(proceed,arguments_array);
      if(event_name == 'ready'){
        trigger_or_delay_ready_event_on_instance(this);
      }
      return response;
    };

    function trigger_or_delay_ready_event_on_instance(instance){
      if(!instance._readyEventFired && instance._element && node_in_dom_tree(instance._element)){
        instance.trigger('ready');
        instance._readyEventFired = true;
        if(instance._readyEventInterval){
          clearInterval(instance._readyEventInterval);
        }
      }else if(!('_readyEventInterval' in instance)){
        instance._readyEventInterval = setInterval(function(){
          if(instance._element && node_in_dom_tree(instance._element)){
            instance.trigger('ready');
            instance._readyEventFired = true;
            clearInterval(instance._readyEventInterval);
            instance._readyEventInterval = false;
          }
        },10);
      }
    };
  })();
        
  (function(){
    $.builder = function(method_name){
      if(method_name == 'export'){
        export_tag_methods(arguments[1]);
      }
      if(method_name == 'remove'){
        export_tag_methods(arguments[1]);
      }
    };
    
    //private builder attributes
    var methods = {};
    var cache = {};
    var tags = ('a abbr acronym address applet area b base basefont bdo big blockquote body ' +
      'br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset ' +
      'font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex ' +
      'kbd label legend li link map menu meta nobr noframes noscript object ol optgroup option p ' +
      'param pre q s samp script select small span strike strong style sub sup table tbody td ' +
      'textarea tfoot th thead title tr tt u ul var ' +
      //html5 additions
      'article aside audio command details figcaption figure footer header hgroup keygen mark ' +
      'meter nav output progress rp ruby section source summary time video').split(/\s+/);
    
    //private builder methods
    function process_node_argument(elements,attributes,argument){
      if(typeof(argument) === 'undefined' || argument === null || argument === false){
        return;
      }
      if(typeof(argument) === 'function' && !is_view_class(argument)){
        argument = argument();
      }
      if(is_view_instance(argument) || typeof(argument.element) == 'function'){
        elements.push(argument.element());
        return;
      }else if(is_view_class(argument)){
        elements.push(new argument().element());
        return;
      }
      if(typeof(argument) === 'function'){
        argument = argument();
      }
      if(
        typeof(argument) !== 'string' &&
        typeof(argument) !== 'number' &&
        !$.isArray(argument) &&
        !is_jquery_object(argument) &&
        !(argument && argument.nodeType === 1)
      ){
        for(attribute_name in argument){
          attributes[attribute_name] = argument[attribute_name];
        }
        return;
      }
      if(is_jquery_object(argument)){
        argument = argument.toArray();
      }
      if($.isArray(argument)){
        for(ii = 0; ii < argument.length; ++ii){
          process_node_argument(elements,attributes,argument[ii]);
        }
        return;
      }
      if((argument && argument.nodeType === 1) || typeof(argument) === 'string' || typeof(argument) === 'number'){
        elements.push(argument);
        return;
      }
    };
      
    function create_element(tag_name){
      var i, argument, attributes, attribute_name, elements, element;
      elements = [];
      attributes = {};
      for(i = 1; i < arguments.length; ++i){
        process_node_argument(elements,attributes,arguments[i]);
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
        if(!cache[tag_name]){
          cache[tag_name] = document.createElement(tag_name);
        }
        element = cache[tag_name].cloneNode(false);
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
    };
    
    function generate_builder_method(tag_name){
      return function element_generator(){
        var args = [tag_name];
        for(var i = 0; i < arguments.length; ++i){
          args.push(arguments[i]);
        }
        return create_element.apply($.builder,args);
      };
    };
    
    /* $.builder("export",Object target) -> null
     * ---------------------------------
     * Copies all tag methods to the target object. By default tag methods
     * are exported to **$.builder** and **$.view.fn**
     * 
     *     $.builder("export",MyObject);
     *     MyObject.div({id:'test'});
     */
    function export_tag_methods(target){
      for(var method_name in methods){
        target[method_name] = methods[method_name];
      }
    };
    
    /* $.builder("remove",Object target) -> null
     * ---------------------------------
     * Removes all tag methods from the target object that were copied
     * from a call to **$.builder("export",target)**
     */
    function remove_tag_methods(target){
      for(var method_name in methods){
        delete target[method_name];
      }
    };

    //generate tag methods
    for(var i = 0; i < tags.length; ++i){
      methods[tags[i]] = generate_builder_method(tags[i]);
    }
    
    //auto export
    $.builder('export',$.builder);
    $.builder('export',$.view.fn);
  })();
  
  (function(){
    /* Routes
     * ======
     * Maps urls to method calls and method calls to urls. This enables back button
     * support, deep linking and allows methods to be called by normal links (A tags)
     * in your application without adding event handlers or additional code to each link.
     * 
     *     $.routes({
     *       "/": "PageView#home",
     *       "/article/:id": "ArticlesView#article"
     *     });
     *     
     *     //PageView.instance().home() automatically called 
     *     
     *     $.routes("set","/article/5");
     *     //ArticlesView.instance().article({id:5}) automatically called
     *     
     *     ArticlesView.instance().article({id:6});
     *     //$.routes("set","/article/6"); automatically called
     * 
     * $.routes(Object routes \[,Boolean lazy_loading = false\]) -> null
     * ----------------------------
     * Calling routes will start routes in your appliction, dispatching the current
     * address present in the url bar of the browser. If no address is present on
     * the page **$.routes("set","/")** will automatically be called.
     * 
     * Setting **lazy_loading** to true will prevent your callbacks from being setup for
     * to automatically set the path and will prevent **instance** from being called
     * on each specified object. This is useful in large applications where you do
     * not want all views with routes initialized when $.routes starts. You can
     * manually setup each callback using **$.routes("setup",callback)**
     * 
     *     $.routes({
     *       "/": "PageView#home",
     *       "/article/:id": "ArticlesView#article",
     *       "/about/(:page_name)": "PageView#page",
     *       "/wiki/*": "WikiView#page",
     *       "/class_method": "Object.method",
     *       "/callback": function(){}
     *     });
     * 
     * Supported types of paths:
     * 
     * - "/" - A plain path with no parameters.
     * - "/article/:id" - A path with a required named parameter.
     * - "/about/(:page_name)" - A path with an optional named paramter.
     * - "/wiki/\*" - A path with an asterix / wildcard.
     * 
     * Supported types of callbacks:
     * 
     * - "PageView#home" - Will call PageView.instance().home()
     * - "Object.method" - Will call Object.method()
     * - function(){} - Will call the specified function.
     * 
     */
    $.routes = function(routes,lazy_loading){
      if(typeof($.address) == 'undefined'){
        throw 'jQuery Address (http://www.asual.com/jquery/address/) is required to run jQuery View Routes';
      }
      if(typeof(routes) == 'string'){  
        var method_name = routes;
        if(method_name == 'start'){
          return start();
        }
        if(method_name == 'stop'){
          return stop();
        }
        if(method_name == 'match'){
          return match(arguments[1]);
        }
        if(method_name == 'set'){
          return set(arguments[1]);
        }
        if(method_name == 'get'){
          return get();
        }
        if(method_name == 'url'){
          return url(arguments[1],arguments[2]);
        }
        if(method_name == 'setup'){
          return url(arguments[1]);
        }
        if(method_name == 'add'){
          return url(arguments[1],arguments[2]);
        }
        throw method_name + ' is not a supported method.';
      }else{
        set_routes(routes);
        if(!lazy_loading){
          for(var i = 0; i < routes.length; ++i){
            setup(routes[i][1],i);
          }
        }
      }
    };
    
    /* $.routes("url",String callback \[,Object params\]) -> String
     * ---------------------------------
     * Generates a url for a route.
     * 
     *     var url = $.routes("url","ArticlesView#article",{id:5});
     *     url == "/article/5"
     */
    function url(class_and_method,params){
      for(var i = 0; i < routes.length; ++i){
        if(routes[i][1] == class_and_method){
          return generate_url(routes[i][0],params);
        }
      }
      return false;
    };
    
    /* $.routes("get") -> String
     * --------------------
     * Returns the current address / path.
     */
    function get(){
      var path_bits = window.location.href.split('#');
      return path_bits[1] && (path_bits[1].match(/^\//) || path_bits[1] == '') ? path_bits[1] : '';
    };
    
    /* $.routes("set") -> null
     * --------------------
     * Sets the current address / path, calling the matched route if a match is found.
     * 
     *     $.routes("set","/article/5");
     */
    function set(path,force){
      var matched_path = match(path);
      var should_dispatch = path != current_route;
      if(!should_dispatch && force == true){
        should_dispatch = true;
      }
      if(enabled && should_dispatch && matched_path){
        matched_path[0] = setup(matched_path[0],matched_path[2]);
        if(!('callOriginal' in matched_path[0])){
          set_address(path);
        }
        $.routes.history.push([path,matched_path[0],matched_path[1]]);
        $.routes.dispatcher(matched_path[0],matched_path[1],path);
        return true;
      }else{
        return false;
      }
    };
    
    /* $.routes("add",String path,String callback) -> null
     * Add a new route.
     * 
     *     $.routes("add","/article/:id","ArticlesView#article");
     */
    function add(path,callback){
      routes.push([path,callback]);
      route_patterns.push(route_matcher_regex_from_path(path));
    };
    
    /* $.routes("match",String path) -> Array \[Function callback, Object params, Number index_of_route\]
     * ----------------------------------
     *     var match = $.routes("match","/article/5");
     *     match[0](match[1]);
     */
    function match(path){
      for(var i = 0; i < routes.length; ++i){
        if(routes[i][0] == path){
          return [setup(routes[i][1],i),{},i];
        }
      }
      for(var i = 0; i < route_patterns.length; ++i){
        var matches = route_patterns[i][0].exec(path);
        if(matches){
          var params = {};
          for(var ii = 0; ii < route_patterns[i][1].length; ++ii){
            params[route_patterns[i][1][ii]] = matches[((ii + 1) * 3) - 1];
          }
          return [setup(routes[i][1],i),params,i];
        }
      }
      return false;
    };
    
    /* $.routes("setup",String callback) -> null
     * --------------------------------------
     * If lazy loading is enabled each callback will need to be setup to enable two way routing.
     * 
     *     $.routes("setup","ArticlesView#article");
     *     ArticlesView.instance().article({id:5});
     *     $.routes("get") == "/article/5"
     */
    function setup(callback,index_of_route){
      if(typeof(callback) == 'string' && typeof(index_of_route) == 'undefined'){
        for(var i = 0; i < routes.length; ++i){
          if(routes[i][1] == callback){
            index_of_route = i;
            break; 
          }
        }
        throw 'Method ' + callback + ' not found in specified routes.';
      }
      //context var comes from outer plugin wrapper and usually refers to window
      if(typeof(callback) == 'function'){
        return callback;
      }
      var path = routes[index_of_route][0];
      var callback_bits = callback.split(/(\.|\#)/);
      var object = context[callback_bits[0]];
      if(callback.match(/[\w]+\#[\w]+/)){
        object = object.instance();
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
        set_address(generate_url(path,params));
        original_method.apply(object,arguments);
      };
      object[method_name].callOriginal = function original_method_callback(){
        return original_method.apply(object,arguments);
      };
      return object[method_name];
    };
    
    /* $.routes("stop") -> null
     * ---------------------
     * Stops the routing plugin from handling changes in the page address.
     */
    function stop(){
      enabled = false;
    };
    
    /* $.routes("start") -> null
     * ----------------------
     * Called implicitly when you specify your routes. Only necessary if **stop** has been called.
     */
    function start(){
      if(!start_observer && !ready){
        start_observer = $(document).ready(function document_ready_observer(){
          $.address.bind('externalChange',external_change_handler);
          ready = true;
          enabled = true;
          setTimeout(function initial_route_dispatcher(){
            if(!set(get(),true)){
              set('/');
            }
          });
        });
      }else{
        ready = true;
        enabled = true;
      }
    };
    
    /* $.routes.dispatcher -> Function
     * -------------------
     * The **dispatcher** property is a function invoked each time the route / path changes.
     * It is called with Function callback, Object params, String path. The default dispatcher
     * calls the callback with the params.
     * 
     *     $.routes.dispatcher = function(callback,params,path){
     *       callback(params);
     *     };
     */ 
    $.routes.dispatcher = function dispatcher(callback,params,path){
      callback(params);
    };
    /*
     * $.routes.history -> Array
     * ----------------
     * The history array contains a list of dispatched routes since $.routes was initialized.
     * Each item in the array is an array containing \[String path,Function callback,Object params\] 
     */
    $.routes.history = [];
    
    //private attributes
    var start_observer = false;
    var ready = false;
    var routes = []; //array of [path,method]
    var route_patterns = []; //array of [regexp,param_name_array]
    var current_route = false;
    var enabled = false;
    
    //private methods
    function set_routes(routes){
      for(var path in routes){
        add(path,routes[path]);
      }
      start();
    };
    
    function route_matcher_regex_from_path(path){
      var params = [];
      var reg_exp_pattern = String(path);
      reg_exp_pattern = reg_exp_pattern.replace(/\((\:?[\w]+)\)/g,function(){
        return '' + arguments[1] + '?'; //regex for optional params "/:one/:two/(:three)"
      });
      reg_exp_pattern = reg_exp_pattern.replace(/\:([\w]+)(\/?)/g,function(){
        params.push(arguments[1]);
        return '(([\\w]+)(/|$))';
      });
      reg_exp_pattern = reg_exp_pattern.replace(/\)\?\/\(/g,')?('); //cleanup for optional params 
      if(reg_exp_pattern.match(/\*/)){
        params.push('path');
        reg_exp_pattern = reg_exp_pattern.replace(/\*/g,'((.+$))?');
      }
      return [new RegExp('^' + reg_exp_pattern + '$'),params];
    };
    
    function generate_url(url,params){
      params = params || {};
      if(typeof(params) == 'string' && url.match(/\*/)){
        url = url.replace(/\*/,params).replace(/\/\//g,'/');
      }else{
        var param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?(/|$)','g');
        for(var param_name in params){
          url = url.replace(param_matcher,function(){
            return arguments[2] == param_name
              ? params[param_name] + arguments[4]
              : (arguments[1] || '') + ':' + arguments[2] + (arguments[3] || '') + arguments[4]
            ;
          });
        }
      }
      url = url.replace(/\([^\)]+\)/g,'');
      return url;
    };
    
    function set_address(path){
      if(enabled){
        if(current_route != path){
          $.address.value(path);
          current_route = path;
        }
      }
    };
    
    function external_change_handler(){
      if(enabled){
        var current_path = get();
        if(ready){
          if(current_path != current_route){
            set(current_path);
          }
        }
      }
    };

    $.view.fn.url = url;
  })();
  
  //private utility methods shared between $.view, $.builder, $.routes
  function is_view_instance(object){
    return object && object.element && object.element().nodeType == 1 && object.attributes;
  };
  
  function is_view_class(object){
    return object && object.prototype && object.prototype.structure && object.prototype.element;
  };
  
  function is_jquery_object(object){
    return typeof(object) == 'object' && ('jquery' in object) && ('selector' in object) && ('context' in object) && ('length' in object);
  };
  
  function array_from(object){
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
  
  function array_without_value(arr){
    var values = array_from(arguments).slice(1);
    var response = [];
    for(var i = 0 ; i < arr.length; i++){
      if(!($.inArray(arr[i],values) > -1)){
        response.push(arr[i]);
      }
    }
    return response;
  };
  
  function proxy_and_curry(func,object){
    if(typeof(object) == 'undefined'){
      return func;
    }
    if(arguments.length < 3){
      return function bound(){
        return func.apply(object,arguments);
      };
    }else{
      var args = array_from(arguments);
      args.shift();
      args.shift();
      return function bound(){
        return func.apply(object,args.concat(array_from(arguments)));
      }
    }
  };
  
  function wrap_function(func,wrapper){
    return function wrapped(){
      return wrapper.apply(this,[proxy_and_curry(func,this)].concat(array_from(arguments)));
    };
  };
  
  function node_in_dom_tree(node){
    var ancestor = node;
    while(ancestor.parentNode){
      ancestor = ancestor.parentNode;
    }
    return !!(ancestor.body);
  };
})(jQuery,this);