require.paths.unshift __dirname + '/node_modules'
child_process = require('child_process')
exec = child_process.exec
spawn = child_process.spawn
fs = require 'fs'
CoffeeScript = require 'coffee-script'
_ = require 'underscore'

files =
  'view.client': [
    './src/client/support.coffee'
    './src/client/mixin.coffee'
    './src/client/initialize.coffee'
    './src/client/events.coffee'
    './src/client/env.coffee'
    './src/client/dom.coffee'
    './src/client/data.coffee'
    './src/client/aspect.coffee'
    './src/client/templates.coffee'
    './src/client/builder.coffee'
    './src/client/router.coffee'
    './src/client/logger.coffee'
    './src/client/manager.coffee'
    './src/client/export.coffee'
  ]
  'view.serializer': [
    './src/serializer/serializer.coffee'
  ]
  'view.server': [
    './src/server/support.coffee'
    './src/server/mixin.coffee'
    './src/server/events.coffee'
    './src/server/server.coffee'
    './src/server/templates.coffee'
    './src/server/assets.coffee'
    './src/server/meta.coffee'
    './src/server/routes.coffee'
    './src/server/cache.coffee'
    './src/server/response.coffee'
    './src/server/proxy.coffee'
    './src/server/env.coffee'
    './src/server/manager.coffee'
    './src/server/export.coffee'
  ]
  'test': [
    './test/client.coffee'
    './test/server.coffee'
  ]
post_process =
  'view.client': (output) ->
    output = get_history_js() + output
directories = 
  'view.client': './src/client'
  'view.server': './src/server'
  'view.serializer': './src/serializer'
  'test': './test'

copy_file = (source,target) ->
  fs.writeFileSync target, fs.readFileSync source

compile_templates = ->
  {ViewServer} = require './lib/view.server.js'
  filename = './test/public/javascripts/templates.js'
  output = ViewServer.compileTemplates true, false, './test/templates'
  fs.writeFileSync filename, """
    View.extend({
      templates: #{output}
    });
  """
  console.log 'Compiled ' + filename

get_history_js = ->
  output = [
    fs.readFileSync './lib/json2.js'
    fs.readFileSync './lib/amplify.store.js'
    fs.readFileSync './lib/history.js'
    fs.readFileSync './lib/history.adapter.$.js'
  ].join("\n")
  "if(window.name != 'nodejs'){#{output}}"

watch_directory = (_opts, callback) ->
  opts = _.extend(
    { path: '.', persistent: true, interval: 500, callOnAdd: false },
    _opts
  )
  watched = []
  addToWatch = (file) ->
    fs.realpath file, (err, filePath) ->
      callOnAdd = opts.callOnAdd

      unless _.include(watched, filePath)
        isDir = false
        watched.push filePath
        fs.watchFile filePath, { persistent: opts.persistent, interval: opts.interval }, (curr, prev) ->
          return if curr.mtime.getTime() is prev.mtime.getTime()
          if isDir
            addToWatch filePath
          else
            callback filePath
      else
        callOnAdd = false

      fs.stat filePath, (err, stats) ->
        if stats.isDirectory()
          isDir = true
          fs.readdir filePath, (err, files) ->
            process.nextTick () ->
              addToWatch filePath + '/' + file for file in files
        else
          callback filePath if callOnAdd
  addToWatch opts.path

run_tests = ->
  exec 'expresso ./lib/test.js', (err,stdin,stderr) ->
    console.log stdin
    console.log err
    console.log stderr
  
run_tests = _.throttle run_tests, 500

task 'watch', 'watch source dir and recompile', ->
  spawn_watcher = (target,source_paths) ->
    call_coffeescript = ->
      args = [
        '--output',
        "./lib/",
        '--join',
        '--lint',
        '--compile'
      ].concat source_paths
      execute_coffee = spawn 'coffee', args
      execute_coffee.stdout.on 'data', (data) ->
        console.log 'Coffee:  ' + data
      execute_coffee.stderr.on 'data', (data) ->
        console.log 'coffee err: ' + data
      execute_coffee.on 'exit', (code) ->
        if code == 0
          exec "mv ./lib/concatenation.js ./lib/#{target}.js"
          console.log 'coffee:   \033[90mcompiled\033[0m ' + target + '.js\n'
          run_tests()
        else
          console.log 'coffee err: There was a problem during .coffee to .js compilation. see above'
    watch_directory {path: directories[target], callOnAdd: true}, _.throttle(call_coffeescript,250)
  for name of files
    do (name) ->
      setTimeout ->
        spawn_watcher name, files[name]
      , 300

task 'compile', 'compile library', ->
  sources = {}
  for name of files
    sources[name] = files[name].map (filename) -> fs.readFileSync filename
  for name of files
    output = CoffeeScript.compile sources[name].join('\n')
    output = post_process[name](output) if post_process[name]?
    fs.writeFileSync "./lib/#{name}.js", output
    console.log "compiled ./lib/#{name}.js\n"
  copy_file __dirname + '/lib/jquery.js', __dirname + '/test/public/javascripts/lib/jquery.js'
  copy_file __dirname + '/lib/underscore.js', __dirname + '/test/public/javascripts/lib/underscore.js'
  copy_file __dirname + '/lib/backbone.js', __dirname + '/test/public/javascripts/lib/backbone.js'
  copy_file __dirname + '/lib/view.client.js', __dirname + '/test/public/javascripts/lib/view.js'
  compile_templates()
  
task 'templates', 'compile templates for tests', (options) ->
  compile_templates()
  
task 'test', 'run tests', ->
  run_tests()
  
task 'docs', 'build documentation', ->
  target = __dirname + '/docs/index.html'
  require('./lib/docs.coffee').build_docs __dirname + '/README.md', target
  console.log "Built documentation at #{target}"