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

history_available = (request) ->
  return false if not request
  supported_agents = 
    chrome: (ua) -> # >= 8
      if ua.match(/Chrome/)
        version = ua.match(/Chrome\/([\d]+)/)
        return true if parseInt(version[1]) >= 8
    safari: (ua) -> # >= 5
      if ua.match(/Safari/)
        version = ua.match(/Version\/([\d]+)/)
        return true if parseInt(version[1]) >= 5
    firefox: (ua) -> # >= 4
      if ua.match(/Firefox/)
        version = ua.match(/Firefox\/([\d]+)/)
        return true if parseInt(version[1]) >= 4
    ios: (ua) -> # >= 4
      if ua.match(/(iPhone|iPad)/)
        version = ua.match(/\sOS\s([\d]+)/)
        return true if parseInt(version) >= 4
    android: (ua) -> # >= 2.2
      if ua.match(/Android/)
        version = ua.match(/\s([\d\.]+)/)
        bits = version.split('.')
        return true if parseInt(bits[0]) > 2
        return true if parseInt(bits[0]) is 2 and parseInt(bits[1]) > 2
    opera: (ua) -> # >= 11.5
      if ua.match(/Opera/)
        version = ua.match(/Version\/([\d\.]+)/)
        bits = version.split('.')
        return true if parseInt(bits[0]) > 11
        return true if parseInt(bits[0]) is 11 and bits[1].match(/^[5-9]/)
  for agent, test of supported_agents
    if test(request.headers['user-agent']) is true
      return true 
  false
  
ViewServer.extend env:set:
  legacy: (request) ->
    not history_available request
  html5: (request) ->
    history_available request