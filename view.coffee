#ISSUES:
#Finish template refactor
#Finish route / server refactor
# @$ Everything should reflect that @element is now always available
#routes maybe hides all of the siblings of @element ?
# routes expressed as a form of model, to the constructor?
# ensure key/binding collisions are difficult
# maybe:
# route:
#   '/': () ->
#   '/whatever': -> @refresh()

# Class & Mixin System
######################
constructor = -> ->
  if @ instanceof arguments.callee
    @initialize.apply @, arguments
    @
  else
    throw 'View called as a constructor without the "new" keyword.'

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

# middleware methods have properties
# complete
# add
View.method middleware: -> (method_name,callbacks...) ->
  if arguments.length is 1 and typeof arguments[0] is 'object'
    for _method_name, callback of method_name
      @middleware.apply @[method_name].concat callbacks
  else
    callback = ->
      stack = array_from callbacks
      step = ->
        (stack.shift() || callback._complete).apply @, array_from(arguments).concat [proxy(step, @)]
      step.apply @, array_from arguments
    callback.complete = (complete_callback) ->
      @::[method_name].complete complete_callback if @::?[method_name]?.complete #TODO, can remove if test shows that callback in @:: is the same object
      callback._complete = complete_callback
    callback.complete ->
      @trigger.apply @, [method_name].concat array_from arguments
    callback.add = proxy (add_callback) ->
      @::[method_name].add callback if @::?[method_name]?.add #TODO, can remove if test shows that callback in @:: is the same object
      if is_array callback
        callbacks.push _callback for _callback in array_flatten callback
      else
        callbacks.push callback
    , @
    callback.clear = ->
      callbacks = []
    @method method_name, callback  

View.method
  create: ->
    klass = @clone()
    klass.extend.apply klass, arguments
    klass

  clone: ->
    #TODO
    #deep copy of delegates, attributes (but not model), and events, and envs
    if @::
      klass = constructor()
      klass.method = View.method
      klass.method @_methods
      @trigger 'clone', klass
      klass.extend @ # will look for _mixin and process automatically
      klass
    else
      extend {}, @

  extend: ->
    @extend.api ||= {}
    @_mixin ||= []
    @::_mixin ||= [] if @::
    process_item = (key,value) ->
      if key is 'extend'
        for _key of value[key]
          @extend.api[_key] = value[key][_key]
          @::extend.api[_key] = value[key][_key] 
      else
        @_mixin.push [key,value]
        @::_mixin.push [key,value] if @::
        if @extend.api[key]
          @extend.api[key].apply @, [value]
        else if typeof value is 'function'
          @method key, value
        else
          @[key] = value
          @::[key] = value if @::
    for argument in arguments
      if not is_view(argument) and typeof argument is 'function'
        @bind 'render', argument
      else if argument
        if argument._mixin?
          for item in argument._mixin
            process_item.apply @, item
        else
          for key, value of argument
            process_item.apply @, [key,value]

# Initialize
############
View.middleware 
  initialize: (model,mixins...,next) ->
    @extend.apply @, mixins if mixins.length > 1
    @_model model || {}
    @element()
    next(model || {})

View.initialize.complete = View::initialize.complete = ->
  @render()
  @trigger 'initialize', arguments...

View.extend
  initialize: (callback) ->
    @initialize.add callback

# Environments
##############
View.method
  env: (envs) ->
    @_envs ||= {}
    @::_envs ||= {} if @::
    if arguments.length is 2
      [env_name, callback] = arguments
      if not @_envs[env_name]?
        @_envs[env_name] = callback
        @::_envs[env_name] = callback if @::
      else if @_envs[env_name]()
        callback.call @
    else
      for env_name, callback of envs
        @env env_name, callback

View.env
  server: ->
    not window?
  client: ->
    window? and window.document?

View.bind clone: (klass) ->
  klass.env @_envs

View.extend extend:
  env: (envs) ->
    for env_name, args of envs
      if !envs[env_name]
        envs[env_name] = args
      else
        if envs[env_name]()
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

View.method
  element: ->
    @[0] || set_element @document.createElement 'div'
    
  $: (dom_library) ->
    if arguments.length is 1 and ((jQuery? and dom_library is jQuery) or (Zepto? and dom_library is Zepto))
      @_$ = dom_library
      @::_$ = dom_library if @::
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

View.extend extend:
  element: (generator) ->
    @method element: ->
      set_element generator.call @

  delegate: ->
    #TODO
    
  $: ($) ->
    @$ $
    
#setup the document element
View.extend
  env:
    client: ->
      document: window.document
    server: ->
      document: create_document()

# Routing
#########
View.extend extend:
  route: (route) ->
    #TODO refactor, maybe use @trigger
    @env
      server: ->
        if not @server
          @extend server: {}
        @server.get route, (request,response) =>
          response.send @document.toString(@server.public)
      client: ->

# Data
######
View.method
  _model: (model) ->
    if model and not is_model model
      @attributes = {}
      @_changed = false
      @set model
    else if is_model model
      @attributes = model.attributes
      @model = model
      @model.bind 'all', => @trigger.apply @, arguments
    else if is_collection model
      @attributes = {}
      @collection = model
      @model.bind 'all', => @trigger.apply @, arguments
  
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

View.extend extend:
  model: (model) ->
    @_model model
  
  collection: (collection) ->
    @_model collection

# Events
########
View.method
  bind: (event_name,callback) ->
    if arguments.length is 1 and typeof event_name is 'object'
      for _event_name, _callback of event_name
        @bind _event_name, _callback
    else
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

# mirror nodejs event api
View.method
  on: View.bind
  removeListener: View.unbind
  emit: View.trigger

View.extend extend:
  bind: (events) ->
    for event_name, callback of events
      if event_name is 'change' and typeof callback is 'object'
        for _event_name, _callback of events.change
          @bind 'change:' + _event_name, _callback
      else
        @bind event_name, callback

View.extend extend:
  on: View.extend.api.bind

# default error handler
View.bind 'error', (error) ->
  throw error

# Metaprogramming
#################
View.method
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

View.extend extend:
  before: (methods) ->
    @before methods

# Templates
###########
View.middleware
  render: []

View.render.complete (element) ->
  @[0].innerHTML = ''
  element = [element] if not is_array element
  @[0].appendChild _element for _element in element
  @trigger 'render', element

View.extend extend:
  render: (filename) ->
    if typeof filename is 'string'
      callback = (args...,next) ->
        next render_template.call @, filename
    else
      callback = filename
    @render.add callback

View._renderCache = {}
render_engines = {}
render_cache_src = {} #server only

render_template = (filename) ->
  context = if @model then @model.attributes else @attributes
  extension = filename.split('.').pop()
  if not render_engines[extension]
    @trigger 'error', extension + ' is not a registered template engine'
  else
    if View._renderCache[extension][filename]
      response = View._renderCache[extension][filename](context)
    else 
      source = String require('fs').readFileSync(@server.public + filename)
      compiled = render_engines[extension](source,filename)
      response = compiled(context)
    response

serialize_render_cache = ->
  output = "{"
  for engine of render_cache_src
    output += engine + ':{'
    for filename, contents of render_cache_src[engine]
      output += "'" + filename + "':" + contents + ','
    output = output.replace(/,$/,'') + '},'
  output = output.replace(/,$/,'') + '}'

child_nodes_from_html = "(function(html){
  var div = View.document.createElement('div');
  div.innerHTML = html;
  return div.childNodes.length === 1 ? div.childNodes[0] : div.childNodes;'
})"
engine_callback_prefix = "(function(___obj){return #{child_nodes_from_html}(("
engine_callback_suffix = ')(___obj))})'

render_engines.html = (content,filename) ->
  render_cache_src.html ||= {}
  content = content.replace(/\\/g,'\\\\').replace(/\'/g,'\\\'')
  callback = new Function "context", "return #{child_nodes_from_html}('#{content}');"
  render_cache_src.html[filename] = callback.toString()
  callback

View.env server: ->
  render_engines.jade = (content,filename) ->
    render_cache_src.jade ||= {}
    output = require('jade').compile(content).toString()
    output = engine_callback_prefix + output + engine_callback_suffix
    render_cache_src.jade[filename] = output
    eval output

  render_engines.eco = (content,filename) ->
    render_cache_src.eco ||= {}
    output = require('eco').compile content
    output = output.replace /module.exports = /, engine_callback_prefix
    output = output.replace /;$/, engine_callback_suffix
    render_cache_src.eco[filename] = output
    eval output

# Server
########
Server =
  extend:
    server: (server) ->
      @env server: ->
        if is_server server
          servers[Number server.address().port] = server if !servers[Number server.address().port]
          @server = server
        else
          server.port ||= 80
          @server = servers[server.port] ||= create_server server
        @::server = @server if @::

    javascripts: ->
      scripts = arguments
      @env server: ->
        @document.javascripts.apply @document, scripts

    stylesheets: ->
      styles = arguments
      @env server: ->
        @document.stylesheets.apply @document, styles

servers = {}

create_server = (params) ->
  express = require 'express'
  port = Number params.port
  server = servers[port] = express.createServer()
  public = params.public || './public' 
  server.use express.methodOverride()
  server.use express.bodyDecoder()
  server.use express.cookieDecoder()
  server.use server.router
  server.use express.logger()
  if public
    server.use express.staticProvider public
    server.public = public
  server.listen port
  console.log "ViewJS + Express Server listening on port " + port
  server

is_directory = (dir) ->
  require('fs').statSync(dir).isDirectory()

files_with_extension = (dir,extension) ->
	fs = require 'fs'
	paths = []
	try
	  fs.statSync dir
	catch e
	  return []
	traverse = (dir,stack) ->
		stack.push dir
		fs.readdirSync(stack.join '/').map (file) ->
			path = stack.concat([file]).join '/'
			stat = fs.statSync path
			return if file[0] is '.' or file is 'vendor'
			paths.push path if stat.isFile() and extension.test file
			traverse file, stack if stat.isDirectory()
		stack.pop()
	traverse dir || '.', []
	paths

create_document = ->
  {jsdom} = require 'jsdom'
  document = jsdom '<html><head></head><body></body></html>'
  window = document.createWindow()
  window.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
  window.View = View
  window.document.implementation.addFeature 'FetchExternalResources', ['script']
  window.document.implementation.addFeature 'ProcessExternalResources', ['script']
  window.document.implementation.addFeature 'MutationEvents', ['1.0']

  document.javascripts = ->
    return @_javascripts if arguments.length is 0
    @_javascripts = [] if !@_javascripts
    _scripts = array_flatten array_from arguments
    scripts = []
    i = 0
    add_script = =>
      @_javascripts.push scripts[i]
      tag = @createElement 'script'
      tag.type = 'text/javascript'
      tag.src = scripts[i]
      if i < scripts.length
        tag.onload = add_script
        @head.appendChild tag
        ++i
      else
        ;#TODO: callback?
    should_add = (script) =>
      not (script in scripts) and not (script in @_javascripts) and script isnt __filename
    for script in _scripts
      if is_directory script
        files_with_extension(script, /\.js$/).map (script) =>
          scripts.push script if should_add script
      else
        scripts.push script if should_add script
    add_script()

  document.stylesheets = ->
    return @_stylesheets if arguments.length is 0
    styles = array_flatten array_from arguments
    @_stylesheets = [] if !@_stylesheets
    add_style = (style) =>
      if not (style in @_stylesheets)
        @_stylesheets.push style
        tag = @createElement 'link'
        tag.rel = 'stylesheet'
        tag.type = 'text/css'
        tag.href = style
        @head.appendChild tag
    for style in styles
      if is_directory style
        files_with_extension(style, /\.css$/).map add_style
      else
        add_style style

  document.toString = (base) ->
    output = @documentElement.innerHTML
    script_fragment = 'script type="text/javascript" src="'
    style_fragment = 'link rel="stylesheet" type="text/css" href="'
    script_regexp = new RegExp script_fragment + base, 'g'
    style_regexp = new RegExp style_fragment + base, 'g'
    output = output.replace script_regexp, script_fragment + '/'
    output = output.replace style_regexp, style_fragment + '/'
    output = output.replace(/<head>/,'<head><' + script_fragment + '/' + __filename.substring(base.length) + '"></script><script type="text/javascript">View._renderCache = ' + serialize_render_cache() + ';</script>')
    """
      <!DOCTYPE html>
      <html>
        #{output}
      </html>
    """

  document

# Builder
#########
Builder =
  tag: (tag_name) ->
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

for tag in supported_html_tags
  do (tag) =>
    Builder[tag] = ->
      args = [tag]
      args.push argument for argument in arguments
      @tag.apply @, args

process_node_argument = (view,elements,attributes,argument) ->
  return if not argument? or argument is false
  if typeof argument is 'function'
    argument = argument()
  if is_view argument
    return elements.push argument.element()
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
      process_node_argument view, elements, attributes, flattened_argument
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

# Support
#########
extend = (destination,source) ->
  for key, value of source
    destination[key] = value
  destination

is_view = (object) ->
  object and object.element and object.render

is_model = (object) ->
  object and object.get and object.set and object.trigger and object.bind

is_collection = (object) ->
  object and object.add and object.remove and object.trigger and object.bind

is_server = (server) ->
  server and server.address and server.connections and server.routes

is_array = (array) ->
  array and Object::toString.call(array) is '[object Array]'

is_element = (element) ->
  element?.nodeType is 1 or element?.nodeType is 2

is_$ = ($) -> 
  $?[0] and $?[0]?.nodeType and $.length?

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
    
# Export
########
exports = if module?.exports? then module.exports else window
exports.View = View
exports.Builder = Builder
exports.Server = Server