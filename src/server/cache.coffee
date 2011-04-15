# Cache
#######
ViewServer.extend cache: (url,contents,callback) ->
  @trigger 'error', 'public directory is not defined' if not @public
  filename = @public.replace(/\/$/,'') + '/../cache' + url
  if url is '' or url.match(/\/$/)
    filename += 'index.html'
  else if not url.match /\.[a-zA-Z]+$/
    filename += '.html'
  directory = require('path').dirname filename
  if not file_exists directory
    require(__dirname + '/mkdirs').mkdirs directory, 0777,(err) ->
      fs.writeFile filename, contents, callback
  else
    fs.writeFile filename, contents, callback

ViewServer.extend extend:cache: (views) ->
  for view in array_flatten array_from views
    @cache[view] = true
    
