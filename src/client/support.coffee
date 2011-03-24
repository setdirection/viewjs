# Support
#########
extend = (destination,source) ->
  for key, value of source
    destination[key] = value
  destination

is_view = (object) ->
  Boolean(object and object.element and object.render)

is_model = (object) ->
  Boolean(object and object.get and object.set and object.trigger and object.bind)

is_collection = (object) ->
  Boolean(object and object.add and object.remove and object.trigger and object.bind)

is_array = (array) ->
  Boolean(array and Object::toString.call(array) is '[object Array]')

is_element = (element) ->
  Boolean(element?.nodeType is 1 or element?.nodeType is 3)

is_$ = ($) -> 
  Boolean($?[0] and $?[0]?.nodeType and $.length?)

wrap_function = (func,wrapper) -> ->
  wrapper.apply @, [proxy func, @].concat array_from arguments

proxy = (func,object) ->
  return func if object is undefined
  if arguments.length < 3
    ->
      func.apply object, arguments
  else
    args = array_from arguments
    args.shift()
    args.shift()
    ->
      func.apply object, args.concat array_from arguments

array_without_value = (array) ->
  response = []
  values = array_from(arguments)[1..]
  for item in array
    response.push item if not (in_array(item,values) > -1)
  response

array_flatten = (array) ->
  flattened = []
  for item in array
    if is_array item
      flattened = flattened.concat array_flatten item
    else
      flattened.push item
  flattened

array_from = (object) ->
  return [] if not object
  length = object.length or 0
  results = new Array length
  while length--
    results[length] = object[length]
  results
