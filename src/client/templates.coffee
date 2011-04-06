# Templates
###########
templates = {}
View.extend extend:templates: (_templates,discard) ->
  templates = _templates
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
      if not is_element(element) and not is_array(element) and not is_$(element)
        @trigger 'error', 'render() did not return an element or array, returned ' + typeof element
      @[0].innerHTML = ''
      element = [element] if not is_array(element) and not is_$(element)
      @[0].appendChild _element for _element in element
    if not @_ready
      @_ready = true
      @trigger 'ready', element
    @trigger 'render', element

View.extend extend:render: (filename) ->
  add_helpers_to_context = (context) =>
    for helper_name, helper of template_helpers
      context[helper_name] = proxy template_helpers[helper_name], @
  if typeof filename is 'string'
    callback = (context) ->
      @trigger 'error', 'Template ' + filename + ' not found' if not templates[filename]
      if context.attributes?
        final_context = extend {}, context.attributes
        final_context = extend final_context, context
        add_helpers_to_context final_context
        output = templates[filename](final_context)
      else
        final_context = extend {}, context
        add_helpers_to_context final_context
        output = templates[filename](final_context)
      output
  else
    callback = filename
  @_render = callback

template_helpers = {}
View.extend extend:helpers: (helpers) ->
  extend template_helpers, helpers
  
View.extend helpers:
  url: (params) ->
    url = RouteResolver params
    View.env browser: ->
      url = '#' + url
    url