# Routes
########
ViewServer.extend extend:routes: (routes) -> 
  @routes ||= []
  for path, view of routes
    if typeof view is 'function'
      @server.get path, view
    else
      @routes[path] = view
      @server.get path, (request,response) =>
        @respond(request,response)
        
ViewServer.extend JSONFromRoutes: ->
  fragments = []
  for path,view in @routes || {}
    fragments.push '"' + path + '":"' + view + '"'
  "{#{fragments.join(',')}}"