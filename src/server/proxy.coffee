# Proxy
#######
ViewServer.extend proxy: (options) ->
  if not options.url?
    for option in ['port','host','base']
      @trigger 'error', "no #{option} specified" if not options[option]
  options.base = options.base + '/' if not options.base.match(/\/$/)
  base = new RegExp('^' + options.base.replace(/\//g,'\\/') + '(.+)$')
  url_components = if options.url then url.parse options.url else false
  @server.get base, (request,response) ->
    request_options =
      protocol: if options.url then url_components.protocol else options.protocol || 'http'
      host: if options.url then url_components.host else options.host
      port: if options.url then url_components.port else options.port || 80
      path: '/' + request.params[0]
      method: request.method
    if options.url
      request_options.search = options.search
    request_options.protocol = request_options.protocol.replace /\:$/, ''
    proxy_request = http.request request_options, (proxy_response) ->
      response.statusCode = proxy_response.statusCode
      response.setHeader key, value for key, value of proxy_response.headers
      proxy_response.setEncoding 'utf8'
      proxy_response.on 'data', (chunk) ->
        response.write chunk
      proxy_response.on 'end', ->
        response.end()
    response.setHeader key, value for key,value of request.headers
    proxy_request.end()

ViewServer.extend extend:proxy: (options) ->
  @proxy options