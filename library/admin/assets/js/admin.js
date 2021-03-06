/*global jQuery, document, redux_opts, confirm, relid:true, console, jsonView */
jQuery.noConflict();
var confirmOnPageExit = function(e) {
		//return; // ONLY FOR DEBUGGING
		// If we haven't been passed the event get the window.event
		e = e || window.event;
		var message = redux_opts.save_pending;
		// For IE6-8 and Firefox prior to version 4
		if (e) {
			e.returnValue = message;
		}
		window.onbeforeunload = null;
		// For Chrome, Safari, IE8+ and Opera 12+
		return message;
	};

function verify_fold(item) {
	jQuery(document).ready(function($) {
		
		if (item.hasClass('redux-info')) {
			return;
		} else {
			var itemVal = item.val();
		}

		if (redux_opts.folds[item.attr('id')]) {
			$.each(redux_opts.folds[item.attr('id')], function(index, value) {
				var show = false;
				for (var i = 0; i < value.length; i++) {
	/**
							DO NOT change this comarison to === even if JSLint says so. 
							Will not work unless you cast to string like so:
							String(value[i]) === String(itemVal)

							BUT if you do so the cascading effect ceases to work!

							LEAVE AS IS

						**/
					/*jshint eqeqeq: false */
					if (value[i] == itemVal) {
						show = true;
					}
					/*jshint eqeqeq: true */
				}
				var hidden = jQuery('#' + index).parents("tr:first").is(":hidden");
				if (jQuery(item).parents("tr:first").is(":hidden")) {
					show = false;
				}
				if (show) {
					if (hidden) {
						jQuery('#' + index).parents("tr:first").fadeIn('medium', function() {
							// Cascade the fold effect
							if (jQuery('#' + index).hasClass('foldParent')) {
								verify_fold(jQuery('#' + index));
							}
						});
					}
				} else if (!show) {
					if (!hidden) {
						jQuery('#' + index).parents("tr:first").fadeOut(400, function() {
							// Cascade the fold effect
							if (jQuery('#' + index).hasClass('foldParent')) {
								verify_fold(jQuery('#' + index));
							}
						});
					}
				}
			});
		}
		
	});
}

function redux_change(variable) {
	if (variable.hasClass('compiler')) {
		jQuery('#redux-compiler-hook').val(1);
		//console.log('Compiler init');
	}
	if (variable.hasClass('foldParent')) {
		verify_fold(variable);
	}
	window.onbeforeunload = confirmOnPageExit;
	if (jQuery(variable).hasClass('redux-field-error')) {
		jQuery(variable).removeClass('redux-field-error');
		jQuery(variable).parent().find('.redux-th-error').slideUp();
		var parentID = jQuery(variable).closest('.redux-group-tab').attr('id');
		var hideError = true;
		jQuery('#' + parentID + ' .redux-field-error').each(function() {
			hideError = false;
		});
		if (hideError) {
			jQuery('#' + parentID + '_li .redux-menu-error').hide();
			jQuery('#' + parentID + '_li .redux-group-tab-link-a').removeClass('hasError');
		}
	}
	jQuery('#redux-save-warn').slideDown();
}
jQuery(document).ready(function($) {
	jQuery('.redux-action_bar, .redux-presets-bar').on('click', function() {
		window.onbeforeunload = null;
	}); /**	Tipsy @since v1.3 */
	if (jQuery().tipsy) {
		$('.tips').tipsy({
			fade: true,
			gravity: 's',
			opacity: 0.7,
		});
	}
/**
		Current tab checks, based on cookies
	**/
	jQuery('.redux-group-tab-link-a').click(function() {
		relid = jQuery(this).data('rel'); // The group ID of interest
		// Set the proper page cookie
		$.cookie('redux_current_tab', relid, {
			expires: 7,
			path: '/'
		});
		// Remove the old active tab
		var oldid = jQuery('.redux-group-tab-link-li.active .redux-group-tab-link-a').data('rel');
		jQuery('#' + oldid + '_section_group_li').removeClass('active');
		// Show the group
		jQuery('#' + oldid + '_section_group').hide();
		jQuery('#' + relid + '_section_group').fadeIn(300, function() {
			stickyInfo(); // race condition fix
		});
		jQuery('#' + relid + '_section_group_li').addClass('active');
	});
	// Get the URL parameter for tab

	function getURLParameter(name) {
		return decodeURI((new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ''])[1]);
	}
	// If the $_GET param of tab is set, use that for the tab that should be open
	var tab = getURLParameter('tab');
	if (tab !== "") {
		if ($.cookie("redux_current_tab_get") !== tab) {
			$.cookie('redux_current_tab', tab, {
				expires: 7,
				path: '/'
			});
			$.cookie('redux_current_tab_get', tab, {
				expires: 7,
				path: '/'
			});
			jQuery('#' + tab + '_section_group_li').click();
		}
	} else if ($.cookie('redux_current_tab_get') !== "") {
		$.removeCookie('redux_current_tab_get');
	}
	var sTab = jQuery('#' + $.cookie("redux_current_tab") + '_section_group_li_a');
	// Tab the first item or the saved one
	if ($.cookie("redux_current_tab") === null || typeof($.cookie("redux_current_tab")) === "undefined" || sTab.length === 0) {
		jQuery('.redux-group-tab-link-a:first').click();
	} else {
		sTab.click();
	}
	// Default button clicked
	jQuery('input[name="' + redux_opts.opt_name + '[defaults]"]').click(function() {
		if (!confirm(redux_opts.reset_confirm)) {
			return false;
		}
		window.onbeforeunload = null;
	});
	jQuery('#expand_options').click(function(e) {
		e.preventDefault();
		var trigger = jQuery('#expand_options');
		var width = jQuery('#redux-sidebar').width();
		var id = jQuery('#redux-group-menu .active a').data('rel') + '_section_group';
		if (trigger.hasClass('expanded')) {
			trigger.removeClass('expanded');
			jQuery('#redux-main').removeClass('expand');
			jQuery('#redux-sidebar').stop().animate({
				'margin-left': '0px'
			}, 500);
			jQuery('#redux-main').stop().animate({
				'margin-left': width
			}, 500);
			jQuery('.redux-group-tab').each(function() {
				if (jQuery(this).attr('id') !== id) {
					jQuery(this).fadeOut('fast');
				}
			});
			// Show the only active one
		} else {
			trigger.addClass('expanded');
			jQuery('#redux-main').addClass('expand');
			jQuery('#redux-sidebar').stop().animate({
				'margin-left': -width - 2
			}, 500);
			jQuery('#redux-main').stop().animate({
				'margin-left': '0px'
			}, 500);
			jQuery('.redux-group-tab').fadeIn();
		}
		return false;
	});
	jQuery('#redux-import').click(function(e) {
		if (jQuery('#import-code-value').val() === "" && jQuery('#import-link-value').val() === "") {
			e.preventDefault();
			return false;
		}
	});
	if (jQuery('#redux-save').is(':visible')) {
		jQuery('#redux-save').slideDown();
	}
	if (jQuery('#redux-imported').is(':visible')) {
		jQuery('#redux-imported').slideDown();
	}
	jQuery('input, textarea, select').on('change', function() {
		if (!jQuery(this).hasClass('noUpdate')) {
			redux_change(jQuery(this));
		}
	});
	jQuery('#redux-import-code-button').click(function() {
		if (jQuery('#redux-import-link-wrapper').is(':visible')) {
			jQuery('#redux-import-link-wrapper').fadeOut('fast');
			jQuery('#import-link-value').val('');
		}
		jQuery('#redux-import-code-wrapper').fadeIn('slow');
	});
	jQuery('#redux-import-link-button').click(function() {
		if (jQuery('#redux-import-code-wrapper').is(':visible')) {
			jQuery('#redux-import-code-wrapper').fadeOut('fast');
			jQuery('#import-code-value').val('');
		}
		jQuery('#redux-import-link-wrapper').fadeIn('slow');
	});
	jQuery('#redux-export-code-copy').click(function() {
		if (jQuery('#redux-export-link-value').is(':visible')) {
			jQuery('#redux-export-link-value').fadeOut('slow');
		}
		jQuery('#redux-export-code').toggle('fade');
	});
	jQuery('#redux-export-link').click(function() {
		if (jQuery('#redux-export-code').is(':visible')) {
			jQuery('#redux-export-code').fadeOut('slow');
		}
		jQuery('#redux-export-link-value').toggle('fade');
	});
	jQuery.fn.isOnScreen = function() {
		var win = jQuery(window);
		var viewport = {
			top: win.scrollTop(),
			left: win.scrollLeft()
		};
		viewport.right = viewport.left + win.width();
		viewport.bottom = viewport.top + win.height();
		var bounds = this.offset();
		bounds.right = bounds.left + this.outerWidth();
		bounds.bottom = bounds.top + this.outerHeight();
		return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	};
/**
	Show the sticky header bar and notes!
**/
	var stickyHeight = jQuery('#redux-footer').height();
	jQuery('#redux-sticky-padder').css({
		height: stickyHeight
	});

	function stickyInfo() {
		var stickyWidth = jQuery('#info_bar').width() - 2;
		if (!jQuery('#info_bar').isOnScreen() && !jQuery('#redux-footer-sticky').isOnScreen()) {
			jQuery('#redux-footer').css({
				position: 'fixed',
				bottom: '0',
				width: stickyWidth
			});
			jQuery('#redux-footer').addClass('sticky-footer-fixed');
			jQuery('#redux-sticky-padder').show();
		} else {
			jQuery('#redux-footer').css({
				background: '#eee',
				position: 'inherit',
				bottom: 'inherit',
				width: 'inherit'
			});
			jQuery('#redux-sticky-padder').hide();
			jQuery('#redux-footer').removeClass('sticky-footer-fixed');
		}
	}
	jQuery(window).scroll(function() {
		stickyInfo();
	});
	jQuery(window).resize(function() {
		stickyInfo();
	});
	jQuery('#redux-save, #redux-imported').delay(4000).slideUp();
	jQuery('#redux-field-errors').delay(8000).slideUp();
	jQuery('.redux-save').click(function() {
		window.onbeforeunload = null;
	});
/*
	// Markdown Viewer for Theme Documentation
	if ($('#theme_docs_section_group').length !== 0) {
		var converter = new Showdown.converter();
		var text = jQuery('#theme_docs_section_group').html();
		text = converter.makeHtml(text);
		jQuery('#theme_docs_section_group').html(text);
	}
*/
	// Hide the fold elements on load
	jQuery('.fold').each(function() {
		jQuery(this).parents("tr:first").hide();
	});
	// Hide the fold elements on load
	jQuery('.foldParent').each(function() {
		verify_fold(jQuery(this));
	});
	$('#consolePrintObject').on('click', function() {
		console.log(jQuery.parseJSON(jQuery("#redux-object-json").html()));
	});

	if (typeof jsonView === 'function') {
		jsonView('#redux-object-json', '#redux-object-browser');
	}

	// Display errors on page load
	if (redux_opts.errors !== undefined) {
		jQuery("#redux-field-errors span").html(redux_opts.errors.total);
		jQuery("#redux-field-errors").show();
		jQuery.each(redux_opts.errors.errors, function(sectionID, sectionArray) {
			jQuery("#" + sectionID + "_section_group_li_a").prepend('<span class="redux-menu-error">' + sectionArray.total + '</span>');
			jQuery("#" + sectionID + "_section_group_li_a").addClass("hasError");
			jQuery.each(sectionArray.errors, function(key, value) {
				jQuery("#" + value.id).addClass("redux-field-error");
				jQuery("#" + value.id).parents("td:first").append('<span class="redux-th-error">' + value.msg + '</span>');
			});
		});
	}
	// Display warnings on page load
	if (redux_opts.warnings !== undefined) {
		jQuery("#redux-field-warnings span").html(redux_opts.warnings.total);
		jQuery("#redux-field-warnings").show();
		jQuery.each(redux_opts.warnings.warnings, function(sectionID, sectionArray) {
			jQuery("#" + sectionID + "_section_group_li_a").prepend('<span class="redux-menu-warning">' + sectionArray.total + '</span>');
			jQuery("#" + sectionID + "_section_group_li_a").addClass("hasWarning");
			jQuery.each(sectionArray.warnings, function(key, value) {
				jQuery("#" + value.id).addClass("redux-field-warning");
				jQuery("#" + value.id).parents("td:first").append('<span class="redux-th-warning">' + value.msg + '</span>');
			});
		});
	}



	

});