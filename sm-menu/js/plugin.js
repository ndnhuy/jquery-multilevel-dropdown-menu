/**
 * @name smPlugin
 * @description description
 * @version 1.0
 * @options
 *		option
 * @events
 *		event
 * @methods
 *		init
 *		publicMethod
 *		destroy
 */
;(function($, window, undefined) {
	var pluginName = 'smPlugin';
	var privateVar = null;
	var privateMethod = function() {

	};

	function Plugin(element, options) {
		this.element = $(element);
		this.options = $.extend({}, $.fn[pluginName].defaults, options);
		this.init();
	};

	Plugin.prototype = {
		init: function() {

		},
		publicMethod: function(param) {

		}
	};

	$.fn[pluginName] = function(options, params) {
		return this.each(function() {
			var instance = $.data(this, pluginName);
			if (!instance) {
				$.data(this, pluginName, new Plugin(this, options));
			} else if (instance[options]) {
				instance[options](params);
			} else {
				console.warn(options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized');
			}
		});
	};

	$.fn[pluginName].defaults = {
		option1: 'value',
		option2: true,
		option3: 100,
		event1: function() {},
		event2: function() {},
		event3: function() {}
	};
}(jQuery, window));

/**
 * @name smTabs
 * @description description
 * @version 1.0
 * @options
 *		option
 * @events
 *		event
 * @methods
 *		init
 *		publicMethod
 *		destroy
 */
;(function($, window, undefined) {
	var pluginName = 'smTabDemo';

	function Plugin(element, options) {
		this.element = $(element);
		this.options = $.extend({}, $.fn[pluginName].defaults, options);
		this.init();
	};

	Plugin.prototype = {
		init: function() {
			var options = this.options,
				curTab = this.element.find('.current'),
				curContent = $('.' + options.contentClass + '.current');
			this.element.delegate('li', 'click.' + pluginName, function() {
				var clicked = $(this),
					content = $(clicked.children().attr('href'));
				if (curTab.length) {
					curTab.removeClass('current');
					curTab = clicked.addClass('current');
				}
				if (curContent.length) {
					curContent.removeClass('current');
				}
				if (content.length) {
					curContent = content.addClass('current');
				}
				return false;
			});
		}
	};

	$.fn[pluginName] = function(options, params) {
		return this.each(function() {
			var instance = $.data(this, pluginName);
			if (!instance) {
				$.data(this, pluginName, new Plugin(this, options));
			} else if (instance[options]) {
				instance[options](params);
			} else {
				console.warn(options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized');
			}
		});
	};

	$.fn[pluginName].defaults = {
		contentClass: 'tabs-content'
	};
}(jQuery, window));

/**
 * @name smMenu
 * @description description
 * @version 1.0
 * @options
 *		hideDelay
 *		showDuration
 *		activeClass
 *		easing
 *		zIndex
 *		mainTopOffset
 *		subLeftOffet
 * @events
 *		onMainShow
 *		onMainHide
 *		onSubShow
 *		onSubHide
 * @methods
 *		init
 *		initMenu
 *		showMainMenu
 *		hideMainMenu
 *		showSubMenu
 *		hideSubMenu
 *		destroy
 */
;(function($, window, undefined){
	var pluginName = 'smMenu';

	var win = $(window);
	var showingClass = 'showing';
	var hiddingClass = 'hidding';
	var mainSubClass = 'mainSub';
	var revertClass = 'revert';
	var parentData = 'parent';
	var childData = 'child';
	var widthData = 'width';
	var heightData = 'height';
	var oWidthData = 'outerWidth';
	var oHeightData = 'outerHeight';
	var leftData = 'left';
	var topData = 'top';

	function Plugin(element, options){
		this.element = $(element);
		this.options = $.extend({}, $.fn[pluginName].defaults, options);
		this.init();
	};

	Plugin.prototype = {
		init: function(){
			var thisObj = this;
			var vars = {};
			thisObj.vars = vars;

			this.initMenu();

			var curMainMenu = null;

			this.element.children().off('mouseover.menu').on('mouseover.menu', function(){
				curMainMenu = $(this);
				clearTimeout(thisObj.vars.closeTimeout);
				curMainMenu.siblings().each(function(){
					thisObj.hideMainMenu($(this));
				});
				thisObj.showMainMenu(curMainMenu);
			}).off('mouseout.menu').on('mouseout.menu', function(){
				thisObj.hideMainMenu($(this), thisObj.options.hideDelay);
			});

			vars.subMenu.children().off('mouseover.menu').on('mouseover.menu', function(e){
				clearTimeout(thisObj.vars.closeTimeout);
				$(this).siblings().each(function(){
					thisObj.hideSubMenu($(this));
				});
				thisObj.showSubMenu($(this));
			}).off('mouseout.meunu').on('mouseout.menu', function(){
				thisObj.hideMainMenu(curMainMenu, thisObj.options.hideDelay);
			});

			thisObj.vars.leftOffset = 0;
			win.on('resize', function(e){
				vars.leftOffset = thisObj.element.children(':first').offset().left - vars.subMenu.eq(0).data(leftData);

				vars.menuContainer.css({
					top: 0,
					left: vars.leftOffset
				});
			});
		},
		initMenu: function(){
			var thisObj = this;
			var subMenu = this.element.find('ul');
			var mainMenuTop = thisObj.element.children(':first').outerHeight();
			subMenu.each(function(){
				var me = $(this).css({
					position: absolute,
					display: 'block',
					position: 'absolute',
					top: 0
				});
				me.parent().data(childData, $(this));
				me.data(parentData, $(this).parent());
				me.data(heightData, me.height())
					.data(widthData, me.width())
					.data(oHeightData, me.outerHeight(true))
					.data(oWidthData, me.outerWidth(true));
			});

			console.log(subMenu.eq(0).data(parentData).data(childData));

			this.element.children().each(function(){
				if($(this).data(childData)){
					$(this).data(childData).addClass(mainSubClass);
				}
			});
			subMenu.each(function(){
				if($(this).hasClass(mainSubClass)){
					$(this).data(topData, $(this).data(parentData).offset().top + mainMenuTop + thisObj.options.mainTopOffset);
					$(this).data(leftData, $(this).data(parentData).offset().left);
				}else{
					$(this).data(leftData, $(this).data(parentData).parent().data(widthData));
				}
			});
			var menuWrapper = $('<div></div>').css({
				position: 'absolute',
				overflow: 'hidden',
				top: -10000,
				left: -10000
			});
			var sMenuContainer = $('<div></div>').css({
				position: 'absolute',
				top: 0,
				left: 0,
				width: 0,
				height: 0
			}).append(subMenu).appendTo($(document.body));
			sMenuContainer.children().each(function(){
				var curChild = $(this);
				curChild.wrap(menuWrapper.clone());

				curChild.parent().css({
					width: curChild.data(oWidthData),
					height: curChild.data(oHeightData)
				});
			});
			this.vars.subMenu = subMenu;
			this.vars.menuContainer = sMenuContainer;
		},
		showMainMenu: function(mainMenu){
			var thisObj = this;
			var menu = mainMenu.data(childData);
			if(menu && !menu.hasClass(showingClass)){
				mainMenu.addClass(thisObj.options.activeClass);
				this.vars.curMainMenu = menu;
				var leftPos = mainMenu.offset().left - thisObj.vars.leftOffset;

				if(leftPos + menu.data(widthData) + thisObj.vars.leftOffset > win.width() + win.scrollLeft()){
					leftPos = win.width() - menu.data(widthData) - thisObj.vars.leftOffset + win.scrollLeft();
					menu.addClass('')
				}
				menu.parent().css({
					top: menu.data(topData),
					left: leftPos
				});
				menu.addClass(showingClass).removeClass(hiddingClass).css({
					'margin-top':  -menu.data(oHeightData),
					opacity: 0,
					zIndex: thisObj.options.zIndex
				}).stop().animate({
					'margin-top': 0,
					opacity: 1
				}, thisObj.options.showDuration, thisObj.options.easing, function(){
					if(thisObj.options.onMainShow){
						thisObj.options.onMainShow(mainMenu);
					}
				});
			}
		},
		hideMainMenu: function(mainMenu, time){
			var thisObj = this;
			var menu = mainMenu.data(childData);
			if(menu && menu.hasClass(showingClass)){
				this.vars.closeTimeout = setTimeout(function(){
					menu.children().each(function(){
						thisObj.hideSubMenu($(this));
					});
					mainMenu.removeClass(thisObj.options.activeClass);
					menu.removeClass(showingClass).addClass(hiddingClass).stop().animate({
						'margin-top':  -menu.data(oHeightData),
						opacity: 0
					}, thisObj.options.showDuration, thisObj.options.easing, function(){
						$(this).removeClass(hiddingClass).parent().css({
							top: -10000
						});
						if(thisObj.options.onMainHide){
							thisObj.options.onMainHide(mainMenu);
						}
					});
				}, time);
			}
		},
		showSubMenu: function(menu){
			var thisObj = this;
			var subMenu = menu.data(childData);
			if(menu.hasClass(thisObj.options.activeClass)){
				if(subMenu){
					subMenu.children().each(function(){
						thisObj.hideSubMenu($(this).removeClass(thisObj.options.activeClass));
					});
				}
				return;
			}
			menu.addClass(thisObj.options.activeClass);
			if(subMenu && !menu.parent().hasClass(hiddingClass)){
				var leftPos = menu.offset().left + subMenu.data(leftData) - thisObj.vars.leftOffset + thisObj.options.subLeftOffet - parseInt(menu.parent().css('margin-left'));
				var marginLeft = -subMenu.data(oWidthData);
				if(leftPos + subMenu.data(oWidthData) + thisObj.vars.leftOffset > win.width() + win.scrollLeft()){
					leftPos = menu.offset().left - subMenu.data(widthData) - thisObj.vars.leftOffset - thisObj.options.subLeftOffet;
					subMenu.addClass(revertClass);
					marginLeft = -marginLeft;
				}else{
					subMenu.removeClass(revertClass);
				}
				subMenu.parent().css({
					top: Math.min(win.height() - subMenu.data(oHeightData) + win.scrollTop(), Math.max(0, menu.offset().top - parseInt(menu.parent().css('margin-top')))),
					left: leftPos
				});
				subMenu.addClass(showingClass).removeClass(hiddingClass).css({
					opacity: 0,
					'margin-left': marginLeft,
					zIndex: thisObj.options.zIndex
				}).stop().animate({
					'margin-left': 0,
					opacity: 1
				}, thisObj.options.showDuration, thisObj.options.easing, function(){
					if(thisObj.options.onSubShow){
						thisObj.options.onSubShow(menu);
					}
				});
			}
		},
		hideSubMenu: function(menu){
			var thisObj = this;
			var subMenu = menu.data(childData);
			menu.removeClass(thisObj.options.activeClass);
			if(subMenu && subMenu.hasClass(showingClass)){
				var marginLeft = subMenu.hasClass(revertClass)?subMenu.data(oWidthData):-subMenu.data(oWidthData);
				subMenu.children().each(function(){
					thisObj.hideSubMenu($(this));
				});
				subMenu.removeClass(showingClass).addClass(hiddingClass).stop().animate({
					'margin-left': marginLeft,
					opacity: 0
				}, thisObj.options.showDuration, thisObj.options.easing, function(){
					$(this).removeClass(hiddingClass).css({
					});
					subMenu.parent().css({
						top: -10000
					});
					if(thisObj.options.onSubHide){
						thisObj.options.onSubHide(menu);
					}
				});
			}
		},
		destroy: function(){
			this.element.removeData(pluginName);
			delete this;
		}
	};

	$.fn[pluginName] = function(options, params){
		return this.each(function(){
			var instance = $.data(this, pluginName);
			if(!instance) {
				$.data(this, pluginName, new Plugin(this, options));
			}else if(instance[options]){
				instance[options](params);
			}else{
				console.warn(options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized');
			}
		});
	};

	$.fn[pluginName].defaults = {
		hideDelay: 2000,
		showDuration: 200,
		activeClass: 'active',
		easing: 'linear',
		zIndex: 100,

		mainTopOffset: 0,
		subLeftOffet: 0,
		onMainShow: function(){},
		onMainHide: function(){},
		onSubShow: function(){},
		onSubHide: function(){}
	};
})(jQuery, window);
