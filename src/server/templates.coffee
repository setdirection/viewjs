# Templates
###########
jade = require 'jade'
eco = require 'eco'

#TODO: should use built in express functionality and submit patches to express
ViewServer.extend compileTemplates: (as_string = false,document,templates_dir = @templates) ->
  compiled = {}
  child_nodes_from_html = "(function(html){
    var div = (typeof(document) != 'undefined' ? document : View.document).createElement('div');
    div.innerHTML = html;
    return div.childNodes.length === 1 ? div.childNodes[0] : div.childNodes;
  })"
  prefix = "(function(___obj){return #{child_nodes_from_html}(("
  suffix = ')(___obj))})'

  #html templates
  files_with_extension(templates_dir,/\.html$/).map (filename) =>
    content = String fs.readFileSync filename
    content = content.replace(/\\/g,'\\\\').replace(/\'/g,'\\\'')
    compiled[filename.substring(templates_dir.length + 1)] = "(function(){return #{child_nodes_from_html}('#{content}')})"  

  #jade templates
  files_with_extension(templates_dir,/\.jade$/).map (filename) =>
    content = String fs.readFileSync filename
    output = require('jade').compile(content).toString()
    output = prefix + output + suffix
    compiled[filename.substring(templates_dir.length + 1)] = output

  #eco templates
  files_with_extension(templates_dir,/\.eco$/).map (filename) =>
    content = String fs.readFileSync filename
    output = eco.compile content
    output = output.replace /module.exports = /, prefix
    output = output.replace /;$/, suffix
    compiled[filename.substring(templates_dir.length + 1)] = output
  
  if not as_string
    for filename of compiled
      compiled[filename] = (new Function("with(this){return " + compiled[filename] + "}")).call document: document
    return compiled 

  #serialize compiled templates
  output = "{"
  for filename, contents of compiled
    output += "'" + filename + "':" + contents + ','
  output = output.replace(/,$/,'') + '}'
  output