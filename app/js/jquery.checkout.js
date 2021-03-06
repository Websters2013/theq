"use strict";
( function(){

    $( function () {

        $.each( $('.checkout'), function () {

            new LabelForm( $(this) );
            new ProductsInCart( $(this) );

        } );
        $.each( $('.checkout__quantity'), function () {

            new Quantity( $(this) );

        } );

        $.each( $('.dynamic_states'), function () {

            new CurrentState( $(this) );

        } );

    } );

    var LabelForm = function ( obj ) {

        var _self = this,
            _obj = obj,
            _fields = _obj.find('.checkout__fields'),
            _input = _obj.find('input:not([readonly]), textarea');

        var _addEvents = function () {

                _input.on( {
                    focusin: function() {

                        _addClassOnFocus( $(this) );

                    },
                    focusout: function() {

                        _removeClassOnFocusOut( $(this) );
                        _checkOnEmpty( $(this) );

                    }
                } );

            },
            _addClassOnFocus = function( input ) {

               var field = input,
                   inputParent = field.parent();

                inputParent.addClass('checkout__fields_focus');

            },
            _removeClassOnFocusOut = function( input ) {

                var field = input,
                    inputParent = field.parent();

                inputParent.removeClass('checkout__fields_focus');

            },
            _checkOnEmpty = function ( input ) {

                var field = input,
                    inputParent = field.parent();

                if( !( field.val() == '' ) ) {

                    inputParent.addClass('checkout__fields_focus');

                }

            },
            _init = function() {
                _obj[0].obj = _self;
                _addEvents();

                _input.each( function() {

                    _checkOnEmpty( $(this) );

                } );

            };

        _init();
    };

    var Quantity = function (obj) {

        //private properties
        var _self = this,
            _obj = obj,
            _input = _obj.find('input');

        //private methods
        var _addEvents = function () {

                _input.on( {
                    keypress: function () {

                        if ( ( event.which != 46 || $( this ).val().indexOf( '.' ) != -1 ) && ( event.which < 48 || event.which > 57 ) ) {
                            event.preventDefault();
                        }

                    }
                } );
                _input.on( {
                    keyup: function () {

                        if( _input.val() == '' ) {

                            _input.val( 1 );

                        }

                    }
                } );

            },
            _init = function () {
                _obj[0].obj = _self;
                _addEvents();
            };

        //public properties

        //public methods


        _init();
    };

    var ProductsInCart = function (obj) {

        //private properties
        var _self = this,
            _obj = obj,
            _request = new XMLHttpRequest(),

            //_subTotal = $('.cart-subtotal .amount'),
            //_taxTotal = $('.tax-total .amount'),
            //_total = $('.order-total .amount'),


            _couponWrap = _obj.find('.checkout__coupon'),
            _btnCoupon = _couponWrap.find('.checkout__coupon-send'),
            _inputCoupon = _couponWrap.find('input'),
            _quantity = _obj.find('.checkout__quantity'),
            _inputQuantity = _quantity.find('input'),
            _btnRemoveProduct = _obj.find('.remove_product'),
            //_discount = $('.my-cart__discount'),
            //_define = $('.my-cart__define'),
            //_applied = $('.my-cart__applied'),
            //_invalid = $('.my-cart__invalid'),
            _window = $(window);

        //private methods
        var _addEvents = function () {

                _btnCoupon.on( {
                    click: function () {

                        var curItem = $(this);

                        if( !( _inputCoupon.val() == '' ) ) {

                                _requestCouponDiscount();


                        } else {

                            _inputCoupon.focus();

                        }


                        return false;

                    }
                } );

            
                _inputQuantity.on( {
                    change: function () {
                        
                        _requestCountChange( $(this) );
                    },
                    keyup: function () {

                        _requestCountChange( $(this) );

                    }
                } );

                _btnRemoveProduct.on( {
                    click: function () {

                            var _curElem = $(this);
                        
                            setTimeout( function() {

                                _requestProductRemove( _curElem.attr('data-id'), _curElem.parent() );

                            }, 500 );

                        
                        return false;

                    }


                } );

            },
            _requestCountChange = function ( elem ) {

                _request.abort();
                _request = $.ajax( {
                    url: $('body').attr('data-action'),
                    data: {
                        action: 'cart_quantity_changes',
                        id: elem.parents('.checkout__order').attr('data-product-id'),
                        key: elem.parents('.checkout__order').attr('data-product-key'),
                        countProduct: elem.val()
                    },
                    dataType: 'html',
                    type: "get",
                    success: function (m) {
                        
                        $( 'body' ).trigger( 'update_checkout' );

                    },
                    error: function (XMLHttpRequest) {
                        if ( XMLHttpRequest.statusText != "abort" ) {
                            alert("ERROR!!!");
                        }
                    }
                } );

            },
            _requestCouponDiscount = function () {

                _request.abort();
                _request = $.ajax( {
                    url: $('body').attr('data-action'),
                    data: {
                        action: 'apply_coupon_to_order',
                        inputVal: _inputCoupon.val(),
                        flag: 'coupon'
                    },
                    dataType: 'json',
                    type: "get",
                    success: function (m) {

                      
                        setTimeout( function() {

                            if( m.status == 1 ) {

                                _couponWrap.removeClass('error');
                                _couponWrap.addClass('applied');
                                $( 'body' ).trigger( 'update_checkout' );

                            } else {

                                _couponWrap.addClass('error');

                            }

                        }, 500 );

                    },
                    error: function (XMLHttpRequest) {
                        if ( XMLHttpRequest.statusText != "abort" ) {

                            _couponWrap.addClass('error');

                        }
                    }
                } );

            },
            _requestProductRemove = function ( elem, parent ) {

                _request.abort();
                _request = $.ajax( {
                    url: $('body').attr('data-action'),
                    data: {
                        action: 'remove_cart_item',
                        id: elem,
                        flag: 'remove'
                    },
                    dataType: 'json',
                    type: "get",
                    success: function (m) {
                        
                     
                        
                        _removeProduct( parent );

                        if( parseInt(m.cartCountProducts) == 0 ) {

                           location.href='/shop';


                        } else {
                        
                            $( 'body' ).trigger( 'update_checkout' );

                        }
                        
                    },
                    error: function (XMLHttpRequest) {
                        if ( XMLHttpRequest.statusText != "abort" ) {
                            alert("ERROR!!!");
                        }
                    }
                } );

            },
            _removeProduct = function( elem ) {

                elem.addClass('hidden');

                setTimeout( function() {

                    elem.remove();

                }, 500 );

            },
            _init = function () {
                _obj[0].obj = _self;
                _addEvents();
            };

        //public properties

        //public methods


        _init();
    };

    var CurrentState = function (obj) {

        //private properties
        var _self = this,
            _obj = obj,
            _request = new XMLHttpRequest(),
            _input = _obj.find('input'),
            _shipment = _obj.find('select').attr('id');
        
 
        
        //private methods
        var _addEvents = function () {



                _obj.on( {
                    change: function() {
                        _requestCountChange($(this).find('select').val());
                        return false;
                    }
                } );

            },
            
            _requestCountChange = function ( elem ) {

               

             
                
                _request.abort();
                _request = $.ajax( {
                    url: $('body').attr('data-action'),
                    data: {
                        action: 'get_states_by_countries',
                        country: elem,
                        shipment: _shipment
                    },
                    dataType: 'html',
                    type: "get",
                    success: function (m) {
                        
                        if(_obj.parents('.woocommerce-billing-fields').length){
                            $('.billing_current_states').html(''); 
                            $('.billing_current_states').html(m); 
                       
                        } else {
                            $('.shipping_current_states').html('');
                            $('.shipping_current_states').html(m);
                        }

                        $( 'body' ).trigger( 'update_checkout' );
                    },
                    error: function (XMLHttpRequest) {
                        if ( XMLHttpRequest.statusText != "abort" ) {
                            alert("ERROR!!!");
                        }
                    }
                } );

            },
            
            _init = function () {
                _obj[0].obj = _self;
                _addEvents();
            };

        //public properties

        //public methods


        _init();
    };

} )();