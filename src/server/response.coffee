# Response
##########
ViewServer.extend
  respond: (request,response) ->
    @trigger 'request', request, response
    request._stylesheets = array_from @_stylesheets
    request._javascripts = array_from @_javascripts
    request._execute = array_from @_execute
    for envs in @env_callbacks || []
      args = ViewServer.env request, envs
      request._stylesheets = request._stylesheets.concat args.stylesheets if args.stylesheets
      request._javascripts = request._javascripts.concat args.javascripts if args.javascripts
      request._execute = request._execute.concat args.execute if args.execute
    request._stylesheets = _.uniq request._stylesheets
    request._javascripts = _.uniq request._javascripts
    request._execute = _.uniq request._execute
    @createWindow request, (window) =>
      if window.View?
        window.View.extend on:route: (view_instance) =>
          output = @renderWindow window, request
          @cache request.originalUrl, output if @cache[view_instance.name]
          response.send output
        window.View.extend route: request.originalUrl
      else
        response.send @renderWindow window, request
      
  createWindow: (request,callback) ->
    document = create_empty_document()
    window = document.createWindow()
    window.XMLHttpRequest = XMLHttpRequest
    window.document.implementation.addFeature 'MutationEvents', ['1.0']
    window.document.implementation.addFeature 'FetchExternalResources', ['script']
    window.document.implementation.addFeature 'ProcessExternalResources', ['script']
    @trigger 'window:created', window
    executables = array_from request._execute
    add_script = =>
      script = executables.shift()
      if script
        do (script) =>
          tag = window.document.createElement 'script'
          tag.onload = =>
            #TODO: refactor
            if script.match /(^|\/)view\.js$/
              window.View.extend
                routes: @routes
            tag.parentNode.removeChild tag
            add_script()
          tag.type = 'text/javascript'
          tag.src = script
          window.document.head.appendChild tag
      else
        callback.call @, window
    if executables.length > 0
      add_script()
    else
      callback.call @, window
  
  renderWindow: (window,request) -> 
    @trigger 'window:render', window, request
    output = window.document.documentElement.innerHTML    
    #append stylesheets
    stylesheets = (request._stylesheets || []).map (href) =>
      """<link rel="stylesheet" type="text/css" href="#{href.replace(@public,'/')}"/>"""
    javascripts = (request._javascripts || []).map (src) =>
      script_output = """<script type="text/javascript" src="#{src.replace(@public,'/')}"/></script>"""
      if src.match(/(^|\/)view\.js$/)
        script_output += """<script type="text/javascript">
          View.extend({
            routes: #{@JSONFromRoutes()}
          });
        </script>
        """
      script_output
    output = output.replace(/<head>/,"<head>" + javascripts.join('') + stylesheets.join(''))
    """
      <!DOCTYPE html>
      <html>
        #{output}
      </html>
    """ 