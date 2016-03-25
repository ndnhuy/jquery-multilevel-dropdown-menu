/**
 *  @name plugin
 *  @description description
 *  @version 1.0
 *  @options
 *    option
 *  @events
 *    event
 *  @methods
 *    init
 *    publicMethod
 *    destroy
 */
;(function($, window, undefined) {
  'use strict';

  var pluginName = 'multilevelDropdownMenu';
  var privateVar = null;

  var dropdownSubMenu = function(subMenu) {
    console.log('down');
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-top': 0
    }, 'fast');
  }
  var upAndHideSubMenu = function(subMenu) {
    console.log('up');
    // the subMenu of this 'li' is slide up and disapear
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-top': subMenu.outerHeight()*-1
    }, 'fast');
  }

  var slideLeftSubMenu = function(subMenu) {
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-left': subMenu.outerWidth()*-1
    }, 'fast');
  }

  var slideRightSubMenu = function(subMenu) {
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-left': 0
    }, 'fast');
  }

  var separateAndWrapULChild = function(liElement, firstSubmenu) {

    if (liElement.children().length === 0) return;


    var subMenuWrapper = $('<div></div>').clone();
    var subMenu = liElement.find('ul:first');
    subMenuWrapper.append(subMenu);
    subMenuWrapper.appendTo($(document.body));

    

    if (firstSubmenu) {
      var top = parseInt(liElement.offset().top) + parseInt(liElement.css('height')) + 'px';
      // position sub-menu-wrapper in bottom of liElement.
      // this is also where the subMenu is placed when showing.
      subMenuWrapper.css({
        position: 'absolute',
        overflow: 'hidden',
        top: top
      });

      // hide the subMenu
      subMenu.css({
        'margin-top': subMenu.height()*-1
      });


      liElement.add(subMenu).hover(function() {
        dropdownSubMenu(subMenu);
      }, 
      function() {
        upAndHideSubMenu(subMenu);
      });
    }
    else {
      // console.log(liElement.parent().height());
      // subMenuWrapper.css({
      //   position: 'absolute',
      //   overlow: 'hidden',
      //   top: liElement.offset().top + liElement.parent().height(),
      //   left: liElement.offset().left + liElement.width()
      // });
    }

    

    // Continue wrap the ul inside this liElement
    separateAndWrapULChild(subMenu.children().eq(0), false);
    
  }

  var testAlgorithm = function(liElement, firstSubmenu) {
    var subMenuWrapper = $('<div></div>').clone();
    var subMenu = liElement.find('ul:first');
    subMenuWrapper.append(subMenu);
    subMenuWrapper.appendTo($(document.body));

    if (firstSubmenu) {
      subMenuWrapper.addClass('first-sub-menu');
    }

    liElement.data('child', subMenuWrapper).addClass('parent');
    subMenuWrapper.data('parent', liElement).addClass('child');

    subMenu.children().each(function() {
      var ul = $(this).find('ul:first');
      if (ul.length > 0) {
        testAlgorithm($(this), false);
      }
    });
  }

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this;

      that.hugeMenu = that.element;

      var firstSubmenu = true;
      testAlgorithm(that.hugeMenu.children().eq(0), firstSubmenu);

      $('.child').each(function() {
        var liElement = $(this).data('parent');

        if ($(this).hasClass('first-sub-menu')) {
          var top = parseInt(liElement.offset().top) + parseInt(liElement.css('height')) + 'px';
          $(this).css({
            position: 'absolute',
            overflow: 'hidden',
            top: top,
            left: liElement.offset().left
          });

          var subMenu = $(this).children();

          subMenu.css('margin', 0);
          subMenu.css('padding', 0);

          liElement.add(subMenu).hover(function() {
            dropdownSubMenu(subMenu);
          }, 
          function() {
            upAndHideSubMenu(subMenu);
          });
        }
        else {
          $(this).css({
            position: 'absolute',
            top: liElement.offset().top,
            left: parseInt(liElement.offset().left) + parseInt(liElement.outerWidth()),
            overflow: 'hidden'
          });

          var subMenu = $(this).children();
          subMenu.css('margin', 0);
          subMenu.css('padding', 0);

          liElement.add(subMenu).hover(function() {
            slideRightSubMenu(subMenu);
          }, 
          function() {
            slideLeftSubMenu(subMenu);
          });

        }

        
      });


      // var height = $('.first-sub-menu').children().outerHeight();
      // $('.first-sub-menu').children().css({
      //   'margin-top': height*-1
      // });


      
    },
   
    destroy: function() {
      // remove events
      // deinitialize
      $.removeData(this.element[0], pluginName);
    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      }
    });
  };

  $.fn[pluginName].defaults = {
    key: 'value',
    onCallback: null
  };

  $(function() {
    $('[data-' + pluginName + ']').on('customEvent', function() {
      // to do
    });

    $('[data-' + pluginName + ']')[pluginName]({
      key: 'custom'
    });
  });

}(jQuery, window));
