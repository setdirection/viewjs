# Router
########
router_initialized = false
routes_by_path = {}
routes_by_view = {}
routes_regexps_by_path = {}
named_param = /:([\w\d]+)/g
splat_param = /\*([\w\d]+)/g

Router =
  _lastActiveViewName: false
  _initializedViews: {}
  _views: [] # names
  mixin: []
  
RouteResolver = ->
  silent = arguments[1]? and arguments[1].silent is true
  #if just a string view name is passed
  if typeof arguments[0] is 'string' and ViewManager.views[arguments[0]]?
    router_params = {}
    router_params[arguments[0]] = {}
    arguments[0] = router_params
    
  #url string from object View: params
  if typeof arguments[0] is 'object'
    for view, params of arguments[0]
      params = params_from_ordered_params_and_route params, routes_by_view[view] if is_array params
      url = String(routes_by_view[view])
      url = url.replace(/\*/,params.path.replace(/^\//,'')) if params.path
      param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?(\\?)?(/|$)','g')
      for param_name of params
        url = url.replace param_matcher, ->
          if arguments[2] is param_name
            params[param_name] + arguments[5]
          else
            (arguments[1] || '') + ':' + arguments[2] + (arguments[3] || '') + (arguments[4] || '') + arguments[5]
      #remove :key?
      optional_param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?\\?(/|$)','g')
      url = url.replace optional_param_matcher, ''
      if typeof arguments[1] is 'function'
        dispatcher ViewManager(view), params, arguments[1]
      return url.replace(/\([^\)]+\)/g,'')
      
  #return an object with params from a url string
  else if typeof arguments[0] is 'string'
    fragment = arguments[0]
    for path, view of routes_by_path
      if routes_regexps_by_path[path].test fragment
        ordered_params = routes_regexps_by_path[path].exec(fragment).slice(1)
        params = params_from_ordered_params_and_route ordered_params, path
        response = {}
        response[view] = params
        if typeof arguments[1] is 'function'
          dispatcher ViewManager(view), params, arguments[1]
        return response
    if silent
      return false
    else
      View.trigger 'error', 'Could not resolve the url: ' + arguments[0] 

View.extend extend:route: (route,discard) ->
  #called from ViewServer
  RouteResolver route, ->
  discard()

View.extend extend:routes: (routes,discard) ->
  dependent_views = []
  for path,view of routes
    dependent_views.push view
    routes_by_path[path] = view
    regexp = '^' + path.replace(named_param, "([^\/]*)").replace(splat_param, "(.*?)") + '$'
    routes_regexps_by_path[path] = new RegExp regexp
    routes_by_view[view] = path
    Router._views.push view
  View.env browser: ->
    create_router()
  Router.mixin.push ['initialize', (next) ->
    Router.view = @
    @router = []
    for view in dependent_views
      @router.push ViewManager view
    @on ready: ->
      for view in dependent_views
        add_default_activation_events ViewManager view
      View.env browser: ->
        History.Adapter.trigger window, 'statechange'
        #History.pushState null, String(Math.random()), window.location.href
    next()
  ]
  discard()
  
View.extend url: (params) ->
  params_contain_view_name = (params) ->
    key_count = 0
    for param_name of params
      ++key_count
    key_count is 1 and ViewManager.views[param_name]?
  if params_contain_view_name params
    router_params = params
  else
    router_params = {}
    router_params[@name] = {}
    extend router_params[@name], @attributes
    extend router_params[@name], params || {}
  RouteResolver router_params

add_default_activation_events = (view_instance) ->
  hide = ->
    @[0].style.display = 'none'
  show = ->
    @[0].style.display = null
  remove = ->
    @[0].parentNode.removeChild @[0]
  noop = ->
  view_instance.bind
    activated: ->
      @env
        test: show
        browser: show
        server: noop
    deactivated: ->
      @env
        test: hide
        browser: hide
        server: remove
  view_instance.env
    test: hide
    browser: hide
  
#TODO: remove jQuery dependency
create_router = ->
  root_url = History.getRootUrl()
  $('a').live 'click', (event) ->
    href = $(@).attr('href')
    # Continue as normal for cmd clicks etc, external links or if history has been disabled
    return true if event.which is 2 or event.metaKey or /:\/\//.test(href) or not History.enabled
    if RouteResolver(href, silent: true)
      History.pushState null, '', href
      event.preventDefault()
      false
    else
      true
  History.Adapter.bind window, 'statechange', ->
    state = History.getState()
    url = state.url.replace root_url, '/'
    pageTracker._trackPageview url if pageTracker?
    #will trigger the dispatcher
    RouteResolver url, ->
    
has_change_callback = (view) ->
  return false if not view._callbacks?
  for event_name of view._callbacks
    if event_name is 'change' or event_name.match /^change\:/
      return true if view._callbacks[event_name].length > 0
  false

dispatcher = (view_instance,params,callback) ->
  did_change = false
  did_change_observer = ->
    did_change = true
  ensure_parent_node = ->
    if not view_instance[0].parentNode
      view_instance.trigger 'error', 'This view is part of a Router, and must be attched to a parent node.'
  next = ->
    was_called = false
    router_view_ready = ->
      was_called = true
      Router.view.unbind 'ready', router_view_ready
      view_instance.unbind 'render', next
      for _view in (view_instance.views || [])
        _view_instance = ViewManager _view
        _view_instance.unbind 'render', next
      ViewManager(Router._lastActivatedView).trigger 'deactivated' if Router._lastActivatedView
      view_instance.trigger 'activated'
      Router._lastActivatedView = view_instance.name
      callback.call view_instance, view_instance, params
      View.trigger 'route', view_instance
      View.trigger 'route:' + view_instance.name, view_instance
    Router.view.bind 'ready', router_view_ready
  dispatch = ->
    view_instance.bind 'render', next
    for _view in (view_instance.views || [])
      _view_instance = ViewManager _view
      _view_instance.bind 'render', next
    view_instance.bind 'change', did_change_observer
    view_instance.set params
    view_instance.unbind 'change', did_change_observer
    if not did_change
      next()
    else if not has_change_callback view_instance
      view_instance.trigger 'error', 'View with route must respond to a change, or change:key event with a render() call.'
  if !Router._initializedViews[view_instance.name]
    Router._initializedViews[view_instance.name] = true
    view_instance.bind ready: dispatch
    view_instance.initialize()
  else
    dispatch()

params_from_ordered_params_and_route = (ordered_params,route) ->
  params = {}
  keys = []
  String(route)
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, (_, slash, format, key, capture, optional) ->
      keys.push key
    )
  for key, i in keys
    params[key] = ordered_params[i]
  params
