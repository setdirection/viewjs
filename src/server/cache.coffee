# Cache
#######
cache_filename_from_url = (url) ->
  filename = @public.replace(/\/$/,'') + '/../cache' + url
  if url is '' or url.match(/\/$/)
    filename += 'index.html'
  else if not url.match /\.[a-zA-Z]+$/
    filename += '.html'
  filename
  
ViewServer.extend cache: (url,contents,callback) ->
  @trigger 'error', 'public directory is not defined' if not @public
  filename = cache_filename_from_url.call @, url
  directory = require('path').dirname filename
  if not file_exists directory
    require(__dirname + '/mkdirs').mkdirs directory, 0777,(err) ->
      fs.writeFile filename, contents, callback
  else
    fs.writeFile filename, contents, callback
  
ViewServer.extend extend:cache: (views) ->
  for view in array_flatten array_from views
    @cache[view] = true
    
ViewServer.extend cacheExists: (url,callback) ->
  filename = cache_filename_from_url.call @, url
  file_exists filename, callback

ViewServer.extend sendCache: (url,response) ->
  filename = cache_filename_from_url.call @, url
  fs.readFile filename, (err,contents) ->
    response.send contents