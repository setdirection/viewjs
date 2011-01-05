// jQuery View v1.0
// http://viewjs.com/
// 
// Copyright (c) 2011 Ryan Johnson
// http://syntacticx.com/
// 
// Dual licensed under the MIT or GPL Version 2 licenses.
//

//* - most id="whatever" in HTML is for jQuery to reference
//* - jQuery View removes the need to write markup for the sake of identifaction in the code
//* - jQuery View allows more meaningful connections between DOM elements and your data model
//* - passing a View instance to jQuery is the same as passing the View instance's element to jQuery

//break API into sections, with format:
//Tutorial, example, API
//
//Builder
//Events
//Attributes (including changed event, data binding)
//Helpers


/* 
 * jQuery View
 * ===========
 * **Download:** [Development](https://github.com/syntacticx/viewjs/zipball/master) | [Production (4KB)](https://github.com/syntacticx/viewjs/raw/master/jquery.view.min.js)  
 * **See Also:** [jQuery Model](http://modeljs.com/) | [jQuery Routes](http://routesjs.com/)
 * 
 * A DOM centric class and inheritence system for jQuery.
 * 
 * Class Creation
 * --------------
 * 
 * ### $.view*(Function builder \[,Object instance_methods\]) -> Class*<br/>$.view*(Object parent_class, Function builder \[,Object instance_methods\]) -> Class*
 * Creates a new View class.
 * 
 *     MyView = $.view(function(){
 *       return this.div();
 *     },{
 *       myMethod: function(){}
 *     });
 * 
 * ### Subclasses
 * Views can be subclassed by passing a View class as the first argument to **$.view**. The constructor
 * will receive the parent's element as the only argument.
 * 
 *     MyViewTwo = $.view(MyView,function(element){
 *       $(element).addClass('two');
 *       this.ready(function(){
 *         //do something special only in this subclass
 *       });
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
 * ### instance.tag*(\[String text\] \[,Element\] \[,Object attributes\]) -> Element*
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
 * An array of strings, object attributes or DOM elements can be used.
 * 
 *     this.ul(
 *       this.li('Item One'),
 *       [
 *         this.li('Item Two'),
 *         this.li('Item Three')
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
 * Methods that are used will be called:
 * 
 *     this.ul(this.generateListItems);
 * 
 * View classes and view instances can also be used:
 * 
 *     this.ul(
 *       this.li('Item Two'),
 *       ListItemView, //will be initialized with no attributes
 *       new ListItemView({name:'Item Three'})
 *     );
 * 
 * Builder methods are also available in the **$.view** object if builder
 * methods are needed outside of view classes:
 * 
 *     MyView.classMethod = function(){
 *       return $.view.div();
 *     };
 * 
 * Events
 * ------
 * View class
 * 
 * Each View class has the same event method names as jQuery: **bind**, **unbind**, **one**, **trigger**.
 * Unlike jQuery/DOM events, there is no Event object, and the event handlers can take an arbi
 * 
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
(function($,context){
  
  if(Number($.fn.jquery.replace(/\./g)) < 143){
    throw 'jQuery View requires jQuery 1.4.3 or later.';
  }
  
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
      this._delegates = [];
      this._observers = {};
      this._attributes = {};
      this._changes = {};
      //proxy all user specified methods
      for(var i = 0; i < this.constructor._methodsToProxy.length; ++i){
        this[this.constructor._methodsToProxy[i]] = $.proxy(this[this.constructor._methodsToProxy[i]],this);
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
    $.extend(klass,$.view.classMethods);
    if(parent_class){
      $.extend(klass.prototype,parent_class.prototype);
      klass.prototype._structure = wrap_function(parent_class.prototype._structure,function(proceed){
        return structure.apply(this,[$.proxy(proceed,this)()]);
      });
      for(var i = 0; i < parent_class._methodsToProxy.length; ++i){
        klass._methodsToProxy.push(parent_class._methodsToProxy[i]);
      }
    }else{
      $.extend(klass.prototype,$.view.fn);
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
    $.extend(klass.prototype,methods || {});
    return klass;
  };
  /*
   * Class Methods
   * -------------
   */ 
  $.view.classMethods = {
    /* ### Class.instance*() -> instance*
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
    /* ### Class.bind*(String event_name, Function handler \[,Object context\]) -> Function*
     */ 
    bind: function bind(event_name,observer,context){
      var arguments_array = array_from(arguments);
      if(typeof(arguments_array[2]) == 'undefined'){
        arguments_array[2] = this;
      }
      observer = proxy_and_curry.apply($.view,[observer].concat(arguments_array.slice(2)));
      if(typeof(event_name) === 'string' && typeof(observer) !== 'undefined'){
        if(!(event_name in this._observers)){
          this._observers[event_name] = [];
        }
        this._observers[event_name].push(observer);
      }
      return observer;
    },
    /* ### Class.unbind*(\[String event_name\] \[,Function handler\]) -> null*
     */
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
    /* ### Class.one*(String event_name, Function handler \[,Object context\]) -> Function*
     */ 
    one: function one(event_name,outer_observer,context){
      var arguments_array = array_from(arguments);
      if(typeof(arguments_array[2]) == 'undefined'){
        arguments_array[2] = this;
      }
      outer_observer = proxy_and_curry.apply($.view,[outer_observer].concat(arguments_array.slice(2)));
      var inner_observer = proxy_and_curry(function bound_inner_observer(){
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
    /* ### Class.trigger*(String event_name) -> Array or false*
     */
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
    /* ### Class.ready*(Function handler \[,Object context\]) -> Function*
     */
    ready: function ready(){
      var args = array_from(arguments);
      args.unshift('ready');
      return this.bind.apply(this,args);
    }
  };
  
  /* 
   * Instance Methods
   * ----------------
   * 
   * ### new Class*(\[Object attributes\]) -> instance*
   * Creates a new instance of a View class.
   * 
   *     var instance = new MyView({
   *       key: 'value'
   *     });
   *     $(instance).appendTo(document.body);
   * 
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
      if(!this._element || !this._element.nodeType || this._element.nodeType !== 1){
        throw 'The view constructor must return either a DOM element or jQuery object, or call this.element() with a DOM element. View constructor returned:' + typeof(this._element);
      }
      this.trigger('initialized');
    },
    /* ### instance.element*() -> Element*<br/>instance.element*(Element element) -> Element*
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
        if(is_html(element)){
          element = $(element)[0];
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
     */ 
    get: function get(key){
      return this._attributes[key];
    },
    /* ### instance.set*(String key,mixed value) -> mixed*
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
    /* ### instance.bind*(String event_name, Function handler \[,Object context\]) -> Function*
     */ 
    bind: $.view.classMethods.bind,
    /* ### instance.unbind*(\[String event_name\] \[,Function handler\]) -> null*
     */ 
    unbind: $.view.classMethods.unbind,
    /* ### instance.ready*(Function handler \[,Object context\]) -> Function*
     */
    ready: $.view.classMethods.ready,
    /* ### instance.one*(String event_name, Function handler \[,Object context\]) -> Function*
     */ 
    one: $.view.classMethods.one,
    /* ### instance.trigger*(String event_name) -> Array or false*
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
    /*
     * ### instance.map*(mixed,Function iterator) -> Array*
     * Similar to Array#map or Ruby's Array#collect. Works on objects or Arrays.
     * If an object is passed the iterator will be called with (key,value), if
     * an Array is passed the iterator will be called with (value,index). Inside
     * the iterator "this" will always refer to the view instance.
     * 
     *     var NavigationView = $.view(function(){
     *       return this.ul(this.map({
     *         'Page Title: 'http://page.com/'
     *       },function(title,url){
     *         return this.li(
     *           this.a({href:url},title)
     *         );
     *       }));
     *     });
     */
     map: function map(object,callback){
       var response = [];
       if($.isArray(object)){
         for(var i = 0; i < object.length; ++i){
           response.push(callback.apply(this,[object[i],i]));
         }
       }else{
         for(var key in object){
           response.push(callback.apply(this,[key,object[key]]));
         }
       }
       return response;
     },
     /* ### instance.delegate*(String selector,String event_name,Function callback\[,Object context\]) -> null*
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
         callback = $.proxy(callback,context);
       }
       if(this._element){
         $(this._element).delegate(selector,event_name,callback);
       }else{
         this._delegates.push([selector,event_name,callback]);
         //will call this.delegate() when this.element(element) is called
       }
     }
  };
  
  /* Properties
   * ----------
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
   */
  $.view.logging = false;
  
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
      var flattened = flatten_array(argument);
      for(var i = 0; i < flattened.length; ++i){
        process_node_argument(elements,attributes,flattened[i]);
      }
      return;
    }
    if(is_html(argument)){
      var generated_elements = $(argument);
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
  
  function flatten_array(array){
    var flattened = [];
    for(var i = 0; i < array.length; ++i){
      if($.isArray(array[i])){
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
      return create_element.apply($.builder,args);
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
  
  //private utility methods shared between $.view and $.builder
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

/* 
 * Examples
 * --------
 *  - nested views
 *  - modifying classes without modifying the original code (Class ready event)
 *  - string constructors / mustache templates / jquery templates
 * 
 * Change Log
 * ----------
 * **1.0.0** - *Jan 7, 2011*  
 * Initial release.
 * 
 * ---
 * 
 * Copyright 2011 [Syntacticx](http://syntacticx.com/). Released under the [MIT or GPL License](http://jquery.org/license).  
 * Style inspired by [Backbone.js](http://documentcloud.github.com/backbone/)
 */