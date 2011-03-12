# Data
######
View.extend extend:defaults: (defaults) ->
  @set defaults, silent: true

View.extend
  _model: (model) ->
    if is_model model
      @model = model
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
    @attributes[key]
      
  set: (attributes,options) ->
    options ||= {}
    return @ if not attributes
    attributes = attributes.attributes if attributes.attributes?
    now = @attributes
    for attribute, value of attributes
      if now[attribute] != value
        now[attribute] = value
        if not options.silent
          @_changed = true
          #TODO: note incompatibility with backbone.js, it passes "@" as the first argument
          @trigger 'change:' + attribute, value, options
    @trigger 'change', @, options if not options.silent and @_changed
    @_changed = false
    attributes

View.extend extend:model: (model) ->
  @_model model

View.extend extend:collection: (collection) ->
  @_collection collection
