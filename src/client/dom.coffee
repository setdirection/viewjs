# DOM
#####
View.extend
  element: ->
    return @[0] if @[0]
    element = @document.createElement 'div'
    element.setAttribute 'class', @name if @name 
    set_element.call @, element
    
  $: (selector) ->
    @trigger 'error', "No DOM library is available in #{name}" if not @_$?
    @_$ selector, @[0]
  
  delegate: (events) ->
    @_delegatedEvents = events

View.extend extend:
  element: (generator) ->
    @element = ->
      return @[0] if @[0]
      set_element.call @, generator.call @

  delegate: (events) ->
    @delegate events
    
  $: (dom_library,discard) ->
    if dom_library and dom_library.fn
      @_$ = dom_library
      dom_library.fn.view = reverse_lookup
    else
      @trigger 'error', 'Unsupported DOM library specified, use jQuery or Zepto', dom_library

set_element = (element) ->
  @length = 1
  @[0] = element
  #create a hybrid function object to allow: both @$('li a') and @$.hide()
  extend @$, @_$ @[0] if @_$
  delegate_events.call @, @_delegatedEvents, @[0] if @_delegatedEvents

delegate_events = (events,element) ->
  return if not (events || (events = @_delegatedEvents))
  @trigger 'error', 'No DOM library the supports delegate() available' if not @_$?.fn?.delegate?
  @_$(element).unbind()
  process_item = (event_name,selector,method_name) ->
    method = proxy (if typeof method_name is 'string' then @[method_name] else method_name), @
    if selector is ''
      @_$(element).bind event_name, method
    else
      @_$(element).delegate selector, event_name, method
  for key, method_name of events
    [discard,event_name,selector] = key.match /^(\w+)\s*(.*)$/
    if typeof method_name is 'string' or typeof method_name is 'function'
      process_item.call @, event_name, selector, method_name
    else
      for selector, _method_name of method_name
        process_item.call @, event_name, selector, _method_name

reverse_lookup = ->
  ViewManager @[0].className
  
#setup the document element
View.extend env:client: ->
  document: window.document
