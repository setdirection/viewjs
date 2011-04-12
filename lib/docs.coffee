markdown = require __dirname + '/markdown' #todo: move to npm
jsdom = require 'jsdom'
fs = require 'fs'

module.exports.build_docs = (source,target) ->
  formatted = markdown.toHTML fs.readFileSync(source).toString()
  jsdom.env formatted, [__dirname + '/jquery.js'], (error,window) ->
    create_nav window
    fs.writeFileSync target, template
      content: window.document.body.innerHTML
      toc: create_toc window

process_toc_signature = (signature) ->
  signature = signature.replace /^\{?[a-zA-Z0-9]+\}?\s=\s/, ''
  signature = signature.replace /\s.+/, ''
  signature = signature.replace /\/.+$/, '' if !signature.match /bind\/on/
  signature
  
create_toc = (window) ->
  contents = ""
  [1,2].map (i) ->
    contents += "<tr>"
    client_h2 = window.$('h1:eq(' + i + ')').next('h2').nextUntil('h1').add(window.$('h1:eq(' + i + ')').next('h2')).filter('h2')
    client_h2.toArray().map (h2) ->
      contents += "<td>"
      contents += "<h2>" + h2.innerHTML + "</h2>"
      window.$(h2).next('h3').nextUntil('h2,h1').add(window.$(h2).next('h3')).filter('h3,h4').toArray().map (h3) ->
        contents += "<#{h3.tagName.toLowerCase()}>" + process_toc_signature(h3.innerHTML) + "</#{h3.tagName.toLowerCase()}>"
      contents += "</td>"
    contents += "</tr>"
  """
    <div id="api_toc"><table><tbody>#{contents}</tbody></table></div>
  """

create_nav = (window) ->
  window.$('h1:first').after """
    <p class="intro">Markup as JavaScript <strong><a href="https://github.com/syntacticx/viewjs/">Source Code</a></strong></p>
    <ul id="nav">
      <li><a href="#intro">Intro</a></li>
      <li><a href="#view">Client</a></li>
      <li><a href="#viewserver">Server</a></li>
    </ul>
    <br class="clear"/>
  """
  
template = (options) -> """
<!DOCTYPE html>
<html>
  <head>
    <title>ViewJS: Markup as JavaScript</title> 
    <link type="text/css" rel="stylesheet" href="stylesheets/syntax.css"/> 
    <link type="text/css" rel="stylesheet" href="stylesheets/screen.css"/> 
  </head> 
  <body> 
    <div id="content"> 
      <div id="main">
        #{options.content}
      </div>
      #{options.toc}
    </div>
    <script type="text/javascript">
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-20694546-1']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
    </script>
  </body>
</html>
"""