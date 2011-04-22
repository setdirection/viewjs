# Response
##########
view_name_from_request = (request) ->
  params = RouteResolver request.originalUrl
  view_name = ''
  view_name = key for key of params
  view_name
  
ViewServer.extend
  respond: (request,response) ->
    view_name = view_name_from_request request
    @trigger 'request', request, response
    @cacheExists request.originalUrl, (cache_available) =>
      if false #@cache[view_name]? and cache_available
        # enable caching once environments, etc are figured out with caching
        @sendCache request.originalUrl, response
      else
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

        # Create a server-side instance of the location object. Should should mirror the data that
        # the client code will see.
        if not @location
          # If the basic location information is not provided do our best to guess the server params
          protocol = @protocol ? 'http:'
          defaultPort = @defaultPort ? if protocol == 'https:' then 443 else 80
          hostHeader = request.header 'Host'

          location =
            protocol: protocol
            host: hostHeader
            hostname: hostHeader.replace /:.*/, ''
            port: if ~hostHeader.indexOf(':') then parseInt(hostHeader.replace /.*:/, '') else defaultPort
        else
          location = _.clone @location

        # Smash in the location data for the request URL
        _.extend location, url.parse request.url
        location.href = "#{location.protocol}//#{location.host}#{request.url}"

        #initialize json args
        json_args = JSON.stringify
          stylesheets: process_asset_arguments(stylesheets, /\.css$/)
          javascripts: process_asset_arguments(javascripts, /\.js$/)
          execute: process_asset_arguments(execute, /\.js$/)
          public: @public
          location: location
          domain: @domain
          routes: @routes
          meta: meta
          url: request.originalUrl
        
        command = "#{process.argv[0]} #{__dirname}/view.serializer.js '#{json_args}'"
        console.log "ViewSerializer JSON arguments for response to: #{request.originalUrl}"
        console.log '--------------'
        console.log command
        console.log ''
        require('child_process').exec command, (error, stdout, stderr) =>
          if error or (stderr? and stderr != '')
            console.log 'ViewSerializer threw exception with arguments:'
            console.log json_args
            console.log 'stderr:'
            console.log stderr
            console.log 'stdout contained:'
            console.log stdout
            response.send stdout
          else
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