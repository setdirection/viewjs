exec = require('child_process').exec
fs = require 'fs'
folder_mode = 0755
bootstrap_dir = __dirname + '/../bootstrap/'
lib_dir = __dirname + '/../lib/'
target_dir = './'

copy_file = (source,target) ->
  fs.writeFileSync target, fs.readFileSync source

copy_directory = (name) ->
  fs.readdirSync(bootstrap_dir + 'app/' + name).map (filename) ->
    if not filename.match /^\./
      copy_file bootstrap_dir + 'app/' + name + '/' + filename, target_dir + 'app/' + name + '/' + filename

create_directory = (name) ->
  fs.mkdirSync target_dir + name, folder_mode

create_package_json = (target) ->
  fs.writeFileSync target, """{
    "name": "#{target.split('/').pop()}",
    "main": "app.js",
    "dependencies": {
      "view": ">= 2.0.0"
    }
  }"""

exec 'npm install express'

#setup directory structure
create_directory 'cache'
create_directory 'app'
create_directory 'app/templates'
create_directory 'app/views'
create_directory 'app/models'
create_directory 'app/stylesheets'
create_directory 'app/controllers'
create_directory 'app/collections'
create_directory 'public'
create_directory 'public/images'
create_directory 'public/javascripts'
create_directory 'public/javascripts/lib'
create_directory 'public/javascripts/models'
create_directory 'public/javascripts/collections'
create_directory 'public/javascripts/controllers'
create_directory 'public/javascripts/views'
create_directory 'public/stylesheets'

#copy bootstrap files
copy_directory 'templates'
copy_directory 'views'
copy_directory 'models'
copy_directory 'collections'
copy_directory 'controllers'
copy_directory 'stylesheets'
copy_file bootstrap_dir + 'app.js', target_dir + 'app.js'
copy_file bootstrap_dir + 'Cakefile', target_dir + 'Cakefile'
copy_file bootstrap_dir + 'config.coffee', target_dir + 'config.coffee'
copy_file lib_dir + 'jquery.js', target_dir + 'public/javascripts/lib/jquery.js'
copy_file lib_dir + 'underscore.js', target_dir + 'public/javascripts/lib/underscore.js'
copy_file lib_dir + 'backbone.js', target_dir + 'public/javascripts/lib/backbone.js'
copy_file lib_dir + 'view.client.js', target_dir + 'public/javascripts/lib/view.js'
create_package_json target_dir + 'package.json'

console.log "ViewJS project initialized"