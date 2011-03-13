# DOM
#####
View.extend
  element: ->
    return @[0] if @[0]
    element = @document.createElement 'div'
    element.setAttribute 'data-view', @name if @name 
    set_element.call @, element
    
  $: (selector) ->
    @trigger 'error', "No DOM library is available in #{name}" if not @_$?
    @_$ selector, @[0]
    
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
    
  $: (dom_library,discard) ->
    if (jQuery? and dom_library is jQuery) or (Zepto? and dom_library is Zepto)
      @_$ = dom_library
    else
      @trigger 'error', 'Unsupported DOM library specified, use jQuery or Zepto', dom_library
    discard()
    View.extend
      before:
        tag: (next,arguments...) ->
          @_$ next.apply @, arguments
          for event in supported_events
            $[event] = wrap_function $[event], (next,arguments...) =>
              arguments[arguments.length - 1] = proxy arguments[arguments.length - 1], @

set_element = (element) ->
  @length = 1
  @[0] = element
  #create a 
  extend @$, @_$ @[0] if @_$

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
    if typeof key is 'string'
      [event_name,selector] = key.match /^(\w+)\s*(.*)$/
      process_item.call @, event_name, selector, method_name
    else
      for selector, method_name of key
        process_item.call @, event_name, selector, method_name

#setup the document element
View.extend env:client: ->
  document: window.document
