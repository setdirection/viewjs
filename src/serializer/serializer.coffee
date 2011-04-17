# Serializer
############
timeout_length = 5000 # if the request can't complete in a reasonable amount of time dump the output
{jsdom} = require 'jsdom'
{XMLHttpRequest} = require 'xmlhttprequest'

create_empty_document = ->
  jsdom '<html><head></head><body></body></html>'

ViewSerializer =
  setup: (options) ->
    {@stylesheets,@javascripts,@execute,@public,@domain,@routes,@url,@meta} = options
    
  renderWindow: (window) ->
    output = window.document.documentElement.innerHTML
    #append stylesheets
    stylesheets = (@stylesheets || []).map (href) =>
      """<link rel="stylesheet" type="text/css" href="#{href.replace(@public,'/')}"/>"""
    javascripts = (@javascripts || []).map (src) =>
      script_output = """<script type="text/javascript" src="#{src.replace(@public,'/')}"/></script>"""
      if src.match(/(^|\/)view\.js$/)
        script_output += """<script type="text/javascript">
          View.extend({
            routes: #{JSON.stringify @routes}
          });
          window.domain = "#{@domain}";
        </script>
        """
      script_output
    @meta.push "<title>#{window.document.title}</title>" if window.document.title?
    output = output.replace(/<head>/,"<head>" + @meta.join('') + javascripts.join('') + stylesheets.join(''))
    """
      <!DOCTYPE html>
      <html>
        #{output}
      </html>
    """
    
  createWindow: (callback) ->
    document = create_empty_document()
    window = document.createWindow()
    window.domain = @domain
    window.XMLHttpRequest = XMLHttpRequest
    window.document.implementation.addFeature 'MutationEvents', ['1.0']
    window.document.implementation.addFeature 'FetchExternalResources', ['script']
    window.document.implementation.addFeature 'ProcessExternalResources', ['script']
    executables = @execute
    add_script = =>
      script = executables.shift()
      if script
        do (script) =>
          tag = window.document.createElement 'script'
          tag.onload = =>
            #TODO: refactor
            if script.match /(^|\/)view\.js$/
              window.View.extend
                routes: @routes
            tag.parentNode.removeChild tag
            add_script()
          tag.type = 'text/javascript'
          tag.src = script
          window.document.head.appendChild tag
      else
        callback.call @, window
    if executables.length > 0
      add_script()
    else
      callback.call @, window
  
  serialize: (callback) ->
    @createWindow (window) =>
      timeout = null
      complete = =>
        clearTimeout timeout
        callback @renderWindow window
        process.exit 0
      if window.View?
        window.View.extend on:route: complete
        window.View.extend route: @url
      else
        complete()
      #force a response if on:route is never called
      setTimeout ->
        complete()
        process.exit 1
      , @maxExecutionTime || 5000
ViewSerializer.setup JSON.parse process.argv[2]
ViewSerializer.serialize (output) ->
  process.stdout.write output