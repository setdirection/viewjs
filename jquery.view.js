(function($){
  
  $.View = {
    isActiveViewInstance: function isViewInstance(object){
      return object && object.getElement && object.getElement().nodeType == 1 && object.scope;
    },
    isActiveViewClass: function isViewClass(object){
      return object && object.prototype && object.prototype.structure && object.prototype.setupScope;
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
})(jQuery);