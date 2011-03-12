# DOM
#####
View.extend
  element: ->
    return @[0] if @[0]
    element = @document.createElement 'div'
    element.setAttribute 'data-view', @name if @name 
    set_element.call @, element
    
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
      return @[0] if @[0]
      set_element.call @, generator.call @

  delegate: (events) ->
    @delegate events
    
  $: ($) ->
    @$ $

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
    
#setup the document element
View.extend env:client: ->
  document: window.document
