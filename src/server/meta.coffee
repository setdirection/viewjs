# Meta
######
ViewServer.extend meta: (meta) ->
  @_meta ||= []
  return @_meta if arguments.length is 0
  for meta in array_flatten array_from meta
    @_meta.push meta
  
ViewServer.extend extend:meta: (meta) ->
  @meta array_flatten array_from meta
