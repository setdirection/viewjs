# Response
##########
ViewServer.extend
  respond: (request,response) ->
    @trigger 'request', request, response
    stylesheets = array_from @_stylesheets
    javascripts = array_from @_javascripts
    execute = array_from @_execute
    meta = array_from @_meta
    for envs in @env_callbacks || []
      args = ViewServer.env request, envs
      stylesheets = stylesheets.concat args.stylesheets if args.stylesheets
      javascripts = javascripts.concat args.javascripts if args.javascripts
      execute = execute.concat args.execute if args.execute
      meta = meta.concat args.execute if args.meta
    stylesheets = _.uniq stylesheets
    javascripts = _.uniq javascripts
    execute = _.uniq execute
    _meta = []
    for item in meta
      _meta.push if typeof item is 'function' then item.call @, request else item
    meta = _.uniq _meta
    
    json_args = JSON.stringify
      stylesheets: stylesheets
      javascripts: javascripts
      execute: execute
      public: @public
      domain: @domain
      routes: @routes
      meta: meta
      url: request.originalUrl
    
    command = "#{process.argv[0]} #{__dirname}/view.serializer.js '#{json_args}'"
    require('child_process').exec command, (error, stdout, stderr) ->
      if stderr? and stderr != ''
        console.log error
        response.send stderr + stdout
      else
        response.send stdout