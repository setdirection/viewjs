# ViewServerManager
###################
deffered = {}
ViewServerManager = ->
  callback = arguments[arguments.length - 1] if typeof arguments[arguments.length - 1] is 'function'
  if is_array(arguments[0]) or typeof arguments[0] is 'string'
    response = []
    for class_name in array_flatten array_from arguments
      if typeof class_name is 'string'
        ViewServer.trigger 'error', "#{class_name} has not been created." if not ViewServerManager.servers[class_name]?
        response.push ViewServerManager.servers[class_name]
    if typeof arguments[0] is 'string' then response[0] else response
  else
    response = {}
    for class_name, _callback of arguments[0]
      if not ViewServerManager.servers[class_name]?
        response[class_name] = null
        deffered[class_name] = [] if not deffered[class_name]?
        deffered[class_name].push _callback
      else
        response[class_name] = ViewManager.servers[class_name]
        _callback.call response[class_name], response[class_name]
    response
  
ViewServerManager.servers = {}
ViewServerManager.create = proxy ViewServer.create, ViewServer
ViewServerManager.extend = proxy ViewServer.extend, ViewServer
ViewServerManager.env = proxy ViewServer.env, ViewServer
