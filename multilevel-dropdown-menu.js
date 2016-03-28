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

  var FIRST_SUB_MENU = 'first-sub-menu';
  var PARENT_MENU = 'parent';
  var CHILD_SUBMENU = 'child';
  var MULTI_DROPDOWN_MENU_ITEM = 'multilevel-dropdown-menu-item';

  var duration = 'fast';

  var dropdownSubMenu = function(subMenu) {
    subMenu.addClass('showing');
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-top': 0
    }, duration);
  }
  var upAndHideSubMenu = function(subMenu) {
    // the subMenu of this 'li' is slide up and disapear
    subMenu.removeClass('showing');
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-top': subMenu.outerHeight()*-1
    }, duration);
  }

  var slideLeftSubMenu = function(subMenu) {
    subMenu.removeClass('showing');
    subMenu.css('display', 'none');
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-left': subMenu.outerWidth()*-1,
    }, duration);
  }

  var slideRightSubMenu = function(subMenu) {
    subMenu.addClass('showing');
    subMenu.css('display', 'block');
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-left': 0
    }, duration);
  }

  /*
  * Wrap submenu <ul></ul> inside given <li></li> up into a <div></div>
  * and split.
  */
  var wrapSubMenuUpAndSplitThem = function(mainMenu, liElement, isFirstSubmenu) {
    var subMenu = liElement.find('ul:first');
    var subMenuWrapper = $('<div></div>').clone()
                                          .append(subMenu)
                                          .appendTo(mainMenu)
                                          .data(PARENT_MENU, liElement)
                                          .addClass(CHILD_SUBMENU);

    if (isFirstSubmenu) {
      subMenuWrapper.addClass(FIRST_SUB_MENU);
      liElement.on('mouseleave', function() {
        $('.' + MULTI_DROPDOWN_MENU_ITEM).filter('.active').filter(function() {
          return $(this).data('level') > 0;
        })
        .each(function() {
          // Close the submenu of this <li> element and then remove class 'active' out of it
          if ($(this).data(CHILD_SUBMENU) != null) {
            $(this).removeClass('active');
            slideLeftSubMenu($(this).data(CHILD_SUBMENU).children());
          }
        });
        liElement.removeClass('active');
        upAndHideSubMenu(subMenu);
      });
    }

    liElement.data(CHILD_SUBMENU, subMenuWrapper)
             .addClass(PARENT_MENU);

    // Continue doing this for each 'li' inside submenu
    var level = liElement.data('level');
    subMenu.children().each(function() {
      $(this).data('level', level+1);
      if (hasAtLeastOneSubMenuInside($(this))) {
        wrapSubMenuUpAndSplitThem(mainMenu, $(this), false);
      }
    });
  }

  var hasAtLeastOneSubMenuInside = function(liElement) {
    return liElement.find('ul:first').length > 0;
  }

  var setUpMovement2 = function(mainMenu) {

    mainMenu.delegate('.' + MULTI_DROPDOWN_MENU_ITEM, 'mouseenter', function() {

      var currentEnteredElement = $(this);

      // Allow onely one main-submenu is active
      if (currentEnteredElement.parent().is(mainMenu)) {
        mainMenu.children().filter('.active').mouseleave();
      }

      var prevEnteredElement = mainMenu.data('current-selected-item');
      if (prevEnteredElement == null) {
        mainMenu.data('current-selected-item', $(this));
        prevEnteredElement = currentEnteredElement;
      }


      if (!currentEnteredElement.parent().hasClass('showing') && currentEnteredElement.data('level') > 0) {
        currentEnteredElement.parent().parent().data(PARENT_MENU).addClass('active');
        slideRightSubMenu(currentEnteredElement.parent());
      }

      if (currentEnteredElement.data(CHILD_SUBMENU) != null) {
        currentEnteredElement.addClass('active');
        if (currentEnteredElement.data(CHILD_SUBMENU).hasClass(FIRST_SUB_MENU)) {
          dropdownSubMenu(currentEnteredElement.data(CHILD_SUBMENU).children());
          return;
        }
        else {
          slideRightSubMenu(currentEnteredElement.data(CHILD_SUBMENU).children());
        }

        mainMenu.data('current-selected-item', currentEnteredElement);
      }

      var parentOfCurrent = currentEnteredElement.parent().parent().data(PARENT_MENU);
      if (parentOfCurrent.is(prevEnteredElement)) {
        mainMenu.data('current-selected-item', currentEnteredElement);
      }
      else {
        // Close submenu of all the 'active' li has level higher than the current one.
        $('.' + MULTI_DROPDOWN_MENU_ITEM).filter('.active').filter(function() {
          return $(this).data('level') >= currentEnteredElement.data('level') && !$(this).is(currentEnteredElement);
        })
        .each(function() {
          // Close the submenu of this <li> element and then remove class 'active' out of it
          if ($(this).data(CHILD_SUBMENU) != null) {
            $(this).removeClass('active');
            slideLeftSubMenu($(this).data(CHILD_SUBMENU).children());
          }
        });
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

      that.mainMenu = that.element;

      var isFirstSubmenu = true;

      //TODO refactor to apply this line of code in case there're many menus
      that.mainMenu.children().filter('li').each(function() {
         $(this).data('level', 0);
         wrapSubMenuUpAndSplitThem(that.mainMenu, $(this), isFirstSubmenu);
      });

      // that.mainMenu.children().eq(0).data('level', 0);
      // wrapSubMenuUpAndSplitThem(that.mainMenu, that.mainMenu.children().eq(0), isFirstSubmenu);

      $('.child').each(function() {
        var liElement = $(this).data(PARENT_MENU);
        var subMenu = $(this).children();
        subMenu.css({
            margin: 0,
            padding: 0
        });

        if ($(this).hasClass(FIRST_SUB_MENU)) {
          var top = parseInt(liElement.offset().top) + parseInt(liElement.css('height')) + 'px';
          $(this).css({
            position: 'absolute',
            overflow: 'hidden',
            top: top,
            left: liElement.offset().left
          });


        }
        else {
          $(this).css({
            position: 'absolute',
            top: liElement.offset().top,
            left: parseInt(liElement.offset().left) + parseInt(liElement.outerWidth()),
            overflow: 'hidden'
          });
        }
        //setUpMovement($(this));
        
      });

      that.mainMenu.find('li').addClass(MULTI_DROPDOWN_MENU_ITEM);
      setUpMovement2(that.mainMenu);


      
      var height = $('.' + FIRST_SUB_MENU).children().outerHeight();
      $('.' + FIRST_SUB_MENU).children().css({
        'margin-top': height*-1
      });

      $('.' + CHILD_SUBMENU + ':not(.' + FIRST_SUB_MENU + ')').children().each(function() {
        var width = $(this).outerWidth();
        $(this).css({
          'margin-left': width*-1,
          display: 'none'
        });
      });


      that.mainMenu.on('mousemove', function(e) {
        e.stopPropagation();
      });

      $('html').on('mousemove', function(e) {
                $('.' + MULTI_DROPDOWN_MENU_ITEM).filter('.active').each(function() {
                  $(this).removeClass('active');
                  if ($(this).data(CHILD_SUBMENU).hasClass(FIRST_SUB_MENU)) {
                    upAndHideSubMenu($(this).data(CHILD_SUBMENU).children());
                  }
                  else {
                    slideLeftSubMenu($(this).data(CHILD_SUBMENU).children());
                }
              })
      });


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
