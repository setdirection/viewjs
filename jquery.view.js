/*
* TODO:
* - scope the jQuery object returned from the tag generator to have all bind events
*     be proxied to "this" View
* - try "MyView = $.view("create"
* - make constructor automatically create a div
* - "this" will always refer to a jQuery object scoped to that div, 
* - but it will also have all instance methods and properties of that view
* - to override auto created div you can pass in an element "MyView = $.view(some_element,function(){
*   
*   })"
* - all event observers created by "this" or it's tag methods will be proxied to "this"
* 
* In each view, all jQuery methods should be available
* but always scoped to the outer element of the view
* 

* 
* New functionality to document:
* 
* MyView = $.view(function(){
*   $(this.div()).click()
* });
* 
* $('li a',new MyView())
* $(new MyView())
*/

(function($){

  $.view = function view(structure,methods){
    var parent_class;
    if($.view.isViewClass(structure)){
      parent_class = structure;
      structure = arguments[1];
      methods = arguments[2];
    }
    var klass = function klass(attributes){
      this._observers = {};
      this.attributes = {};
      for(var method_name in $.view.builder.methods){
        this[method_name] = $.view.builder.methods[method_name];
      }
      this.initialize.apply(this,arguments);
      if(klass._observers && 'attached' in klass._observers){
        $.view.triggerOrDelayAttachedEventOnInstance(this);
      }
    };
    klass._observers = {};
    klass.instance = false;
    $.extend(klass,$.view.classMethods);
    if(parent_class){
      $.extend(klass.prototype,parent_class.prototype);
      klass.prototype.structure = $.view.wrapFunction(parent_class.prototype.structure,function(proceed){
        return structure.apply(this,[$.proxy(proceed,this)()]);
      });
    }else{
      $.extend(klass.prototype,$.view.instanceMethods);
      klass.prototype.structure = structure;
    }
    klass.prototype.bind = $.view.wrapFunction(klass.prototype.bind,$.view.observeWrapperForAttachedEventOnInstance);
    if(parent_class){
      klass._observers = {};
      for(var observer_name in parent_class._observers){
        klass._observers[observer_name] = parent_class._observers[observer_name];
      }
      klass.prototype._observers = {};
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
    var methods = ['bind','unbind','bindOnce'];
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
    if(event_name == 'attached'){
      $.view.triggerOrDelayAttachedEventOnInstance(this);
    }
    return response;
  };
  
  $.view.triggerOrDelayAttachedEventOnInstance = function triggerOrDelayAttachedEventOnInstance(instance){
    if(!instance._attachedEventFired && instance.element && $.view.nodeInDomTree(instance.element)){
      instance.trigger('attached');
      instance._attachedEventFired = true;
      if(instance._attachedEventInterval){
        clearInterval(instance._attachedEventInterval);
      }
    }else if(!('_attachedEventInterval' in instance)){
      instance._attachedEventInterval = setInterval(function(){
        if(instance.element && $.view.nodeInDomTree(instance.element)){
          instance.trigger('attached');
          instance._attachedEventFired = true;
          clearInterval(instance._attachedEventInterval);
          instance._attachedEventInterval = false;
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
        if(!(event_name in this._observers)){
          this._observers[event_name] = [];
        }
        this._observers[event_name].push(observer);
      }
      return observer;
    },
    bindOnce: function bindOnce(event_name,observer,context){
      if(context){
        outer_observer = $.view.proxyAndCurryFunction.apply($.view,[outer_observer].concat($.view.arrayFrom(arguments).slice(2)));
      }
      var inner_observer = $.view.proxyAndCurryFunction(function bound_inner_observer(){
        outer_observer.apply(this,arguments);
        this.unbind(event_name,inner_observer);
      },this);
      if(!(event_name in this._observers)){
        this._observers[event_name] = [];
      }
      this._observers[event_name].push(inner_observer);
      return inner_observer;
    },
    unbind: function unbind(event_name,observer){
      if(!(event_name in this._observers)){
        this._observers[event_name] = [];
      }
      if(event_name && observer){
        this._observers[event_name] = $.view.arrayWithoutValue(this._observers[event_name],observer);
      }
      else if(event_name){
        this._observers[event_name] = [];
      }else{
        this._observers = {};
      }
    },
    trigger: function trigger(event_name){
      if(!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0)){
        return [];
      }
      if(!(event_name in this._observers)){
        this._observers[event_name] = [];
      }
      var collected_return_values = [];
      var args = $.view.arrayFrom(arguments).slice(1);
      for(var i = 0; i < this._observers[event_name].length; ++i){
        var response = this._observers[event_name][i].apply(this._observers[event_name][i],args);
        if(response === false){
          return false;
        }else{
          collected_return_values.push(response);
        }
      }
      return collected_return_values;
    }
  };
  
  $.view.instanceMethods = {
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
        throw 'The view constructor must return a DOM element, or set this.element as a DOM element. View constructor returned:' + typeof(this.element);
      }
      this.length = 1;
      this[0] = this.element;
      this.trigger('initialized');
    },
    bind: $.view.classMethods.bind,
    bindOnce: $.view.classMethods.bindOnce,
    unbind: $.view.classMethods.unbind,
    trigger: function trigger(event_name){
      if(
        (!this.constructor._observers || !this.constructor._observers[event_name] ||
          (this.constructor._observers[event_name] && this.constructor._observers[event_name].length == 0)) &&
        (!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0))
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
    get: function get(key){
      return this.attributes[key];
    },
    set: function set(key,value){
      return this.attributes[key] = value;
    },
    setElement: function setElement(element){
      this.element = element;
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
    $.view.builder.methods[$.view.builder.tags[i]] = $.view.builder.generateBuilderMethod($.view.builder.tags[i]);
  }
})(jQuery);