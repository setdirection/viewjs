print = require('sys').print
exec = require('child_process').exec
fs = require 'fs'
CoffeeScript = require 'coffee-script'

files =
  'view': [
    './src/support.coffee'
    './src/mixin.coffee'
    './src/initialize.coffee'
    './src/events.coffee'
    './src/env.coffee'
    './src/dom.coffee'
    './src/data.coffee'
    './src/aspect.coffee'
    './src/template.coffee'
    './src/builder.coffee'
    './src/router.coffee'
    './src/logger.coffee'
    './src/manager.coffee'
    './src/export.coffee'
  ]
  'test': [
    './test/test.coffee'
  ]
  
sources = {}
for name of files
  sources[name] = files[name].map (filename) -> fs.readFileSync filename

task 'watch', 'watch source dir and recompile', ->
  for name of files
    if name isnt 'test'
      for filename in files[name]
        do (name,filename) ->
          fs.watchFile filename, ->
            try
              fs.writeFile "./lib/#{name}.js", CoffeeScript.compile sources[name].join('\n')
              print "compiled ./lib/#{name}.js\n"
            catch e
              print filename + "\n"
              print e.stack + "\n\n"

task 'compile', 'compile library', ->
  for name of files
    fs.writeFile "./lib/#{name}.js", CoffeeScript.compile sources[name].join('\n')
    print "compiled ./lib/#{name}.js\n"

task 'test', 'run tests', ->
  exec 'expresso ./lib/test.js', (stderr,stdout) ->
    print stdout 
    print stderr