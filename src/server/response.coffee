# Response
##########
ViewServer.extend
  respond: (request,response) ->
    @trigger 'request', request, response
    stylesheets = array_from @_stylesheets
    javascripts = array_from @_javascripts
    execute = array_from @_execute
    meta = array_from @_meta
    # allow env callbacks to specify what gets served per request
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
    
    #initialize json args
    json_args = JSON.stringify
      stylesheets: process_asset_arguments(stylesheets, /\.css$/)
      javascripts: process_asset_arguments(javascripts, /\.js$/)
      execute: process_asset_arguments(execute, /\.js$/)
      public: @public
      domain: @domain
      routes: @routes
      meta: meta
      url: request.originalUrl

    command = "#{process.argv[0]} #{__dirname}/view.serializer.js '#{json_args}'"
    require('child_process').exec command, (error, stdout, stderr) =>
      if stderr? and stderr != ''
        console.log 'ViewSerializer threw exception with arguments:'
        console.log json_args
        console.log 'stderr:'
        console.log stderr
        console.log 'stdout contained:'
        console.log stdout
        response.send stdout
      else
        params = RouteResolver request.originalUrl
        view_name = ''
        view_name = key for key of params
        send_response = ->
          response.send stdout
        if @cache[view_name]?
          @cache request.originalUrl, stdout, send_response
        else
          send_response()

#build up asset arguments, which will recursively walk directories for local paths
process_asset_arguments = (args,pattern) ->
  target = []
  add_item = (item) =>
    target.push item if not (item in target)
  for item in array_flatten array_from args
    if item.match /^https?\:/
      add_item item
    else if is_directory item
      files_with_extension(item, pattern).map add_item
    else
      add_item item
  target