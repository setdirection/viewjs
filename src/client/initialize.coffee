# Initialize
############
View.extend stack:initialize:add: (args...,next) ->
  return if @_initialized?
  @_initialized = true
  if args.length > 0
    if is_model args[0]
      @_model args[0]
    else if is_collection args[0]
      @_collection args[0]
    else if typeof args[0] isnt 'function'
      @set args[0]
    @_initialize_callback = args[args.length - 1] if typeof args[args.length - 1] is 'function'
  #the server depends on initialize being async, ensure that it is
  setTimeout(next,0)

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