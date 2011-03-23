# Cache
#######
ViewServer.extend cache: (url,contents) ->
  console.log 'attempting to cache', url
  filename = @public.replace(/\/$/,'') + url
  if url is '' or url.match(/\/$/)
    filename += 'index.html'
  else if not url.match /\.[a-zA-Z]+$/
    filename += '.html'
  console.log 'will write', filename
  fs.writeFileSync filename, contents

ViewServer.extend extend:cache: (views) ->
  for view in array_flatten array_from views
    @cache[view] = true