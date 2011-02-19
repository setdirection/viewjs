constructor = -> ->
  if typeof @ is not 'function'
    @_initialize arguments[0]
    @initialize()
  else
    klass = View.clone()
    klass.extend.apply klass, arguments
    klass   

View = constructor()

View.method = View.prototype.method = (method_name,callback) ->
  if arguments.length is 1
    for key, callback of method_name
      @[key] = callback
      @prototype[key] = callback if @prototype
  else
    @[method_name] = callback
    @prototype[method_name] = callback if @prototype
  
View.method extend: ->
  for argument in arguments
    if typeof argument is 'function'
      @bind 'ready', argument
    else
      for key, value of argument
        if extend_api and extend_api[key]
          extend_api[key].apply @, [value]
        else if typeof value is 'function'
          @method key, value
        else
          @[key] = value
          @prototype[key] = value if @prototype

View.extend
  clone: ->
    if @prototype
      klass = constructor()
      for key of @prototype
        klass[key] = klass.prototype[key] = @prototype[key]
      klass
    else
      extend {}, @
    
  _initialize: (model) ->
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
      item.apply @, Array.prototype.slice.call arguments, 1 for item in list
    if list = calls.all
      item.apply @, arguments for item in list
    @
    
# reflection
  before: (methods) ->
    if arguments.length is 2
      methods = []
      methods[argument[0]] = argument[1]
    for method_name, method of methods
      do (method_name,method) ->
        original = @[method_name]
        callback = ->
          args = array_from arguments
          next = ->
            original.apply @, args
          method.apply @, [args,next]
        @[method_name] = callback
        @prototype[method_name] = callback if @prototype
      
  after: (methods) ->
    if arguments.length is 2
      methods = []
      methods[argument[0]] = argument[1]
    for method_name, method of methods
      do (method_name,method) ->
        original = @[method_name]
        callback = ->
          args = array_from arguments
          next = ->
            original.apply @, args
          method.apply @, [args,next]
        @[method_name] = callback
        @prototype[method_name] = callback if @prototype
  
extend_api = 
  publish: (path) -> #TODO
  route: (route) -> #TODO
  model: (model) -> @_initialize model
  collection: (collection) -> @_initialize collection
  on: (events) -> 
    for event_name, callback of events
      if event_name is 'change' and typeof of callback is 'object'
        for _event_name, _callback of events.change
          @bind 'change:' + _event_name, _callback
      else
        @bind event_name, callback
  render: -> #TODO
  delegate: -> #TODO
  $: -> #TODO
  before: (methods) -> @before methods
  after: (methods) -> @after methods
  logging: -> #TODO

# mirror nodejs event api
View.method
  on: View.bind
  removeListener: View.unbind
  emit: View.trigger

# Builder
create_element = (tag_name) ->
  elements = []
  attributes = {}
  for argument in arguments
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
  if is_view argument or is_$ argument.$
    return elements.push argument.$
  #is vanilla object?
  if typeof argument isnt 'string' and typeof argument isnt 'number' and not is_array argument and not is_$ argument and not is_element argument
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
  if is_element argument or typeof argument is 'string' or typeof argument is 'number'
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

ie = !!(window.attachEvent and not global_context.opera)

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

supported_html_tags = 'a abbr acronym address applet area b base basefont bdo big blockquote body
  br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset
  font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex
  kbd label legend li link menu meta nobr noframes noscript object ol optgroup option p
  param pre q s samp script select small span strike strong style sub sup table tbody td
  textarea tfoot th thead title tr tt u ul var
  article aside audio command details figcaption figure footer header hgroup keygen mark
  meter nav output progress rp ruby section source summary time video'.split /\s+/

attribute_map =
  htmlFor: 'for'
  className: 'class'

generate_builder_method = (tag_name) -> ->
  args = [tag_name];
  args.push argument for argument in arguments
  create_element.apply @, args
      
for tag in supported_html_tags
  View.method tag, generate_builder_method tag

#support
extend = (destination,source) ->
  for key, value of source
    destination[key] = value
  destination

is_model = -> #TODO
  false

is_collection = -> #TODO
  false

is_view = -> #TODO
  false

is_array = (array) ->
  Object.prototype.toString.call array is '[object Array]'

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
    args.shift();
    args.shift();
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

escape_html = (string) ->
  string.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

exports = if module?.exports? then module.exports else window
exports.View = View