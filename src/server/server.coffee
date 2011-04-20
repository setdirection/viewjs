# Server Setup
##############
ViewServer.extend extend:server: (server) ->
  @server = server
  
ViewServer.extend extend:port: (port) ->
  @port = port
  @extend server: create_server() if not @server
  setup_static_provider_and_routes @server, @public if @server and @public #TODO: cleanup race condition
  @server.listen @port
  console.log "Express ViewServer listening on port #{@port}"

ViewServer.extend extend:public: (public_dir) ->
  @public = public_dir
  setup_static_provider_and_routes @server, @public if @server and @public #TODO: cleanup race condition

create_server = ->
  server = express.createServer()
  server.use express.methodOverride()
  server.use express.bodyParser()
  server.use express.cookieParser()
  server.use express.logger()
  server
  
setup_static_provider_and_routes = (server,public) ->
  server.use express.static public
  server.use server.router
  