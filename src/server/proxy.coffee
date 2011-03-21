# Proxy
#######
ViewServer.extend proxy: (options) ->
  for option in ['port','host','base']
    @trigger 'error', "no host specified for #{option}" if not options[option]
  @server.get new RegExp('^' + options.base.replace(/\//g,'\\/')+ '(.+)$'), (request,response) ->
    request_options =
      host: options.host
      port: options.port
      path: '/' + request.params[0]
      method: request.method
    proxy_request = http.request request_options, (proxy_response) ->
      response.statusCode = proxy_response.statusCode
      response.setHeader key, value for key, value of proxy_response.headers
      proxy_response.on 'data', (chunk) ->
        response.write chunk
      proxy_response.on 'end', ->
        response.end()
    proxy_request.setHeader key, value for key,value of request.headers
    proxy_request.end()

ViewServer.extend extend:proxy: (options) ->
  @proxy options