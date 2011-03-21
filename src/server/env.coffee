# Environments
##############
environments = {}

ViewServer.extend
  env: (request,envs) ->
    if typeof request is 'object' and request.set?
      for env_name, callback of envs
        environments[env_name] = callback
    else
      for env_name, callback of envs
        if not environments[env_name]?
          should_call = false
        else if typeof environments[env_name] is 'boolean'
          should_call = environments[env_name]
        else
          should_call = environments[env_name](request)
        if should_call
          callback.call @, request
          true
        else
          false

ViewServer.extend extend:env: (envs) ->
  for env_name, args of envs
    if env_name is 'set'
      for _env_name, _callback of args
        environments[_env_name] = _callback
    else
      @env_callbacks ||= []
      @env_callbacks.push envs