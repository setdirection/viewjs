// jQuery View v1.0
// http://viewjs.com/
// 
// Copyright (c) 2011 Ryan Johnson
// http://syntacticx.com/
// 
// Dual licensed under the MIT or GPL Version 2 licenses.

/* 
 * jQuery View
 * ===========
 * Markup as JavaScript **[Development](https://github.com/syntacticx/viewjs/zipball/master) | [Production (6KB)](https://github.com/syntacticx/viewjs/raw/master/jquery.view.min.js)**  
 * 
 * <ul id="nav">
 *   <li><a href="#intro">Intro</a></li>
 *   <li><a href="#guide">Guide</a></li>
 *   <li><a href="#api">API</a></li>
 *   <li><a href="#resources">Resources</a></li>
 * </ul>
 * <br class="clear"/>
 * 
 * jQuery View provides a class and inheritance system for templates which can be constructed with a mix of pure JavaScript, HTML strings, Mustache/jQuery templates and jQuery objects:
 * 
 *     ListView = $.view(function(){
 *       return this.ul(
 *         this.li('Item One'),
 *         $(this.li('Item Two')).click(this.handleClick),
 *         "<li>{{key}}</li>"
 *       );
 *     },{
 *       handleClick: function(event){}
 *     });
 * 
 * View instances can be used as arguments to jQuery:
 * 
 *     var instance = new ListView({key:'Item Three'});
 *     $('li:first',instance).addClass('first');
 *     $(instance).appendTo('body');
 * 
 * Works well with [jQuery Routes](http://routesjs.com/).
 * 
 * Class Creation
 * --------------
 * 
 * Use $.view to create a new View class. $.view takes two arguments, a constructor function that must return a DOM element or HTML string,
 * and an optional hash of instance methods.
 * 
 *     MyView = $.view(function(){
 *       return this.div();
 *     },{
 *       methodName: function(){}
 *     });
 * 
 * The element returned by the constructor is available via the **element** method. Passing a View
 * instance to jQuery is the same as passing the View's element to jQuery.
 * 
 *     var instance = new MyView();
 *     instance.element().tagName == 'DIV';
 *     $(instance).appendTo(document.body);
 * 
 * All instance methods specified are automatically proxied, so you can pass an instance method
 * as an event handler and "this" will still refer to the view instance.
 * 
 *     $('<a href="#">My Link</a>').click(this.handleClick);
 * 
 * ### Attributes
 * View classes take only one argument when creating a new instance: an optional hash of attributes.
 * Attributes are accessed using **get**, **set**, and **attributes** which will return a plain
 * hash of the View's attributes.
 * 
 *     var instance = new MyView({
 *       key: 'value'
 *     });
 *     instance.get('key');
 *     instance.attributes();
 * 
 * ### Subclasses
 * Views can be subclassed by passing a View class as the first argument to **$.view**. The constructor
 * will receive the parent's element as the only argument. The constructor does not need to return
 * an element since the parent's constructor has already generated it. Any events bound to the parent
 * class will be triggered on the child class.
 * 
 *     MyViewSubclass = $.view(MyView,function(element){
 *       $(element).addClass('two');
 *       this.ready(function(){
 *         //do something special only in this subclass
 *       });
 *     },{
 *       childMethod: function(){}
 *     });
 * 
 * ### Singletons
 * 
 * View classes implement a variant of the [Singleton pattern](http://en.wikipedia.org/wiki/Singleton_pattern)
 * with the **instance** method. This method will return the same instance of a view every time it is called,
 * or will create it if **instance** is being called for the first time on that class.
 * 
 *     var instance = MyView.instance();
 * 
 * Builder
 * -------
 * 
 * All HTML tag names are available as methods inside of View classes. Each view method takes a variable number of arguments which can be passed in any order and returns a DOM element. Possible arguments are:
 *
 * A hash of HTML attributes:
 * 
 *     this.a({href:'#',className:'my_link'});
 * 
 * A string:
 * 
 *     this.p('Paragraph text.');
 *
 * DOM Elements:
 * 
 *     this.ul({className:'my_list'},
 *       this.li('Item One')
 *       this.li(this.b('Bold List Item Two'))
 *     );
 * 
 * HTML strings can be mixed and matched:
 * 
 *     this.form(
 *       '<p class="label">Author</p>',
 *       this.input({name:'author',type:'text'}),
 *       this.p({className:'label'},'Body <b>Required</b>'),
 *       '<textarea name="body"></textarea>'
 *     );
 * 
 * Mustache or jQuery templates will be rendered with the view's attributes and methods:
 * 
 *     MyView = $.view(function(){
 *       this.set('key','value');
 *       this.ul(
 *         '<li>{{key}}</li>'
 *       );
 *     });
 * 
 * jQuery objects can be used. Any instance methods defined by the class will automatically be proxied, so "this" will always refer to the view instance if passed to an event handler.
 * 
 *     MyView = $.view(function(){
 *       return this.ul(
 *         this.li(
 *           $(this.a({href:'#'},'My Link')).click(this.handleClick)
 *         )
 *       );
 *     },{
 *       handleClick: function(event){
 *         //this == MyView instance
 *         var element = event.target;
 *         return false;
 *       }
 *     });
 * 
 * Methods will be called:
 * 
 *     this.ul(this.generateListItems);
 * 
 * View classes and view instances:
 * 
 *     this.ul(
 *       this.li('Item Two'),
 *       ListItemView, //will be initialized with no attributes
 *       new ListItemView({name:'Item Three'})
 *     );
 * 
 * An array (which will be flattened) of any of the above can be used as well:
 * 
 *     this.ul(
 *       this.li('Item One'),
 *       [
 *         this.li('Item Two'),
 *         this.li('Item Three'),
 *         [
 *           this.li('Item Four')
 *         ]
 *       ]
 *     );
 * 
 * The **map** method returns an Array and is designed to be used with builder methods. It accepts an array or object. "this" will always refer to the view instance inside of the iterator.
 * 
 *     this.ul(
 *       this.map(['One','Two','Three'],function(item,i){
 *         return this.li('Item ' + item);
 *       })
 *     );
 *
 *     this.ul(
 *       this.map({
 *         'jQuery': 'http://jquery.com/',
 *         'NodeJS': 'http://nodejs.org/'
 *       },function(key,value){
 *         return this.li(this.a({href:value},key));
 *       })
 *     );
 * 
 * Builder methods are also available in the **$.view** object if builder
 * methods are needed outside of view classes:
 * 
 *     MyView.classMethod = function(){
 *       return $.view.div();
 *     };
 * 
 * References to elements can be assigned as you build your elements. This saves
 * writing a query to find a particular element you need later.
 * 
 *     this.ul(
 *       this.listItemOne = this.li(),
 *       this.li()
 *     );
 *     $(this.listItemOne).click(this.clickHandler);
 * 
 * Events
 * ------
 * Each View class has the same event method names as jQuery: **bind**, **unbind**, **one**, **trigger**.
 * View events are not DOM events, there is no event object and an arbitrary number of arguments
 * can be passed to event handlers. Events should be the primary way multiple View's communicate with
 * each other.
 * 
 * Events are created with the **trigger** method. All arguments passed to trigger are passed
 * to any registered event handlers. If any event handler returns false, the call to
 * **trigger** will return false. Otherwise it will return an array of responses from the handlers.
 *     
 *     this.trigger('event_name',a,b);
 * 
 * Events can be observed on all instances of a class. Handlers will receive the instance that
 * triggered the event followed by any arguments passed in the event.
 * 
 *     MyView.bind('event_name',function(instance,a,b){
 *     
 *     });
 * 
 * View's **bind** method accepts an optional context parameter.
 * Any arguments after that will be curried onto the handler.
 * 
 *     this.bind('event_name',function(c,a,b){
 *       this == context;
 *     },context,c);
 * 
 * View classes have two built in events. The **ready** event is triggered when the View's element has been attached to the DOM.
 * It can be accessed by the **ready** method or by calling **bind('ready',handler)**.
 * 
 *     MyView = $.view(function(){
 *       this.ready(function(){
 *         this.nameInput.focus();
 *       });
 *       return this.form(
 *         this.p({className:'label','Name'}),
 *         this.nameInput = this.input({type:'text'})
 *       );
 *     });
 * 
 * The **changed** event is triggered whenever attributes in the view have been changed.
 * 
 *     MyView.bind('changed',function(instance,changed_attributes){
 *       for(var key in changed_attributes){
 *         
 *       }
 *     });
 * 
 */ 
;(function($){
  
  var jquery_available = 'fn' in $ && 'jquery' in $.fn;
  
  if(jquery_available && Number($.fn.jquery.replace(/\./g)) < 143){
    throw 'jQuery View requires jQuery 1.4.3 or later.';
  }
  
  /*
   * Class
   * -----
   * ### $.view*(Function constructor \[,Object methods\]) -> Class*<br/>$.view*(Class parent, Function(Element) \[,Object methods\]) -> Class*
   * 
   * Create a new View class:
   * 
   *     MyView = $.view(function(){
   *       return this.div();
   *     },{
   *       methodName: function(){}
   *     });
   * 
   * Or subclass an existing View class:
   * 
   *     MyViewTwo = $.view(MyView,function(element){
   *       $(element).addClass('special');
   *     },{
   *       childMethod: function(){}
   *     });
   * 
   * ### new Class*(\[Object attributes\]) -> instance*
   * Creates a new instance of a View class.
   * 
   *     var instance = new MyView({
   *       key: 'value'
   *     });
   *     instance.get('key') == 'value';
   *     $(instance).appendTo(document.body);
   *
   */
  $.view = function view(structure,methods){
    var parent_class;
    if(is_view_class(structure)){
      parent_class = structure;
      structure = arguments[1];
      methods = arguments[2];
    }
    if(typeof(structure) == 'string'){
      var html = String(structure);
      structure = function(){
        return html;
      };
    }
    var klass = function klass(attributes){
      this.engine($.view.defaultEngine);
      this._delegates = [];
      this._observers = {};
      this._attributes = {};
      this._changes = {};
      //proxy all user specified methods
      for(var i = 0; i < this.constructor._methodsToProxy.length; ++i){
        this[this.constructor._methodsToProxy[i]] = proxy(this[this.constructor._methodsToProxy[i]],this);
      }
      this.initialize.apply(this,arguments);
      if(klass._observers && 'ready' in klass._observers){
        trigger_or_delay_ready_event_on_instance(this);
      }
    };
    klass._methodsToProxy = [];
    for(var method_name in methods){
      klass._methodsToProxy.push(method_name);
    }
    klass._observers = {};
    klass._instance = false;
    extend(klass,$.view.classMethods);
    if(parent_class){
      extend(klass.prototype,parent_class.prototype);
      klass.prototype._structure = wrap_function(parent_class.prototype._structure,function(proceed){
        return structure.apply(this,[proxy(proceed,this)()]);
      });
      for(var i = 0; i < parent_class._methodsToProxy.length; ++i){
        klass._methodsToProxy.push(parent_class._methodsToProxy[i]);
      }
    }else{
      extend(klass.prototype,$.view.fn);
      klass.prototype._structure = structure;
    }
    klass.prototype.bind = wrap_function(klass.prototype.bind,observe_wrapper_for_ready_event_on_instance);
    if(parent_class){
      klass._observers = {};
      for(var observer_name in parent_class._observers){
        klass._observers[observer_name] = parent_class._observers[observer_name];
      }
      klass.prototype._observers = {};
      wrap_event_methods_for_child_class(klass,parent_class);
    }
    extend(klass.prototype,methods || {});
    return klass;
  };
  $.view.classMethods = {
    /* ### Class.instance*() -> instance*
     * Get an instance of the View class. **instance** will create a new
     * instance the first time it is invoked, and will return the same
     * instance on subsequent calls.
     * 
     *     var instance = MyView.instance();
     *     instance == MyView.instance();
     */ 
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
      var arguments_array = array_from(arguments);
      if(typeof(arguments_array[2]) == 'undefined'){
        arguments_array[2] = this;
      }
      observer = proxy.apply($.view,[observer].concat(arguments_array.slice(2)));
      if(typeof(event_name) === 'string' && typeof(observer) !== 'undefined'){
        if(!(event_name in this._observers)){
          this._observers[event_name] = [];
        }
        this._observers[event_name].push(observer);
      }
      return observer;
    },
    unbind: function unbind(event_name,observer){
      if(!(event_name in this._observers)){
        this._observers[event_name] = [];
      }
      if(event_name && observer){
        this._observers[event_name] = array_without_value(this._observers[event_name],observer);
      }
      else if(event_name){
        this._observers[event_name] = [];
      }else{
        this._observers = {};
      }
    },
    one: function one(event_name,outer_observer,context){
      var arguments_array = array_from(arguments);
      if(typeof(arguments_array[2]) == 'undefined'){
        arguments_array[2] = this;
      }
      outer_observer = proxy.apply($.view,[outer_observer].concat(arguments_array.slice(2)));
      var inner_observer = proxy(function bound_inner_observer(){
        var response = outer_observer.apply(this,arguments);
        this.unbind(event_name,inner_observer);
        return response;
      },this);
      if(!(event_name in this._observers)){
        this._observers[event_name] = [];
      }
      this._observers[event_name].push(inner_observer);
      return inner_observer;
    },
    trigger: function trigger(event_name){
      if(!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0)){
        return [];
      }
      if(!(event_name in this._observers)){
        this._observers[event_name] = [];
      }
      var collected_return_values = [];
      var args = array_from(arguments).slice(1);
      for(var i = 0; i < this._observers[event_name].length; ++i){
        var response = this._observers[event_name][i].apply(this._observers[event_name][i],args);
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
  
  /* 
   * Core
   * ----
   */ 
  $.view.fn = {
    initialize: function initialize(attributes){
      this.length = 0;
      if($.view.logging){
        console.log('jQuery.View: initialized ',this,' with attributes:',attributes);
      }
      this.attributes(attributes || {});
      var response = this._structure();
      if(response && !this._element){
        this.element(response);
      }
      if(jquery_available && (!this._element || !this._element.nodeType || this._element.nodeType !== 1)){
        throw 'The view constructor must return either a DOM element or jQuery object, or call this.element() with a DOM element. View constructor returned:' + typeof(this._element);
      }
      this.trigger('initialized');
    },
    /* ### instance.element*() -> Element*<br/>instance.element*(Element element) -> Element*
     * Get the outermost element of the view, which is returned by the constructor.
     * 
     *     var instance = new MyView();
     *     instance.element().tagName == 'DIV'
     * 
     * You can explicitly set the element in the constructor using this method instead of
     * reutrning an Element from the constructor.
     * 
     *     MyView = $.view(function(){
     *       this.element(this.div());
     *       $(this.element()).addClass('my_div');
     *     });
     * 
     */ 
    element: function element(element){
      if(typeof(element) == 'undefined'){
        return this._element;
      }else{
        if(is_template(this,element)){
          element = this.render(element);
        }
        if(is_html(element)){
          element = jquery_available ? $(element)[0] : element; 
        }else if(is_jquery_object(element)){
          element = element[0];
        }
        this._element = element;
        this.length = 1;
        this[0] = this._element;
        //bind delegate events
        if(this._delegates.length > 0){
          for(var i = 0; i < this._delegates.length; ++i){
            this.delegate(this._delegates[i][0],this._delegates[i][1],this._delegates[i][2]);
          }
          this._delegates = [];
        }
        return this._element;
      }
    },
    /* ### instance.attributes*() -> Object*<br/>instance.attributes*(Object attributes) -> null*
     * Get a hash of attributes in the view.
     * 
     *     var instance = new MyView({key:'value'});
     *     instance.attributes() == {key:'value'};
     * 
     */
    attributes: function attributes(attributes,supress_observers){
      if(typeof(attributes) != 'undefined'){
        for(var key in attributes){
          this.set(key,attributes[key],true);
        }
        if(typeof(supress_observers) == 'undefined'){
          this.trigger('changed',this._changes,this);
        }
        this._changes = {};
        return this._attributes;
      }else{
        return this._attributes;
      }
    },
    /* ### instance.get*(String key) -> mixed*
     * Get an attribute from the view.
     * 
     *     var instance = new MyView({key:'value'});
     *     instance.get('key') == 'value';
     */ 
    get: function get(key){
      return this._attributes[key];
    },
    /* ### instance.set*(String key,mixed value) -> mixed*
     * Set an attribute in the view. This will trigger the **changed**
     * event.
     * 
     *     var instance = new MyView();
     *     instance.bind('changed',function(changed_attributes){
     *       for(var key in changed_attributes){
     *       
     *       }
     *     });
     *     instance.set('key','value');
     */ 
    set: function set(key,value,supress_observers){
      this._attributes[key] = value;
      this._changes[key] = value;
      if(typeof(supress_observers) == 'undefined'){
        this.trigger('changed',this._changes);
        this._changes = {};
      }
      return value;
    },
    /* 
     * ### instance.tag*(\[String text\] \[,Element\] \[,Object attributes\]) -> Element*
     * **tag** refers to any HTML tag name and is used to create DOM elements. Tag takes
     * an arbitrary number of arguments in any order which can be:
     * 
     * - string or number
     * - HTML string
     * - hash of HTML attributes
     * - DOM Element
     * - jQuery Object
     * - View Class
     * - View instance
     * - Function to be called
     * - Array of any of the above
     * 
     * Sample usage:
     * 
     *     this.ul({className:'my_list'},
     *       this.li('Item One'),
     *       this.li('Item Two'),
     *       $(this.li('Item Three')).click(),
     *       '<li>Item Four</li>'
     *     )
     * 
     * Events
     * ------
     * ### instance.bind*(String event_name, Function handler \[,Object context\]) -> Function*
     * Register a handler for an event on a given instance. "this" will refer to the
     * view instance unless a **context** argument was passed.
     * 
     *     instance.bind('event_name',function(a,b,c){
     *       
     *     });
     * 
     * You can register an event handler on all instances of a class
     * by calling **bind** on the class. The handler will receive the instance that
     * triggered the event as the first argument, followed by any other arguments passed
     * by **trigger**.
     * 
     *     MyView.bind('event_name',function(instance,a,b,c){
     *       
     *     });
     */ 
    bind: $.view.classMethods.bind,
    /* ### instance.unbind*(\[String event_name\] \[,Function handler\]) -> null*
     * unbind an event handler registered on a given instance.
     * 
     *     instance.unbind('event_name',handler);
     *
     * Any event handlers that were registered on the class can be unbound
     * by calling Class.unbind:
     * 
     *     MyView.unbind('event_name',handler);
     */ 
    unbind: $.view.classMethods.unbind,
    /* ### instance.one*(String event_name, Function handler \[,Object context\]) -> Function*
     * This method is identical to **bind**, except that the handler is unbound after
     * its first invocation.
     * 
     *     instance.one('event_name',function(){
     *       //only called once
     *     });
     */ 
    one: $.view.classMethods.one,
    /* ### instance.trigger*(String event_name \[,mixed arg\]) -> Array or false*
     * Triggers the given event, passing an arbitrary number of arguments to the
     * handlers. Returns an array of responses, or false if
     * a handler stopped the event by returning false.
     * 
     *     instance.trigger('event_name',a,b,c);
     * 
     * **instance.trigger** will notify all handlers bound by **instance.bind**
     * and **Class.bind**. Calling **Class.trigger** will only notify handlers
     * bound by **Class.bind**.
     * 
     *     instance.bind('event_name',handler); //not called by Class.trigger
     *     MyView.bind('event_name',handler); //called by Class.trigger
     *     MyView.trigger('event_name');
     *     
     */ 
    trigger: function trigger(event_name){
      if(
        (!this.constructor._observers || !this.constructor._observers[event_name] ||
          (this.constructor._observers[event_name] && this.constructor._observers[event_name].length == 0)) &&
        (!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0))
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
      if(!(event_name in this._observers)){
        this._observers[event_name] = [];
      }
      var response;
      for(var i = 0; i < this._observers[event_name].length; ++i){
        response = this._observers[event_name][i].apply(this._observers[event_name][i],args);
        if(response === false){
          return false;
        }else{
          collected_return_values.push(response);
        }
      }
      return collected_return_values;
    },
    /* ### instance.ready*(Function handler \[,Object context\]) -> Function*
     * Identical to calling **instance.bind('ready',handler)** The **ready**
     * event is triggered when the view's outermost element is attached to the DOM.
     * "this" will always refer to the view instance unless a **context**
     * argument was passed.
     * 
     *     instance.ready(function(){
     *       $('input:first',this).focus();
     *     });
     * 
     * Calling **ready** on the class will observe the **ready** event of all instances.
     * 
     *     MyView.ready(function(instance){
     *       $('input:first',instance).focus();
     *     });
     */
    ready: $.view.classMethods.ready,
    /* ### instance.emit*(event_name \[,mixed arg\]) -> Function*
     * Creates a callback that will trigger event_name with the supplied arguments.
     * 
     *     this.bind('event_name',function(a,b,c){});
     *     $(link).click(this.emit('event_name',a,b,c));
     */ 
    emit: function emit(){
      var args = array_from(arguments);
      return proxy(function emitter(){
        return this.trigger.apply(this,args);
      },this);
    },
    /*
     * Helpers
     * -------
     * 
     * ### instance.map*(Array, Function(item,index)) -> Array*<br/>instance.map*(Object, Function(key,value)) -> Array*
     * Similar to Array#map or Ruby's Array#collect. Works on objects or Arrays.
     * If an object is passed the iterator will be called with (key,value), if
     * an Array is passed the iterator will be called with (value,index). Inside
     * the iterator "this" will always refer to the view instance.
     * 
     *     var NavigationView = $.view(function(){
     *       return this.ul(this.map({
     *         'Page Title': 'http://page.com/'
     *       },function(title,url){
     *         return this.li(
     *           this.a({href:url},title)
     *         );
     *       }));
     *     });
     */
    map: function map(object,callback){
      var responses = [];
      var response;
      if(is_array(object)){
        for(var i = 0; i < object.length; ++i){
          response = callback.apply(this,[object[i],i]);
          responses.push(response);
        }
      }else{
        for(var key in object){
          response = callback.apply(this,[key,object[key]]);
          responses.push(response);
        }
      }
      return responses;
    },
    /* ### instance.delegate*(String selector, String event_name, Function callback \[,Object context\]) -> null*
     * Equivelent to calling [jQuery's delegate](http://api.jquery.com/delegate/) method, but can
     * be called before the view's element has been created.
     * 
     *     MyView = $.view(function(){
     *       this.delegate('a','click',this.handleClick);
     *       return this.ul(
     *         this.li(this.a({href:'#'},'Link One')),
     *         this.li(this.a({href:'#'},'Link Two'))
     *       );
     *     },{
     *       handleClick: function(){}
     *     });
     */ 
    delegate: function delegate(selector,event_name,callback,context){
      if(context){
        callback = proxy(callback,context);
      }
      if(this._element){
        $(this._element).delegate(selector,event_name,callback);
      }else{
        this._delegates.push([selector,event_name,callback]);
        //will call this.delegate() when this.element(element) is called
      }
    },
    /* ### instance.escape*(String unescaped) -> String*
     * Escape user input or prevent HTML or template strings
     * from being interpreted.
     * 
     *     this.p(this.escape('Will not be processed {{key}}'));
     *     this.p(this.escape('<b>Will appear as text.</b>'));
     */ 
    escape: function escape(s){
      s = String(s === null ? "" : s);
      s = s.replace(/&(?!\w+;)|["'<>\\]/g, function(s) {
        switch(s) {
          case "&": return "&amp;";
          case "\\": return "\\\\";
          case '"': return '&quot;';
          case "'": return '&#39;';
          case "<": return "&lt;";
          case ">": return "&gt;";
          default: return s;
        }
      });
      //escape mustache
      return s.replace(/\{\{/,'\\{\\{').replace(/\}\}/,'\\}\\}');
    },
    /* Templates
     * ---------
     * 
     * ### instance.render*(String template \[,Object attributes\]) -> String*
     * 
     * Render a string with the current template engine.
     * 
     *     this.set('key','value');
     *     this.render('<li>{{key}}</li>');
     */
    render: function render(template,attributes){
      var engine = this.engine();
      var final_attributes = {};
      for(var key in this){
        if(Object.prototype.hasOwnProperty.call(this,key)){
          final_attributes[key] = this[key];
        }
      }
      extend(final_attributes,this.attributes());
      extend(final_attributes,attributes);
      if(engine == 'mustache'){
        return Mustache.to_html(template,final_attributes);
      }else if(engine == 'jquery.tmpl'){
        return $(template).tmpl(final_attributes);
      }
    },
    /* ### instance.engine*() -> String*<br/>instance.engine*(String engine) -> null*
     * Get or set the current template engine. Supported engines are "mustache" and
     * "jquery.tmpl".
     * 
     *     MyView = $.view(function(){
     *       this.engine('mustache');
     *     });
     *     MyView.instance().engine() == 'mustache';
     *     
     */  
    engine: function engine(engine){
      if(typeof(engine) == 'undefined'){
        return this._engine;
      }else{
        if(engine != 'mustache' && engine != 'jquery.tmpl'){
          throw engine + ' is not a supported template engine.';
        }
        if(engine == 'jquery.tmpl' && !('tmpl' in $)){
          throw 'the jQuery Template engine requires the jQuery Templates plugin: https://github.com/jquery/jquery-tmpl';
        }
        this._engine = engine;
      }
    }
  };
  
  /* Properties
   * ----------
   *   
   * ### $.view.defaultEngine *-> String*
   * 
   * Sets the default template engine. The template engine can be overridden
   * per class with the **engine** method. Supported engines are "mustache"
   * (the default) and "jquery.tmpl".
   * 
   * ### $.view.classMethods *-> Object*
   * 
   * Methods that are available to all view classes.
   * 
   *     $.view.classMethods.myClassMethod = function(){};
   *     MyClass = $.view(function(){});
   *     MyClass.myClassMethod();
   * 
   * ### $.view.logging *-> Boolean*
   *
   * Set this to true to have view classes output console.log messages.
   * 
   * ### $.view.fn *-> Object*
   * Methods that will be available to all instances of all view classes.
   * 
   *     $.view.fn.myMethod = function(){
   *       return this.get('key');
   *     };
   *     MyClass = $.view(function(){});
   *     var instance = new MyClass({
   *       key: 'value'
   *     });
   *     instance.myMethod(); //returns "value"
   * 
   */
  $.view.logging = false;
  $.view.defaultEngine = 'mustache';
  
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
      //initial timeout is set instead of just using setInterval
      //because often the dom element will be attached as soon
      //as all synchronous code has been executed
      setTimeout(function(){
        if(instance._element && node_in_dom_tree(instance._element)){
          instance.trigger('ready');
          instance._readyEventFired = true;
        }else{
          instance._readyEventInterval = setInterval(function(){
            if(instance._element && node_in_dom_tree(instance._element)){
              instance.trigger('ready');
              instance._readyEventFired = true;
              clearInterval(instance._readyEventInterval);
              instance._readyEventInterval = false;
            }
          },10);
        }
      });
    }
  };
  
  //private builder attributes
  var methods = {};
  var cache = {};
  var supported_html_tags = ('a abbr acronym address applet area b base basefont bdo big blockquote body ' +
    'br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset ' +
    'font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex ' +
    'kbd label legend li link menu meta nobr noframes noscript object ol optgroup option p ' +
    'param pre q s samp script select small span strike strong style sub sup table tbody td ' +
    'textarea tfoot th thead title tr tt u ul var ' +
    //html5 additions
    'article aside audio command details figcaption figure footer header hgroup keygen mark ' +
    'meter nav output progress rp ruby section source summary time video').split(/\s+/);
  var attribute_map = {
    "htmlFor": "for",
    "className": "class"
  };
  
  //private builder methods
  function process_node_argument(view,elements,attributes,argument){
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
      !is_array(argument) &&
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
    if(is_array(argument)){
      var flattened = flatten_array(argument);
      for(var i = 0; i < flattened.length; ++i){
        process_node_argument(view,elements,attributes,flattened[i]);
      }
      return;
    }
    if(is_template(view,argument)){
      argument = view.render(argument);
    }
    if(is_html(argument)){
      var generated_elements = jquery_available ? $(argument) : [argument];
      for(var i = 0; i < generated_elements.length; ++i){
        elements.push(generated_elements[i]);
      }
      return;
    }else if((argument && argument.nodeType === 1) || typeof(argument) === 'string' || typeof(argument) === 'number'){
      elements.push(argument);
      return;
    }
  };
    
  function create_element(tag_name){
    var i, argument, attributes, attribute_name, elements, element;
    elements = [];
    attributes = {};
    for(i = 1; i < arguments.length; ++i){
      process_node_argument(this,elements,attributes,arguments[i]);
    }
    tag_name = tag_name.toLowerCase();
    if(jquery_available){
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
    }else{
      element = '<' + tag_name;
      for(var attribute_name in attributes){
        element += ' ' + (attribute_map[attribute_name] || attribute_name) + '="' + attributes[attribute_name] + '"'
      }
      if(elements.length == 0){
        element += ' />';
      }else{
        element += '>';
        for(i = 0; i < elements.length; ++i){
          element += elements[i];
        }
        element += '</' + tag_name + '>';
      }
    }
    return element;
  };
  
  function flatten_array(array){
    var flattened = [];
    for(var i = 0; i < array.length; ++i){
      if(is_array(array[i])){
        flattened = flattened.concat(flatten_array(array[i]));
      }else{
        flattened.push(array[i]);
      }
    }
    return flattened;
  };
  
  function generate_builder_method(tag_name){
    return function element_generator(){
      var args = [tag_name];
      for(var i = 0; i < arguments.length; ++i){
        args.push(arguments[i]);
      }
      return create_element.apply(this,args);
    };
  };
  
  function export_tag_methods(target){
    for(var method_name in methods){
      if(!(method_name in target)){
        target[method_name] = methods[method_name];
      }
    }
  };
  
  function remove_tag_methods(target){
    for(var method_name in methods){
      delete target[method_name];
    }
  };
  
  //generate tag methods
  for(var i = 0; i < supported_html_tags.length; ++i){
    methods[supported_html_tags[i]] = generate_builder_method(supported_html_tags[i]);
  }
  
  //export tag methods
  export_tag_methods($.view);
  export_tag_methods($.view.fn);
  
  //private utility methods shared between $.view and builder
  function extend(destination,source){
    for(var property in source){
      destination[property] = source[property];
    }
    return destination;
  };
  
  function is_view_instance(object){
    return object && object.element && object.element().nodeType == 1 && object._attributes;
  };
  
  function is_view_class(object){
    return object && object.prototype && object.prototype._structure && object.prototype.element;
  };
  
  function is_jquery_object(object){
    return typeof(object) == 'object' && ('jquery' in object) && ('length' in object);
  };
  
  function is_html(string){
    return typeof(string) == 'string' && string.match(/^<[\w\W]+>/);
  };
  
  function is_template(view,string){
    if(typeof(string) != 'string' || !view || !('engine' in view)){
      return false;
    }
    var engine = view.engine();
    if(engine == 'mustache'){
      return string.match(/\{\{[^\}]+\}\}/);
    }else if(engine == 'jquery.tmpl'){
      return string.match(/\$\{[^\}]+\}/);
    }
  };
  
  function is_array(array){
    return Object.prototype.toString.call(array) === '[object Array]';
  };
  
  function in_array(element,array){
    if(array.indexOf){
      return array.indexOf(element);
    }
    for(var i = 0, length = array.length; i < length; i++){
      if(array[i] === element){
        return i;
      }
    }
    return -1;
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
      if(!(in_array(arr[i],values) > -1)){
        response.push(arr[i]);
      }
    }
    return response;
  };
  
  //includes curry functionality if more than two arguments are passed
  function proxy(func,object){
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
      return wrapper.apply(this,[proxy(func,this)].concat(array_from(arguments)));
    };
  };
  
  function node_in_dom_tree(node){
    var ancestor = node;
    while(ancestor.parentNode){
      ancestor = ancestor.parentNode;
    }
    return !!(ancestor.body);
  };
  
  /*
    mustache.js — Logic-less templates in JavaScript

    See http://mustache.github.com/ for more info.
  */

  var Mustache = function() {
    var Renderer = function() {};

    Renderer.prototype = {
      otag: "{{",
      ctag: "}}",
      pragmas: {},
      buffer: [],
      pragmas_implemented: {
        "IMPLICIT-ITERATOR": true
      },
      context: {},

      render: function(template, context, partials, in_recursion) {
        // reset buffer & set context
        if(!in_recursion) {
          this.context = context;
          this.buffer = []; // TODO: make this non-lazy
        }

        // fail fast
        if(!this.includes("", template)) {
          if(in_recursion) {
            return template;
          } else {
            this.send(template);
            return;
          }
        }

        template = this.render_pragmas(template);
        var html = this.render_section(template, context, partials);
        if(in_recursion) {
          return this.render_tags(html, context, partials, in_recursion);
        }

        this.render_tags(html, context, partials, in_recursion);
      },

      /*
        Sends parsed lines
      */
      send: function(line) {
        if(line != "") {
          this.buffer.push(line);
        }
      },

      /*
        Looks for %PRAGMAS
      */
      render_pragmas: function(template) {
        // no pragmas
        if(!this.includes("%", template)) {
          return template;
        }

        var that = this;
        var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
              this.ctag);
        return template.replace(regex, function(match, pragma, options) {
          if(!that.pragmas_implemented[pragma]) {
            throw({message: 
              "This implementation of mustache doesn't understand the '" +
              pragma + "' pragma"});
          }
          that.pragmas[pragma] = {};
          if(options) {
            var opts = options.split("=");
            that.pragmas[pragma][opts[0]] = opts[1];
          }
          return "";
          // ignore unknown pragmas silently
        });
      },

      /*
        Tries to find a partial in the curent scope and render it
      */
      render_partial: function(name, context, partials) {
        name = this.trim(name);
        if(!partials || partials[name] === undefined) {
          throw({message: "unknown_partial '" + name + "'"});
        }
        if(typeof(context[name]) != "object") {
          return this.render(partials[name], context, partials, true);
        }
        return this.render(partials[name], context[name], partials, true);
      },

      /*
        Renders inverted (^) and normal (#) sections
      */
      render_section: function(template, context, partials) {
        if(!this.includes("#", template) && !this.includes("^", template)) {
          return template;
        }

        var that = this;
        // CSW - Added "+?" so it finds the tighest bound, not the widest
        var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
                "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
                "\\s*", "mg");

        // for each {{#foo}}{{/foo}} section do...
        return template.replace(regex, function(match, type, name, content) {
          var value = that.find(name, context);
          if(type == "^") { // inverted section
            if(!value || that.is_array(value) && value.length === 0) {
              // false or empty list, render it
              return that.render(content, context, partials, true);
            } else {
              return "";
            }
          } else if(type == "#") { // normal section
            if(that.is_array(value)) { // Enumerable, Let's loop!
              return that.map(value, function(row) {
                return that.render(content, that.create_context(row),
                  partials, true);
              }).join("");
            } else if(that.is_object(value)) { // Object, Use it as subcontext!
              return that.render(content, that.create_context(value),
                partials, true);
            } else if(typeof value === "function") {
              // higher order section
              return value.call(context, content, function(text) {
                return that.render(text, context, partials, true);
              });
            } else if(value) { // boolean section
              return that.render(content, context, partials, true);
            } else {
              return "";
            }
          }
        });
      },

      /*
        Replace {{foo}} and friends with values from our view
      */
      render_tags: function(template, context, partials, in_recursion) {
        // tit for tat
        var that = this;

        var new_regex = function() {
          return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
            that.ctag + "+", "g");
        };

        var regex = new_regex();
        var tag_replace_callback = function(match, operator, name) {
          switch(operator) {
          case "!": // ignore comments
            return "";
          case "=": // set new delimiters, rebuild the replace regexp
            that.set_delimiters(name);
            regex = new_regex();
            return "";
          case ">": // render partial
            return that.render_partial(name, context, partials);
          case "{": // the triple mustache is unescaped
            return that.find(name, context);
          default: // escape the value
            return that.escape(that.find(name, context));
          }
        };
        var lines = template.split("\n");
        for(var i = 0; i < lines.length; i++) {
          lines[i] = lines[i].replace(regex, tag_replace_callback, this);
          if(!in_recursion) {
            this.send(lines[i]);
          }
        }

        if(in_recursion) {
          return lines.join("\n");
        }
      },

      set_delimiters: function(delimiters) {
        var dels = delimiters.split(" ");
        this.otag = this.escape_regex(dels[0]);
        this.ctag = this.escape_regex(dels[1]);
      },

      escape_regex: function(text) {
        // thank you Simon Willison
        if(!arguments.callee.sRE) {
          var specials = [
            '/', '.', '*', '+', '?', '|',
            '(', ')', '[', ']', '{', '}', '\\'
          ];
          arguments.callee.sRE = new RegExp(
            '(\\' + specials.join('|\\') + ')', 'g'
          );
        }
        return text.replace(arguments.callee.sRE, '\\$1');
      },

      /*
        find `name` in current `context`. That is find me a value
        from the view object
      */
      find: function(name, context) {
        name = this.trim(name);

        // Checks whether a value is thruthy or false or 0
        function is_kinda_truthy(bool) {
          return bool === false || bool === 0 || bool;
        }

        var value;
        if(is_kinda_truthy(context[name])) {
          value = context[name];
        } else if(is_kinda_truthy(this.context[name])) {
          value = this.context[name];
        }

        if(typeof value === "function") {
          return value.apply(context);
        }
        if(value !== undefined) {
          return value;
        }
        // silently ignore unkown variables
        return "";
      },

      // Utility methods

      /* includes tag */
      includes: function(needle, haystack) {
        return haystack.indexOf(this.otag + needle) != -1;
      },

      /*
        Does away with nasty characters
      */
      escape: function(s) {
        s = String(s === null ? "" : s);
        return s.replace(/&(?!\w+;)|["'<>\\]/g, function(s) {
          switch(s) {
          case "&": return "&amp;";
          case "\\": return "\\\\";
          case '"': return '&quot;';
          case "'": return '&#39;';
          case "<": return "&lt;";
          case ">": return "&gt;";
          default: return s;
          }
        });
      },

      // by @langalex, support for arrays of strings
      create_context: function(_context) {
        if(this.is_object(_context)) {
          return _context;
        } else {
          var iterator = ".";
          if(this.pragmas["IMPLICIT-ITERATOR"]) {
            iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
          }
          var ctx = {};
          ctx[iterator] = _context;
          return ctx;
        }
      },

      is_object: function(a) {
        return a && typeof a == "object";
      },

      is_array: function(a) {
        return Object.prototype.toString.call(a) === '[object Array]';
      },

      /*
        Gets rid of leading and trailing whitespace
      */
      trim: function(s) {
        return s.replace(/^\s*|\s*$/g, "");
      },

      /*
        Why, why, why? Because IE. Cry, cry cry.
      */
      map: function(array, fn) {
        if (typeof array.map == "function") {
          return array.map(fn);
        } else {
          var r = [];
          var l = array.length;
          for(var i = 0; i < l; i++) {
            r.push(fn(array[i]));
          }
          return r;
        }
      }
    };

    return({
      name: "mustache.js",
      version: "0.3.1-dev",

      /*
        Turns a template and view into HTML
      */
      to_html: function(template, view, partials, send_fun) {
        var renderer = new Renderer();
        if(send_fun) {
          renderer.send = send_fun;
        }
        renderer.render(template, view, partials);
        if(!send_fun) {
          return renderer.buffer.join("\n");
        }
      }
    });
  }();
  
})('jQuery' in this ? jQuery : this);

/* 
 * Resources
 * ---------
 * 
 * Change Log
 * ----------
 * **1.1.0** - *Jan 10, 2011*  
 * Added support for Mustache and jQuery Template.
 * 
 * **1.0.0** - *Jan 4, 2011*  
 * Initial release.
 * 
 * Thank You
 * ---------
 * To [\_why](http://www.youtube.com/watch?v=lwDDa9ctNFE) for [Markaby](http://markaby.github.com/) and the fine folks at [DocumentCloud](http://documentcloud.org/)
 * for [Backbone.js](http://documentcloud.github.com/backbone/).
 * 
 * License
 * -------
 * Copyright 2011 [Syntacticx](http://syntacticx.com/). Released under the [MIT or GPL License](http://jquery.org/license).  
 */