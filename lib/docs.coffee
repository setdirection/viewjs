CoffeeScript = require 'coffee-script'
{markdown} = require 'markdown'
jsdom = require 'jsdom'
fs = require 'fs'

module.exports.build_docs = (source,target) ->
  formatted = markdown.toHTML fs.readFileSync(source).toString()
  jsdom.env formatted, [__dirname + '/jquery.js',__dirname + '/syntax.js'], (error,window) ->
    create_nav window
    syntax_highlight window
    fs.writeFileSync target, template
      content: window.document.body.innerHTML

process_toc_signature = (signature) ->
  signature = signature.replace /^\{?[a-zA-Z0-9]+\}?\s=\s/, ''
  signature = signature.replace /\s.+/, ''
  signature = signature.replace /\/.+$/, '' if !signature.match /bind\/on/
  signature
  
#create_toc = (window) ->
#  contents = ""
#  [1,2].map (i) ->
#    contents += "<tr>"
#    client_h2 = window.$('h1:eq(' + i + ')').next('h2').nextUntil('h1').add(window.$('h1:eq(' + i + ')').next('h2')).filter('h2')
#    ii = 0
#    client_h2.toArray().map (h2) ->
#      contents += "<td>"
#      title_tag = if ii is 0 then 'h1' else 'h2'
#      contents += "<#{title_tag}>" + h2.innerHTML + "</#{title_tag}>"
#      iii = 0
#      window.$(h2).next('h3').nextUntil('h2,h1').add(window.$(h2).next('h3')).filter('h3,h4').toArray().map (h3) ->
#        contents += "<div class=\"#{if iii % 2 is 0 then 'even' else 'odd'}\"><#{h3.tagName.toLowerCase()}>" + process_toc_signature(h3.innerHTML) + "</#{h3.tagName.toLowerCase()}></div>"
#        ++iii
#      contents += "</td>"
#      ++ii
#    contents += "</tr>"
#  """
#    <div id="api_toc"><table><tbody>#{contents}</tbody></table></div>
#  """

syntax_highlight = (window) ->
  window.$('pre').addClass('highlighted')
  window.$('code').addClass('javascript')
  window.$('.javascript').each (i,element) ->
    try
      source = decode_html_entities element.innerHTML
      console.log "attemping to compile source snippet:"
      console.log "------------------------------------"
      console.log source
      console.log ''
      js = CoffeeScript.compile(source,bare: true)
    catch e
      console.log "Failed to compile: \n #{js}"
      console.log e
      throw e
    window.$('<code class="javascript">' + js + '</code>').insertAfter(element)
  window.dp.sh.HighlightAll('javascript',false,false,false,true,false)
  window.$('ol.javascript').each (i,element) ->
    window.$(element).addClass('coffeescript').removeClass('javascript') if i % 2 is 0
  window.$('code.javascript').remove()

create_nav = (window) ->
  window.$('h1:first').after """
    <ul id="nav">
      <li><a href="#" id="intro">Intro</a></li>
      <li><a href="#" id="client">Client</a></li>
      <li><a href="#" id="server">Server</a></li>
      <li><a href="https://github.com/syntacticx/viewjs/">Source</a></li>
    </ul>
    <ul id="controls">
      <li><a href="#" id="coffeescript">Show JavaScript</a></li>
      <li><a href="#" id="api_quickview">Show API Only</a></li>
    </ul>
    <br class="clear"/>
  """

get_html_translation_table = ->
  entities = {}
  hash_map = {}
  entities['38'] = '&amp;';
  entities['160'] = '&nbsp;';
  entities['161'] = '&iexcl;';
  entities['162'] = '&cent;';
  entities['163'] = '&pound;';
  entities['164'] = '&curren;';
  entities['165'] = '&yen;';
  entities['166'] = '&brvbar;';
  entities['167'] = '&sect;';
  entities['168'] = '&uml;';
  entities['169'] = '&copy;';
  entities['170'] = '&ordf;';
  entities['171'] = '&laquo;';
  entities['172'] = '&not;';
  entities['173'] = '&shy;';
  entities['174'] = '&reg;';
  entities['175'] = '&macr;';
  entities['176'] = '&deg;';
  entities['177'] = '&plusmn;';
  entities['178'] = '&sup2;';
  entities['179'] = '&sup3;';
  entities['180'] = '&acute;';
  entities['181'] = '&micro;';
  entities['182'] = '&para;';
  entities['183'] = '&middot;';
  entities['184'] = '&cedil;';
  entities['185'] = '&sup1;';
  entities['186'] = '&ordm;';
  entities['187'] = '&raquo;';
  entities['188'] = '&frac14;';
  entities['189'] = '&frac12;';
  entities['190'] = '&frac34;';
  entities['191'] = '&iquest;';
  entities['192'] = '&Agrave;';
  entities['193'] = '&Aacute;';
  entities['194'] = '&Acirc;';
  entities['195'] = '&Atilde;';
  entities['196'] = '&Auml;';
  entities['197'] = '&Aring;';
  entities['198'] = '&AElig;';
  entities['199'] = '&Ccedil;';
  entities['200'] = '&Egrave;';
  entities['201'] = '&Eacute;';
  entities['202'] = '&Ecirc;';
  entities['203'] = '&Euml;';
  entities['204'] = '&Igrave;';
  entities['205'] = '&Iacute;';
  entities['206'] = '&Icirc;';
  entities['207'] = '&Iuml;';
  entities['208'] = '&ETH;';
  entities['209'] = '&Ntilde;';
  entities['210'] = '&Ograve;';
  entities['211'] = '&Oacute;';
  entities['212'] = '&Ocirc;';
  entities['213'] = '&Otilde;';
  entities['214'] = '&Ouml;';
  entities['215'] = '&times;';
  entities['216'] = '&Oslash;';
  entities['217'] = '&Ugrave;';
  entities['218'] = '&Uacute;';
  entities['219'] = '&Ucirc;';
  entities['220'] = '&Uuml;';
  entities['221'] = '&Yacute;';
  entities['222'] = '&THORN;';
  entities['223'] = '&szlig;';
  entities['224'] = '&agrave;';
  entities['225'] = '&aacute;';
  entities['226'] = '&acirc;';
  entities['227'] = '&atilde;';
  entities['228'] = '&auml;';
  entities['229'] = '&aring;';
  entities['230'] = '&aelig;';
  entities['231'] = '&ccedil;';
  entities['232'] = '&egrave;';
  entities['233'] = '&eacute;';
  entities['234'] = '&ecirc;';
  entities['235'] = '&euml;';
  entities['236'] = '&igrave;';
  entities['237'] = '&iacute;';
  entities['238'] = '&icirc;';
  entities['239'] = '&iuml;';
  entities['240'] = '&eth;';
  entities['241'] = '&ntilde;';
  entities['242'] = '&ograve;';
  entities['243'] = '&oacute;';
  entities['244'] = '&ocirc;';
  entities['245'] = '&otilde;';
  entities['246'] = '&ouml;';
  entities['247'] = '&divide;';
  entities['248'] = '&oslash;';
  entities['249'] = '&ugrave;';
  entities['250'] = '&uacute;';
  entities['251'] = '&ucirc;';
  entities['252'] = '&uuml;';
  entities['253'] = '&yacute;';
  entities['254'] = '&thorn;';
  entities['255'] = '&yuml;';
  entities['34'] = '&quot;';
  entities['60'] = '&lt;';
  entities['62'] = '&gt;';
  for decimal of entities
    symbol = String.fromCharCode(decimal);
    hash_map[symbol] = entities[decimal];
  hash_map

decode_html_entities = (string) ->
  hash_map = {}
  symbol = ''
  tmp_str = ''
  entity = ''
  tmp_str = string.toString()
  hash_map = get_html_translation_table()
  delete hash_map['&']
  hash_map['&'] = '&amp;'
  for symbol of hash_map
    entity = hash_map[symbol];
    tmp_str = tmp_str.split(entity).join(symbol)
  tmp_str = tmp_str.split('&#039;').join("'")
  tmp_str
  
template = (options) -> """
<!DOCTYPE html>
<html>
  <head>
    <title>ViewJS: Markup as JavaScript</title> 
    <link type="text/css" rel="stylesheet" href="stylesheets/syntax.css"/>
    <link type="text/css" rel="stylesheet" href="stylesheets/screen.css"/>
    <script type="text/javascript" src="javascripts/jquery.js"></script>
    <script type="text/javascript" src="javascripts/docs.js"></script>
    <script type="text/javascript" src="http://use.typekit.com/tqz3zpc.js"></script>
  </head> 
  <body> 
    <div id="content">
      <div id="main">
        #{options.content}
      </div>
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