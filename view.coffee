#TODO: initialize should always mean: after: initialize when passed into extend

constructor = -> ->
  #console.log 'klass construct called'
  if @ instanceof arguments.callee
    @initialize.apply @, arguments
    @
  else
    console.log 'creating new class',arguments
    klass = View.clone()
    #console.log 'calling klass.extend.apply', arguments
    klass.extend.apply klass, arguments
    #console.log 'returning klass'
    #console.trace()
    klass

View = constructor()

View._methods = {}
View::_methods = {}

View.method = View::method = View._methods.method = View::_methods.method = (method_name,method) ->
  @_methods ||= {}
  @::_methods ||= {} if @::
  if arguments.length is 1
    for _method_name, method of method_name
      @method _method_name, method
  else
    @_methods[method_name] = @[method_name] = method
    @::_methods[method_name] = @::[method_name] = method if @::

extend_api =
  initialize: (@_initialize) ->
  publish: (path) -> #TODO
  route: (route) -> #TODO
  model: (model) -> @_model model
  collection: (collection) -> @_model collection
  on: (events) -> 
    for event_name, callback of events
      if event_name is 'change' and typeof callback is 'object'
        for _event_name, _callback of events.change
          @bind 'change:' + _event_name, _callback
      else
        @bind event_name, callback
  render: -> @render.apply @ arguments
  delegate: -> #TODO
  $: ($) -> @$ $
  register: (registers) -> @register registers
  before: (methods) -> @before methods
  after: (methods) -> @after methods
  logging: -> #TODO

View.method
  extend: ->
    @_mixin ||= []
    @::_mixin ||= [] if @::
    process_item = (key,value) ->
      @_mixin.push [key,value]
      @::_mixin.push [key,value] if @::
      if extend_api[key]
        extend_api[key].apply @, [value]
      else if typeof value is 'function'
        @method key, value
      else
        @[key] = value
        @::[key] = value if @::
    for argument in arguments
      if not is_view(argument) and typeof argument is 'function'
        @bind 'ready', argument
      else if argument
        if argument._mixin?
          for item in argument._mixin
            process_item.apply @, item
        else
          for key, value of argument
            process_item.apply @, [key,value]
            
  clone: ->
    #TODO
    #deep copy of delegates, attributes (but not model), and events
    if @::
      klass = constructor()
      klass.method = View.method
      klass.method @_methods
      klass.extend @_mixin
      klass
    else
      extend {}, @
    
  initialize: (model) ->
    @_model model
    if arguments.length > 1
      #console.log 'BEFORE', arguments, array_from(arguments)[1..]
      @extend.apply @, array_from(arguments)[1..]
    @render()
    @_initialize()
    @trigger 'ready'
  
  _model: (model) ->
    if model and not is_model model
      @attributes = {}
      @_escapedAttributes = {}
      @_changed = false
      @set model
    else if is_model model
      @attributes = model.attributes
      @model = model
    else if is_collection model
      @attributes = {}
      @collection = model
  
  _initialize: ->
  
  register: (extension,handler) ->
    if extension is '$'
      @_$ = handler
      @extend
        before:
          $: (args,next) ->
            $ = args[0]
            if handler.detect $
              callback = (selector) ->
                if is_element selector
                  @[0] = selector
                  @length = 1
                  extend callback, @[0]
                else if typeof selector is 'string'
                  handler.query selector, @[0]          
              @$ = callback
              @::$ = callback if @prototoype
            else
              next()
        after:
          tag: (args,response,next) ->
            next args, handler.extend response
    else
      @_extensions ||= {}
      @_extensions[extension] = (context,content) ->
        handler context, content
      
  render: ->
    @_extensions ||= {}
    if arguments.length is 0
      @$ @_render()
    else
      if typeof arguments[0] is 'function'
        @$ arguments[0].call @, if @model then @model.attributes else @attributes
      else
        if is_array arguments[0]
          [[extension,content]] = arguments
          content = content.call @ if typeof content is 'function'
        else if typeof arguments[0] is object
          for extension, content of arguments
            content = content.call @ if typeof content is 'function'
            break
        else if arguments.length is 2
          [extension,content] = arguments
        if not @_extensions[extension]
          @trigger 'error', extension + ' is not a registered template engine'
        else
        @$ = @_extensions[extension] @, content
          
  _render: ->
    @div()
    
  #data
  get: (key) ->
    if @model
      @model.apply.get @model, arguments
    else
      @attributes[key]
      
  set: (attributes,options) ->
    if @model
      @model.apply.set @model, arguments
    else
      options ||= {}
      return @ if not attributes
      attributes = attributes.attributes if attributes.attributes?
      now = @attributes
      for attribute, value of attributes
        if now[attribute] != value
          now[attribute] = value
          if not options.silent
            @_changed = true
            @trigger 'change:' + attribute, @, value, options
      @trigger 'change', @, options if not options.silent and @_changed
      @_changed = false
      attributes
  
  toJSON: ->
    if @model then @model.toJSON() else @attributes
  
  # events
  
  bind: (event_name,callback) ->
    calls = @_callbacks or @_callbacks = {}
    list = @_callbacks[event_name] or @_callbacks[event_name] = []
    list.push callback
    @
    
  unbind: (event_name,callback) ->
    @_callbacks = {} if not event_name
    calls = @_callbacks
    if not callback
      calls[event_name] = []
    else
      list = calls[event_name]
      return @ if not list
      for item, i in list
        if item is callback
          list.splice i, 1
          break
    @
    
  trigger: (event_name) ->
    calls = @_callbacks
    return @ if not calls
    if list = calls[event_name]
      item.apply @, Array::slice.call arguments, 1 for item in list
    if list = calls.all
      item.apply @, arguments for item in list
    @

  # DOM
  $: ($) -> @[0]
    
  callback: (method) ->
    args = array_from(arguments)[1..]
    context = @
    ->
      if typeof method is 'string'
        context[method].apply context, args
      else
        method.apply context, args
      false    
      
  # reflection
  before: (methods) ->
    if arguments.length is 2
      methods = []
      methods[argument[0]] = argument[1]
    for method_name, method of methods
      do (method_name,method) =>
        original = @[method_name]
        callback = =>
          args = array_from arguments
          next = =>
            args = arguments if arguments.length > 0
            original.apply @, args
          method.apply @, [args,next,original]
        @[method_name] = callback
        @::[method_name] = callback if @::  
  
  #after: (methods) ->
  #  if arguments.length is 2
  #    methods = []
  #    methods[argument[0]] = argument[1]
  #  for method_name, method of methods
  #    do (method_name,method) ->
  #      original = @[method_name]
        #callback = ->
        #  args = array_from arguments
        #  response = original.apply @, args
          #next = ->
          #  args = arguments if arguments.length > 0
          #  original.apply @, args
          #method.apply @, [args,next,original]
        #@[method_name] = callback
        #@::[method_name] = callback if @::  
  
# default error handler
View.bind 'error', (error) ->
  throw error

# mirror nodejs event api
View.method
  on: View.bind
  removeListener: View.unbind
  emit: View.trigger

# Builder
View.method tag: create_element = (tag_name) ->
  elements = []
  attributes = {}
  for argument in array_from(arguments)[1..]
    process_node_argument @, elements, attributes, argument
  tag_name = tag_name.toLowerCase()
  if ie and (attributes.name or (tag_name is 'input' && attributes.type))
    # ie needs these attributes to be written in the string passed to createElement
    tag = '<' + tag_name;
    if attributes.name
      tag += ' name="' + attributes.name + '"'
    if tag_name is 'input' and attributes.type
      tag += ' type="' + attributes.type + '"'
    tag += '>'
    delete attributes.name
    delete attributes.type
    element = document.createElement tag
  else
    if not cache[tag_name]
      cache[tag_name] = document.createElement tag_name
    element = cache[tag_name].cloneNode false
  write_attribute element, attributes
  for _element in elements
    if is_element _element
      element.appendChild _element
    else
      element.appendChild document.createTextNode String _element
  element

process_node_argument = (view,elements,attributes,argument) ->
  return if not argument? or argument is false
  if typeof argument is 'function'
    argument = argument()
  if is_view(argument) or is_$ argument.$
    return elements.push argument.$
  #is attributes?
  if typeof argument isnt 'string' and typeof argument isnt 'number' and not is_array(argument) and not is_$(argument) and not is_element(argument)
    for attribute_name, attribute of argument
      attributes[attribute_name] = attribute
    return
  if argument.toArray? and typeof argument.toArray is 'function'
    argument = argumen.toArray()
  if is_array argument
    flattened = array_flatten argument
    for flattened_argument in flattened
      process_node_argument view, elements, attributes, flattened_argument
    return
  if is_element(argument) or typeof argument is 'string' or typeof argument is 'number'
    elements.push argument

write_attribute = (element,name,value) ->
  attribute_translations =
    className: 'class'
    htmlFor:   'for'
  attributes = {}
  if typeof name is 'object'
    attributes = name
  else
    attributes[name] = if typeof value is 'undefined' then true else value
  for attribute_name of attributes
    name = attribute_translations[attribute_name] or attribute_name
    # check if things need to be remapped for IE (Some stuff has been fixed when IE > 7)
    if ie and ie_attribute_translations[name]
      if ie_attribute_translation_sniffing_cache[name]?
        name = ie_attribute_translations[name]
      else
        test_element = window.document.createElement 'div'
        test_element.setAttribute name, 'test'
        if test_element[ie_attribute_translations[name]] isnt 'test'
          test_element.setAttribute ie_attribute_translations[name], 'test'
          if ie_attribute_translation_sniffing_cache[name] = test_element[ie_attribute_translations[name]] is 'test'
            name = ie_attribute_translations[name]
    value = attributes[attribute_name]
    if value is false or not value?
      element.removeAttribute name
    else if value is true
      element.setAttribute name, name
    else if name is 'style'
      element.style.cssText = value
    else
      element.setAttribute name, value
  element

ie = !!(window.attachEvent and not window.opera)

ie_attribute_translations =
  class: 'className'
  checked: 'defaultChecked'
  usemap: 'useMap'
  for: 'htmlFor'
  readonly: 'readOnly'
  colspan: 'colSpan'
  bgcolor: 'bgColor'
  cellspacing: 'cellSpacing'
  cellpadding: 'cellPadding'
  
ie_attribute_translation_sniffing_cache = {}

cache = {}

supported_events = 'blur focus focusin focusout load resize scroll unload click dblclick
	mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave
	change select submit keydown keypress keyup error'.split /\s+/m

supported_html_tags = 'a abbr acronym address applet area b base basefont bdo big blockquote body
  br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset
  font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex
  kbd label legend li link menu meta nobr noframes noscript object ol optgroup option p
  param pre q s samp script select small span strike strong style sub sup table tbody td
  textarea tfoot th thead title tr tt u ul var
  article aside audio command details figcaption figure footer header hgroup keygen mark
  meter nav output progress rp ruby section source summary time video'.split /\s+/m

attribute_map =
  htmlFor: 'for'
  className: 'class'

generate_builder_method = (tag_name) -> ->
  args = [tag_name];
  args.push argument for argument in arguments
  @tag.apply @, args
      
for tag in supported_html_tags
  View.method tag, generate_builder_method tag

#support
extend = (destination,source) ->
  for key, value of source
    destination[key] = value
  destination

is_view = (object) ->
  object and object.$ and object.render

is_model = (object) ->
  object and object.get and object.set and object.trigger and object.bind

is_collection = (object) ->
  object and object.add and object.remove

is_array = (array) ->
  Object::toString.call array is '[object Array]'

is_element = (element) ->
  element and element.nodeType is 1 or element.nodeType is 2

is_$ = ($) -> 
  $? and $ and (($.nodeType) or ($[0] and $[0].nodeType))

wrap_function = (func,wrapper) -> ->
  wrapper.apply @, [proxy func, @].concat array_from arguments

node_in_dom_tree = (node) ->
  ancestor = node
  while ancestor.parentNode
    ancestor = ancestor.parentNode
  !!ancestor.body

proxy = (func,object) ->
  return func if object is undefined
  if arguments.length < 3
    ->
      func.apply object, arguments
  else
    args = array_from arguments
    args.shift()
    args.shift()
    ->
      func.apply object, args.concat array_from arguments

array_without_value = (array) ->
  response = []
  values = array_from(arguments)[1..]
  for item in array
    response.push item if not (in_array(item,values) > -1)
  response

array_flatten = (array) ->
  flattened = []
  for item in array
    if is_array item
      flattened = flattened.concat array_flatten item
    else
      flattened.push item
  flattened

array_from = (object) ->
  return [] if not object
  length = object.length or 0
  results = new Array length
  while length--
    results[length] = object[length]
  results

exports = if module?.exports? then module.exports else window
exports.View = View

# jQuery Plugin
View.register
  $:
    detect: (object) -> jQuery? and object is jQuery
    query: (selector,context) -> jQuery selector, context
    extend: (element) -> jQuery element
    delegate: (context,selector,event_name) -> jQuery(context).delegate selector, event_name, callback

# Prototype Plugin
View.register
  $:
    detect: (object) -> Prototype? and object is Prototype
    query: (selector,context) -> context.getElementsBySelector selector
    extend: (element) -> Element.extend element
    delegate: (context,selector,event_name) -> 
      
# render html
View.register
  html: (context,html) ->
    div = create_element 'div'
    div.innerHTML = html
    array_from div.childNodes