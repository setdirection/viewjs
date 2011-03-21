# Environments
##############
environments = {}

View.extend
  env: (envs) ->
    if arguments.length is 2
      [env_name, callback] = arguments
      if not environments[env_name]?
        should_call = false
      else if typeof environments[env_name] is 'boolean'
        should_call = environments[env_name]
      else
        should_call = environments[env_name]()
      if should_call
        callback.call @
    else
      for env_name, callback of envs
        if env_name is 'set'
          for _env_name, _callback of callback
            environments[_env_name] = _callback
        else
          @env env_name, callback

View.env set:
  server: ->
    (window? and window.name is 'nodejs') or (process? and require? and global? and module?)
  client: ->
    window? and window.document?
  browser: ->
    window? and window.name? and window.name isnt 'nodejs'

View.extend extend:env: (envs) ->
  for env_name, args of envs
    if env_name is 'set'
      for _env_name, _callback of args
        environments[_env_name] = _callback
    else
      if environments[env_name]()
        if typeof args is 'function'
          response = args()
          @extend response if response
        else
          @extend args
