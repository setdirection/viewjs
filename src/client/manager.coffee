# ViewManager
#############
deffered = {}
ViewManager = ->
  callback = arguments[arguments.length - 1] if typeof arguments[arguments.length - 1] is 'function'
  if is_array(arguments[0]) or typeof arguments[0] is 'string'
    response = []
    for class_name in array_flatten array_from arguments
      if typeof class_name is 'string'
        View.trigger 'error', "#{class_name} has not been created." if not ViewManager.views[class_name]?
        response.push ViewManager.views[class_name]
    if typeof arguments[0] is 'string' then response[0] else response
  else
    response = {}
    for class_name, _callback of arguments[0]
      if not ViewManager.views[class_name]?
        response[class_name] = null
        deffered[class_name] = [] if not deffered[class_name]?
        deffered[class_name].push _callback
      else
        response[class_name] = ViewManager.views[class_name]
        _callback.call response[class_name], response[class_name]
    response
  
ViewManager.views = {}
ViewManager.create = proxy View.create, View
ViewManager.extend = proxy View.extend, View
ViewManager.env = proxy View.env, View
