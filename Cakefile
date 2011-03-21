child_process = require('child_process')
exec = child_process.exec
spawn = child_process.spawn
fs = require 'fs'
CoffeeScript = require 'coffee-script'
_ = require 'underscore'

files =
  view: [
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
  test: [
    './test/test.coffee'
  ]
directories = 
  view: './src'
  test: './test'

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
  tester = spawn 'expresso', ['./lib/test.js']
  tester.stdout.setEncoding 'utf8'
  tester.stderr.setEncoding 'utf8'
  output = []
  tester.stdout.on 'data', (data) ->
    output.push data
  tester.stderr.on 'data', (data) ->
    output.push data
  tester.on 'exit', (code) ->
    console.log output.join('')
  
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
    spawn_watcher name, files[name]

task 'compile', 'compile library', ->
  sources = {}
  for name of files
    sources[name] = files[name].map (filename) -> fs.readFileSync filename
  for name of files
    fs.writeFile "./lib/#{name}.js", CoffeeScript.compile sources[name].join('\n')
    console.log "compiled ./lib/#{name}.js\n"

task 'test', 'run tests', ->
  run_tests()