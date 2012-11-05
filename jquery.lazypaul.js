/*
 * LazyPaul - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2012 Mika Tuupola
 *                    2012 Simone Conti
 *
 * (Forked form version 1.8.1 of Lazy Load)
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version:  1.8.1.1
 *
 */
;(function( $, window ) {
    var $window = $( window );

    var settings = {
	   timeout         : 500,			//	time to wait (in milliseconds) before trying to load each image
       threshold       : 0,
       failure_limit   : 0,
       event           : "scroll",		//	default triggering event
       effect          : "show",		//	default FX used to show images
       container       : window,
       data_attribute  : "original",
       skip_invisible  : true,			//	Should I skip invisible images?
       appear          : null,
       load            : null
   };

   var elements;

   var container;

   var methods = {
        init: function( options ) {
	        if( options ) {
	            /* Maintain BC for a couple of versions. */
	            if( undefined !== options.failurelimit ) {
	                options.failure_limit = options.failurelimit; 
	                delete options.failurelimit;
	            }
	            if( undefined !== options.effectspeed ) {
	                options.effect_speed = options.effectspeed; 
	                delete options.effectspeed;
	            }
	
	            $.extend( settings, options );
	        }
	
	        /* Cache container as jQuery as object. */
	        $container = ( settings.container === undefined ||
	                       settings.container === window ) ? $window : $( settings.container );
	
	        /* Fire one scroll event per scroll. Not one scroll event per image. */
	        if( 0 === settings.event.indexOf( "scroll" ) ) {
	            $container.bind( settings.event, function( event ) {
	                return methods.update();
	            } );
	        }
	
	        this.each( function() {
	            var self = this;
	            var $self = $( self );
	
	            self.loaded = false;
	
	            /* Save the original image src for later use */
                $self.data( 'original-src', $self.attr( 'src' ) );

	            /* When appear is triggered load original image. */
	            $self.one( "appear", function() {
	                if( ! this.loaded ) {
	                    if( settings.appear ) {
	                        var elements_left = elements.length;
	                        
	                        settings.appear.call( self, elements_left, settings );
	                    }
	                    
	                    $("<img />")
	                        .bind( 'load.lazypaul', function() {
	                            $self
	                                .hide()
	                                .attr( 'src', $self.data( settings.data_attribute ) )
	                                [ settings.effect ]( settings.effect_speed );

	                            self.loaded = true;
	
	                            /* Remove image from array so it is not looped next time. */
	                            var temp = $.grep( elements, function( element ) {
	                                return ! element.loaded;
	                            } );
	                            elements = $( temp );
	
	                            if( settings.load ) {
	                                var elements_left = elements.length;
	                                settings.load.call( self, elements_left, settings );
	                            }
	                        } )
	                        .attr( 'src', $self.data( settings.data_attribute ) );
	                }
	            } );
	
	            /* When wanted event is triggered load original image */
	            /* by triggering appear.                              */
	            if( 0 !== settings.event.indexOf( 'scroll' ) ) {
	                $self.bind( settings.event, function( event ) {
	                    if( ! self.loaded ) {
		                    $self.trigger( 'appear' );
	                    }
	                });
	            }
	        });
	
	        /* Check if something appears when window is resized. */
	        $window.bind( 'resize.lazypaul', function( event ) {
	            methods.update();
	        } );
	
	        /* Force initial check if images should appear. */
	        $( document ).ready( function() {
	            methods.update();
	        } );
	        
	        return this;
        },
        
        destroy: function( ) {
        
        	$window.unbind( '.lazypaul' );

        	return this;

	    },

        update: function() {
            var counter = 0;
      
            elements.each(function() {
                var $this = $( this );
                
                if( settings.skip_invisible && ! $this.is( ":visible" ) ) {
                    return;
                }
                if( $.aboveTheTop( this, settings ) ||
                    $.leftOfBegin( this, settings ) ) {
                        /* Nothing. */
                } else if ( ! $.belowTheFold( this, settings ) &&
                    		! $.rightOfFold( this, settings ) ) {
                        setTimeout( function() {
	                        	methods.show.apply( $this );
	                        }, settings.timeout );
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if( ++counter > settings.failure_limit ) {
                        return false;
                    }
                }
            } );
        },
        
        show: function() {
        
            if ( settings.skip_invisible && ! $( this ).is( ':visible' ) ) {
	            /* DO NOTHING */
            } else if ( $.inViewport( this, settings ) ) {
		        $( this ).trigger( 'appear' );
            }
            
            return this;
        },

        reset: function( neworiginal ) {
        
    		$( this ).unbind( '.lazypaul' );
    		$( this ).removeData( settings.data_attribute );
			$( this ).attr( 'src', $( this ).data( 'original-src' ) );
    		$( this ).removeAttr( 'style' );
    		$( this ).attr( 'data-' + settings.data_attribute, neworiginal );
    		$( this ).loaded = false;

            return this;
        }


    };
 
    $.fn.lazypaul = function( method ) {
        elements = this;

        if ( methods[ method ] ) {
          return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
          return methods.init.apply( this, arguments );
        } else {
          $.error( 'Method ' +  method + ' does not exist on jQuery.lazypaul' );
        }    

    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowTheFold = function( element, settings ) {
        var fold;
        
        if( settings.container === undefined || settings.container === window ) {
            fold = $window.height() + $window.scrollTop();
        } else {
            fold = $( settings.container ).offset().top + $( settings.container ).height();
        }

        return fold <= $( element ).offset().top - settings.threshold;
    };
    
    $.rightOfFold = function( element, settings ) {
        var fold;

        if( settings.container === undefined || settings.container === window ) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $( settings.container ).offset().left + $( settings.container ).width();
        }

        return fold <= $( element ).offset().left - settings.threshold;
    };
        
    $.aboveTheTop = function( element, settings ) {
        var fold;
        
        if( settings.container === undefined || settings.container === window ) {
            fold = $window.scrollTop();
        } else {
            fold = $( settings.container ).offset().top;
        }

        return fold >= $( element ).offset().top + settings.threshold  + $( element ).height();
    };
    
    $.leftOfBegin = function( element, settings ) {
        var fold;
        
        if( settings.container === undefined || settings.container === window ) {
            fold = $window.scrollLeft();
        } else {
            fold = $( settings.container ).offset().left;
        }

        return fold >= $( element ).offset().left + settings.threshold + $( element ).width();
    };

    $.inViewport = function( element, settings ) {
         return ! $.rightOfFold(  element, settings ) && ! $.leftOfBegin( element, settings ) &&
                ! $.belowTheFold( element, settings ) && ! $.aboveTheTop( element, settings );
     };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend( $.expr[ ':' ], {
        "below-the-fold" : function( a ) { return   $.belowTheFold( a, { threshold : 0 } ); },
        "above-the-top"  : function( a ) { return ! $.belowTheFold( a, { threshold : 0 } ); },
        "right-of-screen": function( a ) { return   $.rightOfFold(  a, { threshold : 0 } ); },
        "left-of-screen" : function( a ) { return ! $.rightOfFold(  a, { threshold : 0 } ); },
        "in-viewport"    : function( a ) { return   $.inViewport(   a, { threshold : 0 } ); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function( a ) { return ! $.belowTheFold( a, { threshold : 0 } ); },
        "right-of-fold"  : function( a ) { return   $.rightOfFold(  a, { threshold : 0 } ); },
        "left-of-fold"   : function( a ) { return ! $.rightOfFold(  a, { threshold : 0 } ); }
    });

} )( jQuery, window );
