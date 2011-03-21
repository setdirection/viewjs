# Stylesheets
#############
ViewServer.extend stylesheets: (stylesheets) ->
  @_stylesheets ||= []
  add_style = (style) =>
    @_stylesheets.push style if not (style in @stylesheets)
  styles = array_flatten array_from arguments
  for style in stylesheets
    if is_directory style
      files_with_extension(style, /\.css$/).map add_style
    else
      add_style style

ViewServer.extend extend:stylesheets: (stylesheets) ->
  @stylesheets stylesheets