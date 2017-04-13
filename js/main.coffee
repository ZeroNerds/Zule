class Zule extends Class
  constructor: ->
    @log "Zule is launching"
    @bind()
    @view="main"
    @
  focus: (what) =>
    setTimeout (=> $(what).focus()),100

    #for e in [0...1000] by 10
    #  setTimeout (=> $(what).unfocus().focus()),e
  onSearch: (q) =>

  eventHandler: (e) =>
    if e.type.startsWith("key") && e.keyCode!=13
      return
    @log "Event",e
    if @view=="main"
      val=$("#search_home").val()
      $("#search_home").val("")
      $("#search").val(val)
    else
      val=$("#search").val()
    if val
      if @view=="main"
        $(".front").hide()
        $(".main").show()
        @focus "#search_home"
        @view="search"
    else
      if @view=="search"
        $(".main").hide()
        $(".front").show()
        @focus "#search"
        @view="main"
    return false

  bind: =>
    @log "Binding Events"
    $(".search-input").keypress(@eventHandler).keyup(@eventHandler).keydown(@eventHandler)
    $("#search_home").attr("autofocus","autofocus").focus()
    $("#search").attr("autofocus","autofocus")
    $(".search-submit").click(@eventHandler)

window.Page=new Zule()
