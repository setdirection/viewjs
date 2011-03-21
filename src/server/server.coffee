# Server Setup
##############
ViewServer.extend extend:server: (server) ->
  @server = server
  
ViewServer.extend extend:port: (port) ->
  @port = port
  @extend server: create_server() if not @server
  @server.listen @port
  console.log "Express ViewServer listening on port #{@port}"

ViewServer.extend extend:public: (public_dir) ->
  @public = public_dir
  @server.use express.staticProvider @public

create_server = ->
  server = express.createServer()
  server.use express.methodOverride()
  server.use express.bodyDecoder()
  server.use express.cookieDecoder()
  server.use server.router
  server.use express.logger()
  server