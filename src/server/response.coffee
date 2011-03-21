# Response
##########
ViewServer.extend
  respond: (request,response) ->
    request._stylesheets = array_from @_stylesheets
    request._javascripts = array_from @_javascripts
    request._execute = array_from @_execute
    for envs in @env_callbacks || []
      args = ViewServer.env request, envs
      request._stylesheets = request.stylesheets.concat args.stylesheets if args.stylesheets
      request._javascripts = request.javascripts.concat args.javascripts if args.javascripts
      request._execute = request.javascripts.concat args.execute if args.execute
    _.uniq request._stylesheets
    _.uniq request._javascripts
    _.uniq request._execute
    @createWindow request, (window) ->
      if window.View?
        window.View.extend on:route: (view_instance) ->
          response.send @renderWindow window
        window.View.extend route: request.originalUrl
      else
        response.send @renderWindow window
      
  createWindow: (request,callback) ->
    document = jsdom '<html><head></head><body></body></html>'
    window = document.createWindow()
    window.XMLHttpRequest = XMLHttpRequest
    console.log '?'
    console.log window.document.implementation
    window.document.implementation.addFeature 'MutationEvents', ['1.0']
    #append stylesheets
    request._stylesheets().map (href) ->
      tag = document.createElement 'link'
      tag.rel = 'stylesheet'
      tag.type = 'text/css'
      tag.href = href
      document.head.appendChild tag
    #append scripts
    request._javascripts().map (src) ->
      tag = document.createElement 'script'
      tag.type = 'text/javascript'
      tag.src = script
      document.head.appendChild tag
    #setup sandboxed app
    window.document.implementation.addFeature 'FetchExternalResources', ['script']
    window.document.implementation.addFeature 'ProcessExternalResources', ['script']
    executables = array_from request._execute
    add_script = =>
      script = executables.shift()
      if script
        do (script) =>
          tag = document.createElement 'script'
          tag.onload = =>
            #TODO: refactor
            if script.match /view\.js$/
              window.View.extend
                routes: @routes
                cache: @compileTemplates false, document
            tag.parentNode.removeChild tag
            add_script()
          tag.type = 'text/javascript'
          tag.src = script
          document.head.appendChild tag
      else
        callback window
    if executables.length > 0
      add_script()
    else
      callback window
  
  renderWindow: (window) -> 
    output = window.document.documentElement.innerHTML
    #make style and script paths relative 
    script_fragment = 'script type="text/javascript" src="'
    style_fragment = 'link rel="stylesheet" type="text/css" href="'
    script_regexp = new RegExp script_fragment + @public, 'g'
    style_regexp = new RegExp style_fragment + @public, 'g'
    output = output.replace script_regexp, script_fragment + '/'
    output = output.replace style_regexp, style_fragment + '/'
    #inject compiled templates
    output = output.replace /\/view.js"\>\<\/script\>/, "/view.js\"></script><script type=\"text/javascript\">
      View.extend({
        routes: #{@JSONFromRoutes()},
        cache: #{@compileTemplates(true)}
      });
    </script>
    "
    """
      <!DOCTYPE html>
      <html>
        #{output}
      </html>
    """ 