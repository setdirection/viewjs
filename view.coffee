# Support
#########
extend = (destination,source) ->
  for key, value of source
    destination[key] = value
  destination

is_view = (object) ->
  Boolean(object and object.element and object.render)

is_model = (object) ->
  Boolean(object and object.get and object.set and object.trigger and object.bind)

is_collection = (object) ->
  Boolean(object and object.add and object.remove and object.trigger and object.bind)

is_array = (array) ->
  Boolean(array and Object::toString.call(array) is '[object Array]')

is_element = (element) ->
  Boolean(element?.nodeType is 1 or element?.nodeType is 2)

is_$ = ($) -> 
  Boolean($?[0] and $?[0]?.nodeType and $.length?)

wrap_function = (func,wrapper) -> ->
  wrapper.apply @, [proxy func, @].concat array_from arguments

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

# Class & Mixin System
######################  
View =
  extend: ->
    @extend.api ||= {}
    @_mixin ||= []
    process_item = (key,value) ->
      should_add = true
      discard = ->
        should_add = false
      if key is 'extend'
        for _key of value
          @extend.api[_key] = value[_key]
      else
        if @extend.api[key]
          @extend.api[key].apply @, [value,discard]
        else
          @[key] = value
      if should_add
        @_mixin.push [key,value]
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

View.extend
  stack: (commands) ->
    @_stack ||= {}
    for method_name of commands
      if not @[method_name]
        @_stack[method_name] =
          complete: ->
          stack: []
        @[method_name] = ->
          _stack = array_from @_stack[method_name].stack
          step = ->
            (_stack.shift() || @_stack[method_name].complete).apply @, array_from(arguments).concat [proxy(step, @)]
          step.apply @, array_from arguments
      for command_name, callback of commands[method_name]
        switch command_name
          when 'complete' then @_stack[method_name].complete = callback
          when 'add' then @_stack[method_name].stack.push callback
          when 'clear' then @_stack[method_name].stack = []

View.extend extend:
  stack: (commands) ->
    @stack commands

View.extend
  create: ->
    return @clone() if arguments.length is 0
    created_views = {}
    for class_name, mixins of arguments[0]
      @trigger 'warning', class_name + ' already exists, overwriting.' if ViewManager.views[class_name]?
      ViewManager.views[class_name] = created_views[class_name] = @clone()
      #add route if it exists in routing table
      for path, _class_name of routes
        if _class_name is class_name
          ViewManager.views[class_name].extend route: path
      #process mixins passed to create()
      if is_array mixins
        created_views[class_name].extend mixin for mixin in mixins
      else
        created_views[class_name].extend mixins
    created_views
    
  clone: ->
    klass = {}
    klass.extend = @extend
    klass.extend.api = {}
    klass.attributes = {}
    klass._changed = false
    klass._ready = false
    #deep copy events
    klass._callbacks = {}
    klass.extend @
    klass.element()
    klass

# Initialize
############
View.extend stack:initialize:add: (args...,next) ->
  return if @_initialized?
  @_initialized = true
  @_initialize_callback = args[0] if args[0]
  next()

View.extend stack:initialize:complete: ->
  @render()
  @_initialize_callback.call @ if @_initialize_callback
  @trigger 'initialize', arguments...

View.extend extend:initialize: (callback) ->
  @stack initialize:add: callback

# Dependents
############
View.extend extend:views: (dependents) ->
  caller = @
  for dependent in dependents
    do (dependent) ->
      caller.extend stack:initialize:add: (args...,next) ->
        view = ViewManager dependent
        view.bind ready: ->
          caller[dependent] = view
          next.apply next, args
        view.initialize()
  
# Events
########
View.extend
  bind: (event_name,callback) ->
    if arguments.length is 1 and typeof event_name is 'object'
      for _event_name, _callback of event_name
        @bind _event_name, _callback
    else
      @_callbacks ||= {}
      @_callbacks[event_name] ||= []
      @_callbacks[event_name].push callback if not (callback in @_callbacks[event_name])
      callback.call @ if event_name is 'ready' and @_ready
    @

  unbind: (event_name,callback) ->
    @_callbacks = {} if not event_name
    calls = @_callbacks
    if not callback
      @_callbacks[event_name] = []
    else
      return @ if not @_callbacks[event_name]
      for item, i in @_callbacks[event_name]
        if item is callback
          @_callbacks[event_name].splice i, 1
          break
    @

  trigger: (event_name) ->
    calls = @_callbacks
    return @ if not @_callbacks
    if @_callbacks[event_name]
      item.apply @, Array::slice.call arguments, 1 for item in @_callbacks[event_name]
    if @_callbacks.all
      item.apply @, arguments for item in @_callbacks.all
    @

  ready: ->
    @bind.apply @, ['ready'].concat array_from arguments
    # mirror nodejs event api

View.extend
  on: View.bind
  removeListener: View.unbind
  emit: View.trigger

bind_extend_handler = (events) ->
  for event_name, callback of events
    if event_name is 'change' and typeof callback is 'object'
      for _event_name, _callback of events.change
        @bind 'change:' + _event_name, _callback
    else
      @bind event_name, callback
      
View.extend extend:bind: bind_extend_handler
View.extend extend:on: bind_extend_handler

# default error handler
View.bind 'warning', (warning) ->
  console.log.apply console, ['ViewJS warning: '].concat array_from arguments if console?.log?

View.bind 'error', (error) ->
  console.log.apply console, ['ViewJS error: '].concat array_from arguments if console?.log?
  throw error

# Environments
##############
environments = {}

View.extend
  env: (envs) ->
    if arguments.length is 2
      [env_name, callback] = arguments
      if not environments[env_name]?
        environments[env_name] = callback
      else if environments[env_name]()
        callback.call @
    else
      for env_name, callback of envs
        @env env_name, callback

View.env
  server: ->
    process? and require? and global? and module?
  client: ->
    window? and window.document?
  browser: ->
    not (process? and require? and global? and module?)

View.extend extend:env: (envs) ->
  for env_name, args of envs
    if environments[env_name]()
      if typeof args is 'function'
        response = args()
        @extend response if response
      else
        @extend args

# DOM
#####
set_element = (element) ->
  @length = 1
  @[0] = element
  extend @$, @_$ @[0] if @_$

delegate_events = (events,element) ->
  return if not (events || (events = @_delegatedEvents))
  @trigger 'error', 'No DOM library the supports delegate() available' if not @_$?.fn?.delegate?
  @_$(element).unbind()
  for key, method_name of events[key]
    [event_name,selector] = key.match /^(\w+)\s*(.*)$/
    method = proxy @[method_name],@
    if selector is ''
      @_$(element).bind event_name, method
    else
      @_$(element).delegate selector, event_name, method

View.extend
  element: ->
    @[0] || set_element.call @, @document.createElement 'div'
    
  $: (dom_library) ->
    if arguments.length is 1 and ((jQuery? and dom_library is jQuery) or (Zepto? and dom_library is Zepto))
      @_$ = dom_library
    else if arguments.length is 1 and typeof dom_library is 'string'
      selector = dom_library
      if not @_$?
        @trigger 'error', 'No DOM library is available in the View'
      else
        @_$ selector, @[0]
    else
      @_$
    
  callback: (method) ->
    args = array_from(arguments)[1..]
    context = @
    ->
      if typeof method is 'string'
        context[method].apply context, args
      else
        method.apply context, args
      false
  
  delegate: (events) ->
    @_delegatedEvents = events
    delegate_events.call @, events

View.extend extend:
  element: (generator) ->
    @element = ->
      set_element.call @, generator.call @

  delegate: (events) ->
    @delegate events
    
  $: ($) ->
    @$ $
    
#setup the document element
View.extend env:client: ->
  document: window.document

# Routing
#########
routes = {}
routing_initialized = false

View.extend stack:route:add: (params,next) ->
  params = params_from_route_and_path @_route, params if typeof params is 'string'
  @set params
  callback = ->
    @unbind 'render', callback
    sibling.style.display = 'none' for sibling in siblings @[0]  
    @[0].style.display = null
    next(params)
  @bind 'render', callback

View.extend extend:route: (route) ->
  @_route = route

View.extend extend:routes: (_routes,discard) ->
  if not routing_initialized
    routing_initialized = true
    routes = _routes
    for route, view of _routes
      if ViewManager.views[view]?
        ViewManager view, (instance) ->
          instance.extend route: route
    create_router()
    View.env browser: ->
      setTimeout -> Backbone.history.start()
  discard()

named_param = /:([\w\d]+)/g
splat_param = /\*([\w\d]+)/g

create_router = ->
  router = new Backbone.Controller
  for path, view of routes
    do (path,view) ->
      router.route path, view, ->
        ordered_params = array_from arguments
        ViewManager view, (instance) ->
          instance.route params_from_ordered_params_and_path ordered_params, path

params_from_ordered_params_and_path = (ordered_params,path) ->
  params = {}
  keys = keys_from_path path
  for key, i in keys
    params[key] = ordered_params[i]
  params

params_from_route_and_path = (route,path) ->
  matcher = new RegExp '^' + route.replace(named_param,"([^\/]*)").replace(splatParam, "(.*?)") + '$'
  ordered_params = matcher.exec path
  params_from_ordered_params_and_path ordered_params, path
      
keys_from_path = (path) ->
  keys = []
  path
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, (_, slash, format, key, capture, optional) ->
      keys.push key
    )
  keys

siblings = (element) ->
  first = element.parentNode.firstChild
  response = []
  sibling = element
  while sibling = sibling.nextSibling
    response.push sibling if sibling.nodeType is 1 and sibling isnt element
  response

# Data
######
View.extend extend:defaults: (defaults) ->
  @set defaults, silent: true

View.extend
  _model: (model) ->
    if is_model model
      @attributes = model.attributes
      @model = model
      @model.bind 'all', => @trigger.apply @, arguments
    else
      @trigger 'error', 'The model object passed is not a valid model.'

  _collection: (collection) ->
    if is_collection collection
      @collection = collection
      @collection.bind 'all', => @trigger.apply @, arguments
      @bind add: (model) ->
        @_elements[model.cid] = @_render(model)
        @[0].insertBefore @_elements[model.cid], (@[0].childNodes[@collection.models.indexOf(model)] || null)
      @bind remove: (model) ->
        @[0].removeChild @_elements[model.cid] if @_elements[model.cid]
      @bind refresh: @render
    else
      @trigger 'error', 'The collection object passed is not a valid collection.'
  
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
    if @model
      @model.toJSON()
    else if @collection
      @collection.toJSON()
    else
      @attributes

View.extend extend:model: (model) ->
  @_model model

View.extend extend:collection: (collection) ->
  @_collection collection

# Metaprogramming
#################
View.extend
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

View.extend extend:before: (methods) ->
  @before methods

# Templates
###########
cache = {}
View.extend extend:cache: (_cache,discard) ->
  cache = _cache
  discard()

View.extend
  _render: ->
  render: (options) ->
    options ||= {}
    options.update = true if not options.update?
    if @collection?
      @_elements = {}
      element = @collection.map (model) ->
        @_elements[model.cid] = @_render model
      , @
    else
      element = @_render if @model then @model.attributes else @attributes
    return element if not options.update
    if element
      if not is_element(element) and not is_array element
        @trigger 'error', 'render() did not return an element or array, returned ' + typeof element
      @[0].innerHTML = ''
      element = [element] if not is_array element
      @[0].appendChild _element for _element in element
    if not @_ready
      @_ready = true
      @trigger 'ready', element
    @trigger 'render', element

View.extend extend:render: (filename) ->
  if typeof filename is 'string'
    callback = (context) ->
      extension = filename.split('.').pop()
      @trigger 'error', extension + ' is not a registered template engine' if not render_engines[extension]
      @trigger 'error', 'Template ' + filename + ' not found' if not cache[extension][filename]
      cache()[extension][filename](context)
  else
    callback = filename
  @_render = callback

# Builder
#########
tag = (tag_name) ->
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
    element = @document.createElement tag
  else
    if not element_cache[tag_name]
      element_cache[tag_name] = @document.createElement tag_name
    element = element_cache[tag_name].cloneNode false

  #write_attribute
  for attribute_name of attributes
    name = attribute_translations[attribute_name] or attribute_name
    # check if things need to be remapped for IE (Some stuff has been fixed when IE > 7)
    if ie and ie_attribute_translations[name]
      if ie_attribute_translation_sniffing_cache[name]?
        name = ie_attribute_translations[name]
      else
        test_element = @document.createElement 'div'
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
  # end write attribute

  for _element in elements
    if is_element _element
      element.appendChild _element
    else
      element.appendChild @document.createTextNode String _element
  element
  
View.extend tag: ->
  tag.apply @, arguments

process_node_argument = (view,elements,attributes,argument) ->
  return if not argument? or argument is false
  if typeof argument is 'function'
    argument = argument.call view
  if is_view argument
    return elements.push argument[0]
  if is_$ argument
    return elements.push _element for _element in argument
  if is_element argument
    return elements.push argument
  #is attributes?
  if typeof argument isnt 'string' and typeof argument isnt 'number' and not is_array(argument) and not is_$(argument) and not is_element(argument)
    for attribute_name, attribute of argument
      attributes[attribute_name] = attribute
    return
  if argument.toArray? and typeof argument.toArray is 'function'
    argument = argument.toArray()
  if is_array argument
    flattened = array_flatten argument
    for flattened_argument in flattened
      process_node_argument.call view, elements, attributes, flattened_argument
    return
  if is_element(argument) or typeof argument is 'string' or typeof argument is 'number'
    elements.push argument

ie = window? && !!(window.attachEvent and not window.opera)

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

attribute_translations =
  className: 'class'
  htmlFor:   'for'

element_cache = {}

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

Builder = {}
for tag_name in supported_html_tags
  do (tag_name) ->
    Builder[tag_name] = ->
      tag.apply @, [tag_name].concat array_from arguments    

# ViewManager
#############
ViewManager = ->
  callback = arguments[arguments.length - 1] if typeof arguments[arguments.length - 1] is 'function'
  if is_array(arguments[0]) or arguments.length > 1 or typeof arguments[0] is 'string'
    response = []
    for class_name in array_flatten array_from arguments
      if typeof class_name is 'string'
        View.trigger 'error', "#{class_name} has not been created." if not ViewManager.views[class_name]?
        response.push ViewManager.views[class_name]
    callback.apply callback, response if callback
    if response.length is 1 and typeof arguments[0] is 'string' then response[0] else response
  else
    response = {}
    for class_name, _callback of arguments[0]
      View.trigger 'error', "#{class_name} has not been created." if not ViewManager.views[class_name]?
      response[class_name] = ViewManager.views[class_name]
      _callback.call response[class_name], response[class_name]
    callback.apply callback, [response] if callback
    response
  
ViewManager.views = {}
ViewManager.create = proxy View.create, View
ViewManager.extend = proxy View.extend, View
ViewManager.env = proxy View.env, View
ViewManager.route = proxy View.route, View

# Export
########
if window?
  window.View = ViewManager
  window.Builder = Builder
  
if module?.exports?
  module.exports.View = ViewManager
  module.exports.Builder = Builder