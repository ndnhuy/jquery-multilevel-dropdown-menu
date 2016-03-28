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


  var dropdownSubMenu = function(subMenu, duration) {
    subMenu.addClass('showing');
    subMenu.css('display', 'block');
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-top': 0
    }, duration);
  }
  var upAndHideSubMenu = function(subMenu, duration) {
    // the subMenu of this 'li' is slide up and disapear
    subMenu.removeClass('showing');

    subMenu.stop(true, false);
    subMenu.animate({
      'margin-top': subMenu.outerHeight()*-1
    }, duration, function() {
      subMenu.css('display', 'none');
    });
  }

  var slideLeftSubMenu = function(subMenu, duration) {
    subMenu.removeClass('showing');
    
    subMenu.stop(true, false);
    subMenu.animate({
      'margin-left': subMenu.outerWidth()*-1,
    }, duration, function() {
      subMenu.css('display', 'none');
    });
  }

  var slideRightSubMenu = function(subMenu, duration) {
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

  var setUpMovement = function(mainMenu, options) {

    mainMenu.find('li').addClass(MULTI_DROPDOWN_MENU_ITEM);

    mainMenu.delegate('.' + MULTI_DROPDOWN_MENU_ITEM, 'mouseenter', function() {

      var currentEnteredElement = $(this);
      var parentSubMenu = currentEnteredElement.parent();
      var subMenuWrapper = parentSubMenu.parent();


      var prevEnteredElement = mainMenu.data('current-selected-item');
      mainMenu.data('current-selected-item', currentEnteredElement);
      if (prevEnteredElement == null) {
        //mainMenu.data('current-selected-item', $(this));
        prevEnteredElement = currentEnteredElement;
      }

      if (!parentSubMenu.hasClass('showing') && currentEnteredElement.data('level') > 0) {
        //TODO refactor subMenuWrapper.data(PARENT_MENU). Need to differentiate the parentSubMenu and childSubMenu
        showOrCloseSubMenu(subMenuWrapper.data(PARENT_MENU), true, options);
        // show up all parents of this element
        var traverseVar = subMenuWrapper.data(PARENT_MENU)
                                        .parent().parent().data(PARENT_MENU);
        while (traverseVar != null) {
          showOrCloseSubMenu(traverseVar, true, options);
          traverseVar = traverseVar.parent().parent().data(PARENT_MENU);
        }
      }

      var parentOfCurrent = subMenuWrapper.data(PARENT_MENU);
      if (parentOfCurrent == null) {
         closeChildSubMenusOfMenuItem(currentEnteredElement, options);
      }
      else {
         if (!parentOfCurrent.is(prevEnteredElement)) {
           if (currentEnteredElement.data('level') === prevEnteredElement.data('level')
                  && !currentEnteredElement.parent().is(prevEnteredElement.parent())) {
            closeChildSubMenusOfMenuItem(currentEnteredElement.parent().parent().data(PARENT_MENU), options);
           //showOrCloseSubMenu(prevEnteredElement.parent().parent().data(PARENT_MENU), false);
            
           }
           else {
            closeChildSubMenusOfMenuItem(currentEnteredElement, options);
           }
           
         }
      }

      if (currentEnteredElement.data(CHILD_SUBMENU) != null) {
        currentEnteredElement.addClass('active');
        if (currentEnteredElement.data(CHILD_SUBMENU).hasClass(FIRST_SUB_MENU)) {
          dropdownSubMenu(currentEnteredElement.data(CHILD_SUBMENU).children(), options.duration);
        }
        else {
          slideRightSubMenu(currentEnteredElement.data(CHILD_SUBMENU).children(), options.duration);
        }

      }


     
    });

    // Hide all submenu when enterning outside
    mainMenu.on('mousemove', function(e) {
      e.stopPropagation();
    });

    $('html').on('mousemove', function(e) {
              $('.' + MULTI_DROPDOWN_MENU_ITEM).filter('.active').each(function() {
                $(this).removeClass('active');
                if ($(this).data(CHILD_SUBMENU).hasClass(FIRST_SUB_MENU)) {
                  upAndHideSubMenu($(this).data(CHILD_SUBMENU).children(), options.duration);
                }
                else {
                  slideLeftSubMenu($(this).data(CHILD_SUBMENU).children(), options.duration);
              }
            })
    });
  }

  var closeChildSubMenusOfMenuItem = function(menuItem, options) {
    // Close submenu of all the 'active' li has level higher than or equal the current one
    $('.' + MULTI_DROPDOWN_MENU_ITEM).filter('.active').filter(function() {
      return $(this).data('level') >= menuItem.data('level') && !$(this).is(menuItem);
    })
    .each(function() {
      // Close the submenu of this <li> element and then remove class 'active' out of it
      showOrCloseSubMenu($(this), false, options);
    });
  }

  var showOrCloseSubMenu = function(menuItem, toShow, options) {
    
    toShow === true? menuItem.addClass('active') : menuItem.removeClass('active');

    var childSubMenu = menuItem.data(CHILD_SUBMENU);
    if (childSubMenu != null) {
      if (childSubMenu.hasClass(FIRST_SUB_MENU)) {
        toShow === true ? dropdownSubMenu(childSubMenu.children(), options.duration) : upAndHideSubMenu(childSubMenu.children(), options.duration);
      }
      else {
        toShow === true ? slideRightSubMenu(childSubMenu.children(), options.duration) : slideLeftSubMenu(childSubMenu.children(), options.duration);
      }
    }
    
  }

  var positionSubMenuWrapper = function() {
    // Position the submenu-wrapper (<div></div>) in the right place
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
        
      });
  }

  var positionSubMenu = function() {
    // Hide submenu by positioning it in outside submenu-wrapper
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
  }

  var buildMultiLevelDropdownMenu = function(mainMenu, options) {
    var isFirstSubmenu = true;
    mainMenu.children().filter('li').each(function() {
       $(this).data('level', 0);
       wrapSubMenuUpAndSplitThem(mainMenu, $(this), isFirstSubmenu);
    });

    positionSubMenuWrapper();
    positionSubMenu();
    setUpMovement(mainMenu, options);
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

      buildMultiLevelDropdownMenu(that.mainMenu, that.options);
      
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
    duration: 'fast'
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
