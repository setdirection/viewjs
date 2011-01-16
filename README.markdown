jQuery View
===========
Markup as JavaScript **[Development](https://github.com/syntacticx/viewjs/zipball/master) | [Production (6KB)](https://github.com/syntacticx/viewjs/raw/master/jquery.view.min.js)**  


jQuery View provides a class and inheritance system for templates which can be constructed with a mix of pure JavaScript, HTML strings, jQuery templates and jQuery objects:

    ListView = $.view(function(){
      return this.ul( //pure JavaScript
        $(this.li('Item Three')).click(this.handleClick) //inline jQuery
      );
    },{
      //methods are auto proxied, "this" is always the view
      handleClick: function(event){}
    });
    //use views as arguments to jQuery
    var instance = new ListView({key:'Item Two'});
    $(instance).appendTo('body');

Works well with [jQuery Routes](http://routesjs.com/).
