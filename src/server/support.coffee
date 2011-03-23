# Support
#########
express = require 'express'
http = require 'http'
fs = require 'fs'
_ = require 'underscore'
{jsdom} = require 'jsdom'
{XMLHttpRequest} = require 'XMLHttpRequest'

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
  
is_directory = (dir) ->
  require('fs').statSync(dir).isDirectory()

files_with_extension = (dir,extension) ->
	fs = require 'fs'
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

create_empty_document = ->
  jsdom '<html><head></head><body></body></html>'
