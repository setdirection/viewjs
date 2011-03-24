# Environments
##############
environments = {}

ViewServer.extend
  env: (request,envs) ->
    if typeof request is 'object' and request.set?
      for env_name, callback of request.set
        environments[env_name] = callback
    else
      if arguments.length is 1
        envs = request
        request = false
      response =
        stylesheets: []
        javascripts: []
        execute: []
      for env_name, callback of envs
        if not environments[env_name]?
          should_call = false
        else if typeof environments[env_name] is 'boolean'
          should_call = environments[env_name]
        else
          should_call = environments[env_name](request)
        if should_call
          _response = if typeof callback is 'function' then callback.call @, request else callback
          for type in ['stylesheets','javascripts','execute']
            if _response[type]
              response[type] = response[type].concat array_flatten array_from (if is_array _response[type] then _response[type] else [_response[type]])
      response

ViewServer.extend extend:env: (envs) ->
  for env_name, args of envs
    if env_name is 'set'
      for _env_name, _callback of args
        environments[_env_name] = _callback
    else
      @env_callbacks ||= []
      @env_callbacks.push envs