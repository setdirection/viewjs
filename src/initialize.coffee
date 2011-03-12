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
