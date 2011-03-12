# Environments
##############
environments = {}

View.extend
  env: (envs) ->
    if arguments.length is 2
      [env_name, callback] = arguments
      if not environments[env_name]?
        environments[env_name] = callback
      else if environments[env_name]()
        callback.call @
    else
      for env_name, callback of envs
        @env env_name, callback

View.env
  server: ->
    (window? and window.name is 'nodejs') or (process? and require? and global? and module?)
  client: ->
    window? and window.document?
  browser: ->
    window? and window.name? and window.name isnt 'nodejs'

View.extend extend:env: (envs) ->
  for env_name, args of envs
    if environments[env_name]()
      if typeof args is 'function'
        response = args()
        @extend response if response
      else
        @extend args
