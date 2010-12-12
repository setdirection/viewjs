(function($){
  
  $.View = {
    logging: false,
    create: function create(structure,methods){
      var parent_class;
      if($.View.isViewClass(structure)){
        parent_class = structure;
        structure = arguments[1];
        methods = arguments[2];
      }
      var klass = function klass(scope){
        this._observers = {};
        this.attributes = {};
        this.initialize.apply(this,arguments);
        this.trigger('initialized');
        if(klass._observers && 'attached' in klass._observers){
          $.View.triggerOrDelayAttachedEventOnInstance(this);
        }
        /* find a smarter way to do this?
        for(var attribute_name in this){
          if(typeof(this[attribute_name]) == 'function'){
            this[attribute_name] = $.proxy(this[attribute_name],this);
          }
        }
        */
      };
      klass._observers = {};
      klass.instance = false;
      $.extend(klass,$.View.classMethods);
      if(parent_class){
        $.extend(klass.prototype,parent_class.prototype);
        klass.prototype.structure = $.View.wrapFunction(parent_class.prototype.structure,function(proceed){
          return structure.apply(this,[$.proxy(proceed,this)()]);
        });
      }else{
        $.extend(klass.prototype,$.View.instanceMethods);
        klass.prototype.structure = structure;
      }
      ActiveEvent.extend(klass);
      klass.prototype.bind = $.View.wrapFunction(klass.prototype.bind,$.View.observeWrapperForAttachedEventOnInstance);
      if(parent_class){
        klass._observers = {};
        for(var observer_name in parent_class._observers){
          klass._observers[observer_name] = parent_class._observers[observer_name];
        }
        klass.prototype._observers = {};
        $.View.wrapEventMethodsForChildClass(klass,parent_class);
      }
      $.extend(klass.prototype,methods || {});
      return klass;
      
    },
    isViewInstance: function isViewInstance(object){
      return object && object.getElement && object.getElement().nodeType == 1 && object.scope;
    },
    isViewClass: function isViewClass(object){
      return object && object.prototype && object.prototype.structure && object.prototype.setupScope;
    },
    arrayFrom: function arrayFrom(object){
      if(!object){
        return [];
      }
      var length = object.length || 0;
      var results = new Array(length);
      while(length--){
        results[length] = object[length];
      }
      return results;
    },
    wrapFunction: function wrapFunction(func,wrapper){
      return function wrapped(){
          return wrapper.apply(this,[$.proxy(func,this)].concat($.View.arrayFrom(arguments)));
      };
    },
    nodeInDomTree: function nodeInDomTree(node){
      var ancestor = node;
      while(ancestor.parentNode){
        ancestor = ancestor.parentNode;
      }
      return !!(ancestor.body);
    },
    wrapEventMethodsForChildClass: function wrapActiveEventMethodsForChildClass(child_class,parent_class){
      var methods = ['bind','unbind','bindOnce'];
      for(var i = 0; i < methods.length; ++i){
        (function method_wrapper_iterator(method_name){
          parent_class[method_name] = $.View.wrapFunction(parent_class[method_name],function method_wrapper(proceed){
            var arguments_array = $.View.arrayFrom(arguments).slice(1);
            child_class[method_name].apply(child_class,arguments_array);
            return proceed.apply(proceed,arguments_array);
          });
        })(methods[i]);
      }
    }
    observeWrapperForAttachedEventOnInstance: function observeWrapperForAttachedEventOnInstance(proceed,event_name){
      var arguments_array = $.View.arrayFrom(arguments).slice(1);
      var response = proceed.apply(proceed,arguments_array);
      if(event_name == 'attached'){
        $.View.triggerOrDelayAttachedEventOnInstance(this);
      }
      return response;
    },
    triggerOrDelayAttachedEventOnInstance: function triggerOrDelayAttachedEventOnInstance(instance){
      if(!instance._attachedEventFired && instance.element && $.View.nodeInDomTree(instance.element)){
        instance.trigger('attached');
        instance._attachedEventFired = true;
        if(instance._attachedEventInterval){
          clearInterval(instance._attachedEventInterval);
        }
      }else if(!('_attachedEventInterval' in instance)){
        instance._attachedEventInterval = setInterval(function(){
          if(instance.element && $.View.nodeInDomTree(instance.element)){
            instance.trigger('attached');
            instance._attachedEventFired = true;
            clearInterval(instance._attachedEventInterval);
            instance._attachedEventInterval = false;
          }
        },10);
      }
    }
  };
  
  $.View.classMethods = {
    getInstance: function getInstance(params){
      if(!this.instance){
        this.instance = new this(params || {});
      }
      return this.instance;
    },
    bind: function bind(){
      
    },
    bindOnce: function bindOnce(){
      
    },
    unbind: function unbind(){
      
    },
    trigger: function trigger(){
      
    }
  };
  
  $.View.instanceMethods = {
    initialize: function initialize(attributes){
      if($.View.logging){
        console.log('jQuery.View: initialized ',this,' with scope:',scope);
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
      this.trigger('initialized');
    },
    bind: $.View.classMethods.bind,
    bindOnce: $.View.classMethods.bindOnce,
    unbind: $.View.classMethods.unbind,
    trigger: function trigger(){
      
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
  
  $.View.Builder = {
    cache: {},
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
      if(typeof(argument) === 'function' && !$.View.isViewClass(argument)){
        argument = argument();
      }
      if($.View.isViewInstance(argument) || typeof(argument.getElement) == 'function'){
        elements.push(argument.getElement());
        return;
      }else if($.View.isViewClass(argument)){
        elements.push(new argument().getElement());
        return;
      }
      if(typeof(argument) === 'function'){
        argument = argument();
      }
      if(typeof(argument) !== 'string' && typeof(argument) !== 'number' && !(argument !== null && typeof argument === "object" && 'splice' in argument && 'join' in argument) && !(argument && argument.nodeType === 1)){
        for(attribute_name in argument){
          attributes[attribute_name] = argument[attribute_name];
        }
        return;
      }
      if(argument !== null && typeof argument === "object" && 'splice' in argument && 'join' in argument){
        for(ii = 0; ii < argument.length; ++ii){
          $.View.Builder.processNodeArgument(elements,attributes,argument[ii]);
        }
        return;
      }
      if((argument && argument.nodeType === 1) || typeof(argument) === 'string' || typeof(argument) === 'number'){
        elements.push(argument);
        return;
      }
    },
    createNode: function createNode(tag_name,attributes){
      attributes = attributes || {};
      tag_name = tag_name.toLowerCase();
      var element;
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
        if(!$.View.Builder.cache[tag_name]){
          $.View.Builder.cache[tag_name] = document.createElement(tag_name);
        }
        element = $.View.Builder.cache[tag_name].cloneNode(false);
      }
      $(element).attr(attributes);
      return element;
    },
    generateTagMethods: function generateTagMethods(){
      for(var t = 0; t < $.View.Builder.tags.length; ++t){
        (function tag_iterator(tag){
          //set function internally
          $.View.Builder[tag] = function node_generator(){
            var i, ii, argument, attributes, attribute_name, elements, element;
            elements = [];
            attributes = {};
            for(i = 0; i < arguments.length; ++i){
              $.View.Builder.processNodeArgument(elements,attributes,arguments[i]);
            }
            element = $.View.Builder.createNode(tag,attributes);
            for(i = 0; i < elements.length; ++i){
              if(elements[i] && elements[i].nodeType === 1){
                element.appendChild(elements[i]);
              }else{
                element.appendChild(document.createTextNode(String(elements[i])));
              }
            }
            return element;
          };
          //set on jQuery if it doesn't exist
          if(!(tag in $)){
            $[tag] = $.View.Builder[tag];
          }
        })($.View.Builder.tags[t]);
      }
    }
  };
  
  $.View.Builder.generateTagMethods();
  $.view = $.View.create;
})(jQuery);

MyView = $.view(function(){
  
},{
  
});