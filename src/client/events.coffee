# Events
########
View.extend
  bind: (event_name,callback) ->
    if arguments.length is 1 and typeof event_name is 'object'
      for _event_name, _callback of event_name
        @bind _event_name, _callback
    else
      @trigger 'error', 'No callback specified for ' + event_name if not callback?
      @_callbacks ||= {}
      @_callbacks[event_name] ||= []
      @_callbacks[event_name].push callback if not (callback in @_callbacks[event_name])
      callback.call @ if event_name is 'ready' and @_ready
    @

  unbind: (event_name,callback) ->
    @_callbacks = {} if not event_name
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
    return @ if not @_callbacks
    if @_callbacks[event_name]
      for item in @_callbacks[event_name]
        item.apply @, Array::slice.call arguments, 1 if item? #if item? should not be necessary but is
    if @_callbacks.all
      item.apply @, arguments for item in @_callbacks.all
    @

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

# * bind: 
# * on: 
View.extend extend:bind: bind_extend_handler
View.extend extend:on: bind_extend_handler

# event: warning: (warning) Warning messages, deprecations, etc. 
# event: error: (Error) Triggered when an exception is thrown.
View.extend
  on:
    warning: (warning) ->
      console.log.apply console, ["#{@name} warning: "].concat array_from arguments if console?.log?
    error: (error) ->
      console.log.apply console, ["#{@name || 'View'} error: "].concat array_from arguments if console?.log?
      #in Node, writing the error will not be written to the console before the error is thrown
      #which stops the process
      throw error
      setTimeout ->
        throw error
      , 100