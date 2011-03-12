# Builder
#########
tag = (tag_name) ->
  elements = []
  attributes = {}
  for argument in array_from(arguments)[1..]
    process_node_argument @, elements, attributes, argument
  tag_name = tag_name.toLowerCase()
  if ie and (attributes.name or (tag_name is 'input' && attributes.type))
    # ie needs these attributes to be written in the string passed to createElement
    tag = '<' + tag_name;
    if attributes.name
      tag += ' name="' + attributes.name + '"'
    if tag_name is 'input' and attributes.type
      tag += ' type="' + attributes.type + '"'
    tag += '>'
    delete attributes.name
    delete attributes.type
    element = @document.createElement tag
  else
    if not element_cache[tag_name]
      element_cache[tag_name] = @document.createElement tag_name
    element = element_cache[tag_name].cloneNode false

  #write_attribute
  for attribute_name of attributes
    name = attribute_translations[attribute_name] or attribute_name
    # check if things need to be remapped for IE (Some stuff has been fixed when IE > 7)
    if ie and ie_attribute_translations[name]
      if ie_attribute_translation_sniffing_cache[name]?
        name = ie_attribute_translations[name]
      else
        test_element = @document.createElement 'div'
        test_element.setAttribute name, 'test'
        if test_element[ie_attribute_translations[name]] isnt 'test'
          test_element.setAttribute ie_attribute_translations[name], 'test'
          if ie_attribute_translation_sniffing_cache[name] = test_element[ie_attribute_translations[name]] is 'test'
            name = ie_attribute_translations[name]
    value = attributes[attribute_name]
    if value is false or not value?
      element.removeAttribute name
    else if value is true
      element.setAttribute name, name
    else if name is 'style'
      element.style.cssText = value
    else
      element.setAttribute name, value
  # end write attribute

  for _element in elements
    if is_element _element
      element.appendChild _element
    else
      element.appendChild @document.createTextNode String _element
  element
  
View.extend tag: ->
  tag.apply @, arguments

process_node_argument = (view,elements,attributes,argument) ->
  return if not argument? or argument is false
  if typeof argument is 'function'
    argument = argument.call view
  if is_view argument
    return elements.push argument[0]
  if is_$ argument
    return elements.push _element for _element in argument
  if is_element argument
    return elements.push argument
  #is attributes?
  if typeof argument isnt 'string' and typeof argument isnt 'number' and not is_array(argument) and not is_$(argument) and not is_element(argument)
    for attribute_name, attribute of argument
      attributes[attribute_name] = attribute
    return
  if argument.toArray? and typeof argument.toArray is 'function'
    argument = argument.toArray()
  if is_array argument
    flattened = array_flatten argument
    for flattened_argument in flattened
      process_node_argument.call @, view, elements, attributes, flattened_argument
    return
  if is_element(argument) or typeof argument is 'string' or typeof argument is 'number'
    elements.push argument

ie = window? && !!(window.attachEvent and not window.opera)

ie_attribute_translations =
  class: 'className'
  checked: 'defaultChecked'
  usemap: 'useMap'
  for: 'htmlFor'
  readonly: 'readOnly'
  colspan: 'colSpan'
  bgcolor: 'bgColor'
  cellspacing: 'cellSpacing'
  cellpadding: 'cellPadding'

ie_attribute_translation_sniffing_cache = {}

attribute_translations =
  className: 'class'
  htmlFor:   'for'

element_cache = {}

supported_events = 'blur focus focusin focusout load resize scroll unload click dblclick
	mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave
	change select submit keydown keypress keyup error'.split /\s+/m

supported_html_tags = 'a abbr acronym address applet area b base basefont bdo big blockquote body
  br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset
  font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex
  kbd label legend li link menu meta nobr noframes noscript object ol optgroup option p
  param pre q s samp script select small span strike strong style sub sup table tbody td
  textarea tfoot th thead title tr tt u ul var
  article aside audio command details figcaption figure footer header hgroup keygen mark
  meter nav output progress rp ruby section source summary time video'.split /\s+/m

attribute_map =
  htmlFor: 'for'
  className: 'class'

Builder = {}
for tag_name in supported_html_tags
  do (tag_name) ->
    Builder[tag_name] = ->
      tag.apply @, [tag_name].concat array_from arguments    
