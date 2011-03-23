# Cache
#######
ViewServer.extend cache: (url,contents) ->
  @trigger 'error', 'public directory is not defined' if not @public
  filename = @public.replace(/\/$/,'') + url
  if url is '' or url.match(/\/$/)
    filename += 'index.html'
  else if not url.match /\.[a-zA-Z]+$/
    filename += '.html'
  fs.writeFileSync filename, contents

ViewServer.extend extend:cache: (views) ->
  for view in array_flatten array_from views
    @cache[view] = true