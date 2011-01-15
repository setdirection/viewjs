// jQuery View v1.1.4
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
 * jQuery View provides a class and inheritance system for templates which can be constructed with a mix of pure JavaScript, HTML strings, jQuery templates and jQuery objects:
 * 
 *     ListView = $.view(function(){
 *       return this.ul(
 *         "<li>Item One</li>", //HTML strings
 *         "<li>${key}</li>", //jQuery Templates
 *         $(this.li('Item Three')).click(this.handleClick) //inline jQuery
 *       );
 *     },{
 *       //methods are auto proxied, "this" is always the view
 *       handleClick: function(event){}
 *     });
 *     //use views as arguments to jQuery
 *     var instance = new ListView({key:'Item Two'});
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
 * A subclass constructor may **optionally** return an element. In this case the subclass
 * will return the parent's p tag wrapped in a div.
 * 
 *     ParagraphView = $.view(function(){
 *       return this.p(this.get('text'));
 *     });
 * 
 *     EnhancedParagraphView = $.view(ParagraphView,function(element){
 *       return this.div({className:'enhanced'},element);
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
 * Templates will be rendered with the view's attributes and methods:
 * 
 *     MyView = $.view(function(){
 *       this.set('key','value');
 *       this.ul(
 *         '<li>${key}</li>'
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
 * The **change** event is triggered whenever attributes in the view have been changed.
 * 
 *     MyView.bind('change',function(instance,changed_attributes){
 *       for(var key in changed_attributes){
 *         
 *       }
 *     });
 * 
 */ 
;(function($,context,undefined){
  
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
    //template registration functionality
    if(structure === 'engine'){
      if(typeof(methods) === 'string'){
        default_engine = methods;
      }else{
        engines[methods.name] = methods;
        default_engine = methods.name;
      }
      return;
    }
    
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
        var parent_element = proxy(proceed,this)();
        var child_element = structure.apply(this,[parent_element]);
        return child_element || parent_element;
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
      if(instance === undefined){
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
      if(arguments_array[2] === undefined){
        arguments_array[2] = this;
      }
      observer = proxy.apply($.view,[observer].concat(arguments_array.slice(2)));
      if(typeof(event_name) === 'string' && observer !== undefined){
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
      if(arguments_array[2] === undefined){
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
    },
    engine: function engine(engine){
      if(engine === undefined){
        return engines[this._engine === undefined ? default_engine : this._engine];
      }else{
        this._engine = engine;
      }
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
      if(element === undefined){
        return this._element;
      }else{
        if(is_template(this,element)){
          element = this.render(element);
        }
        if(is_html(element)){
          element = elements_from_html_string(element)[0];
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
    /* ### instance.attributes*() -> Object*<br/>instance.attributes*(Object attributes \[,Boolean silent = false\]) -> Object*
     * Get a hash of attributes in the view.
     * 
     *     var instance = new MyView({key:'value'});
     *     instance.attributes() == {key:'value'};
     * 
     * Or set all attributes in the view. Attributes that are present in the
     * view but not in the passed object will be removed. Set **silent** to
     * true to prevent the **change** event from being triggered.
     * 
     *     instance.bind('change',function(changed_attributes){
     *        for(var key in changed_attributes){
     *          
     *        }
     *     });
     *     instance.attributes({key:'value'});
     * 
     */
    attributes: function attributes(attributes,supress_observers){
      if(attributes !== undefined){
        var keys_to_unset = {};
        for(var key in this._attributes){
          keys_to_unset[key] = true;
        }
        for(var key in attributes){
          delete keys_to_unset[key];
          this.set(key,attributes[key],true);
        }
        for(var key in keys_to_unset){
          this._changes[key] = null;
          delete this._attributes[keys_to_unset[key]];
        }
        if(supress_observers === undefined){
          this.trigger('change',this._changes,this);
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
    /* ### instance.set*(String key, mixed value \[,Boolean silent = false\]) -> mixed*
     * Set an attribute in the view. This will trigger the **change**
     * event. Set **silent** to true to prevent the **change** event
     * from firing.
     * 
     *     var instance = new MyView();
     *     instance.bind('change',function(changed_attributes){
     *       for(var key in changed_attributes){
     *       
     *       }
     *     });
     *     instance.set('key','value');
     */ 
    set: function set(key,value,supress_observers){
      this._attributes[key] = value;
      this._changes[key] = value;
      if(supress_observers === undefined){
        this.trigger('change:' + key,value);
        this.trigger('change',this._changes);
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
      var context = this;
      return function emitter(){
        return context.trigger.apply(context,args);
      };
    },
    /*
     * Helpers
     * -------
     * 
     * ### instance.map*(Array, Function(item,index)) -> Array*<br/>instance.map*(Object, Function(key,value,index)) -> Array*
     * Similar to Array#map or Ruby's Array#collect. Works on objects or Arrays.
     * If an object is passed the iterator will be called with (key,value), if
     * an Array is passed the iterator will be called with (value,index). Inside
     * the iterator "this" will always refer to the view instance.
     * 
     *     var NavigationView = $.view(function(){
     *       return this.ul(this.map({
     *         'Page Title': 'http://page.com/'
     *       },function(title,url,i){
     *         return this.li(
     *           this.a({href:url},title)
     *         );
     *       }));
     *     });
     */
    map: function map(object,callback){
      var response = [];
      if(is_array(object)){
        for(var i = 0; i < object.length; ++i){
          response.push(callback.apply(this,[object[i],i]));
        }
      }else{
        var i = 0;
        for(var key in object){
          response.push(callback.apply(this,[key,object[key],i]));
          ++i;
        }
      }
      return response;
    },
    /* ### instance.callback*(String method, [mixed arg]) -> Function*
     * Creates a callback function which will call the method with the supplied
     * arguments.
     * 
     *     MyView = $.view(function(){
     *       return this.ul(
     *         this.map([1,2,3],function(i){
     *           return this.li(
     *             $(this.a({href:'#'})).click(this.callback('handleClick',i))
     *           );
     *         })
     *       );
     *     },{
     *       handleClick: function(i){}
     *     });
     */ 
    callback: function callback(method_name){
      var args = array_from(arguments).slice(1);
      var context = this;
      return function generated_callback(){
        return context[method_name].apply(context,args);
      };
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
     * Prevent HTML or template strings
     * from being interpreted.
     * 
     *     this.p(this.escape('Will not be processed ${key}'));
     *     this.p(this.escape('<b>Will appear as text.</b>'));
     */ 
    escape: function escape(string){
      return document.createTextNode(string);
    },
    /* Templates
     * ---------
     * 
     * ### instance.render*(String template \[,Object attributes\]) -> String*
     * 
     * Render a string with the current template engine.
     * 
     *     this.set('key','value');
     *     this.render('<li>${key}</li>');
     */
    render: function render(template,attributes){
      var final_attributes = {};
      for(var key in this){
        if(in_array(key,['_delegates','_observers','_attributes','_changes']) == -1){
          final_attributes[key] = this[key];
        }
      }
      extend(final_attributes,this.attributes());
      extend(final_attributes,attributes);
      return this.constructor.engine().render(template,final_attributes);
    }
    /* ### Class.engine*() -> String*<br/>Class.engine*(String engine) -> null*<br/>$.view*('engine',Object engine) -> null*<br/>$.view*('engine',String engine) -> null*
     * Get or set the current template engine per class.
     * 
     *     MyView = $.view(function(){
     *       return "<p>{{key}}</p>";
     *     });
     *     MyView.engine('mustache');
     *     MyView.engine() == 'mustache';
     * 
     * To register a new engine, call $.view with 'engine' and an object containing
     * **name**, **detect** and **render**. The official jQuery Template plugin
      * is the default engine, and ships with jQuery View as "jquery.tmpl".
     * 
     *     $.view('engine',{
     *       name: 'mustache',
     *       detect: function(string){
     *         return string.match(/\{\{[^\}]+\}\}/);
     *       },
     *       render: function(string,attributes){
     *         return Mustache.to_html(string,attributes);
     *       }
     *     });
     * 
     * Registering a new engine will set that engine as the default on all classes unless
     * the class specifies it's engine with **Class.engine(engine)**. To change the default:
     * 
     *     $.view('engine','jquery.tmpl');
     */
  };
  
  /* Properties
   * ----------
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
  
  var engines = {};
  var default_engine;
  $.view('engine',{
    name: 'jquery.tmpl',
    detect: function(string){
      return string.match(/\$\{[^\}]+\}/);
    },
    render: function(string,attributes){
      return $.tmpl(string,attributes);
    }
  });
  
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
    if(argument === undefined || argument === null || argument === false){
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
      !(argument && (argument.nodeType === 1 || argument.nodeType === 3))
    ){
      for(attribute_name in argument){
        attributes[attribute_name] = argument[attribute_name];
      }
      return;
    }
    if(is_template(view,argument)){
      argument = view.render(argument);
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
    if(is_html(argument)){
      var generated_elements = elements_from_html_string(argument);
      for(var i = 0; i < generated_elements.length; ++i){
        elements.push(generated_elements[i]);
      }
      return;
    }else if((argument && (argument.nodeType === 1 || argument.nodeType === 3)) || typeof(argument) === 'string' || typeof(argument) === 'number'){
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
      if(!!(document.attachEvent && !context.opera) && (attributes.name || (tag_name == 'input' && attributes.type))){
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
        if(elements[i] && (elements[i].nodeType === 1 || elements[i].nodeType === 3)){
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
  
  function elements_from_html_string(html){
    if(jquery_available){
      var div = create_element('div');
      div.innerHTML = html;
      return array_from(div.childNodes);
    }else{
      return [html];
    }
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
    if(typeof(string) != 'string' || !view || !('constructor' in view && 'engine' in view.constructor)){
      return false;
    }
    return view.constructor.engine().detect(string);
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
    if(object === undefined){
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
  
})('jQuery' in this ? jQuery : ('Zepto' in this ? Zepto : this),this);

/* 
 * Resources
 * ---------
 * 
 * Change Log
 * ----------
 * **1.1.3** - *Jan 14, 2011*
 * Subclass constructors may now return an element, enabling
 * the subclass to wrap the parent's element. Added callback
 * method. Added support for Backbone style change events:
 * "change:key". Added support for registration of new template
 * engines, removed built in Mustache support.
 * 
 * **1.1.2** - *Jan 13, 2011*
 * More tests for jQuery Template. Fixed TextNode bug in builder.
 * 
 * **1.1.1** - *Jan 12, 2011*
 * Changed default engine to jQuery Template. Escape related tests
 * now pass.
 * 
 * **1.1.0** - *Jan 10, 2011*  
 * Added support for Mustache and jQuery Template. **changed** event
 * is now **change** and will receive keys that were unset in a call
 * to **attributes**.
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