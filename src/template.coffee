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
