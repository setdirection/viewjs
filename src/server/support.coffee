# Support
#########
express = require 'express'
http = require 'http'
fs = require 'fs'
_ = require 'underscore'
url = require 'url'
{RouteResolver,View} = require __dirname + '/view.client.js'

extend = (destination,source) ->
  for key, value of source
    destination[key] = value
  destination

is_array = (array) ->
  array and Object::toString.call(array) is '[object Array]'

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
  
file_exists = (path) ->
  try
    fs.lstatSync path
    true
  catch e
    false

is_directory = (dir) ->
  try
    stat = fs.statSync(dir)
  catch e
    return false
  stat.isDirectory()

files_with_extension = (dir,extension) ->
  paths = []
  try
    fs.statSync dir
  catch e
    return []
  traverse = (dir,stack) ->
    stack.push dir
    fs.readdirSync(stack.join '/').map (file) ->
      path = stack.concat([file]).join '/'
      stat = fs.statSync path
      return if file[0] is '.' or file is 'vendor'
      paths.push path if stat.isFile() and extension.test file
      traverse file, stack if stat.isDirectory()
    stack.pop()
  traverse dir || '.', []
  paths
  
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