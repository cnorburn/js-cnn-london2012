/*olympic widget test harness */
CNN.olympicWidgetTest = (function() {
        
//      jQuery('#cnn_olympic_widget').css('height','300px');
//      olympicWidget.create({target:'#cnn_olympic_widget',url:'http://data.cnn.com/jsonp/.element/ssi/auto/3.0/SPECIALS/2012/olympics/json/jsonWidget.json?callback=callback_olympicsWidgetFeed',clearTarget:true,debug:debug})

        var harness={

                create : function(config){

                        var _timer;
                        var debug={};
                        var _section;
                        var _base_path;
                        var _event_tomorrow;
                        
                        var s='<select id="json_test">' +
                                '<option value="17">SD Delivered</option>' +
                                '<option value="18">Two medals</option>' +
                                '<option value="19">Two bronze winners</option>' +
                                '<option value="1">Six events - all good</option>' +
                                '<option value="2">One event - all good</option>' +
                                '<option value="3">One event - null gender</option>' +
                                '<option value="4">One event - missing phase field</option>' +
                                '<option value="5">One event - missing sport field</option>' +
                                '<option value="6">Six events - one with empty sport field</option>' +
                                '<option value="7">Six events - only one event</option>' +
                                '<option value="8">Medals - no gold</option>' +
                                '<option value="9">Medals - wrong order</option>' +
                                '<option value="10">Medals - null countries</option>' +
                                '<option value="11">Latest results - null event</option>' +
                                '<option value="12">Latest results - null sport</option>' +
                                '<option value="13">Latest results - null gender</option>' +
                                '<option value="14">Empty' +
                                '<option value="15">Null' +
                                '<option value="16">Not found' +
                                '</select><br /><br />';
                        
                        s+='<div id="test_checks"><input type="checkbox" name="section" id="medalTable" value="medalTable"/>  Medal Table Only<br /><input type="checkbox" name="icons" id="icons" value="icons"/>  404 Icons<br />';
                        s+='<input type="checkbox" name="tomorrow" id="tomorrow" value="tomorrow"/>  Events Tomorrow<br />';
                        s+='<input type="checkbox" name="onehour" id="onehour" value="onehour"/>  Events 1 hour ago<br />';
                        s+='<input type="checkbox" name="ignorestart" id="ignorestart" value="ignorestart" checked/>  Ignore Event Start Time<br /></div>';
                        
                        s+='<input type="radio" class="options" name="options" value="refresh" checked/> Refresh - mimics user first arriving at the page<br />' +
                                '<input type="radio" class="options" name="options" value="rerender" /> Re-render - mimics user already on page with widget re-rendering on timer<br /><br />';
                        
                        s+='<span id="timer" style="color:black;font-size:1.1em">Timer <span style="font-weight:bold">Off</span></span><br />';
                        s+='<span id="start_timer" style="color:blue;font-size:1.1em;cursor:pointer">Start widget render timer at 3 sec intervals - iterate above options</span><br />';
                        s+='<span id="stop_timer" style="color:blue;font-size:1.1em;cursor:pointer">Stop timer</span>';
        
                        jQuery(config.target).after(s);
                        
                        var _url;
                        debug.ignoreStartTime=true;
                        
                        jQuery('#test_checks input#medalTable').click(function(){
                                if ((jQuery(this)).is(':checked'))
                                        _section='medalTable';
                                else
                                        _section='all';
                        });
        
                        jQuery('#test_checks input#icons').click(function(){
                                if ((jQuery(this)).is(':checked'))
                                        debug.base_path='http://test.fail/';
                                else
                                        debug.base_path='http://i.cdn.turner.com/cnn/.e/img/3.0/sect/specials/olympics/2012/';
                        });
        
                        jQuery('#test_checks input#tomorrow').click(function(){
                                if ((jQuery(this)).is(':checked'))
                                        debug.event_tomorrow=true;
                                else
                                        debug.event_tomorrow=false;
                        });
                        jQuery('#test_checks input#ignorestart').click(function(){
                                if ((jQuery(this)).is(':checked'))
                                        debug.ignoreStartTime=true;
                                else
                                        debug.ignoreStartTime=false;
                        });
                        jQuery('#test_checks input#onehour').click(function(){
                                if ((jQuery(this)).is(':checked'))
                                        debug.eventsOneHourAgo=true;
                                else
                                        debug.eventsOneHourAgo=false;
                        });
                        
                        jQuery('#json_test').change(function(){
                                
                                renderIt(parseInt(jQuery(this).val()));
                                
                                if(jQuery('input[name=options]:radio:checked').val()==='refresh'){
                                        jQuery('#cnn_olympic_widget').empty();
                                }
                                CNN.olympicWidget.create({target:'#cnn_olympic_widget',url:_url,clearTarget:true,section:_section,debug:debug})
                                
                        });
                        
        
                        var indx=1;
                        function _render(){
                                if(jQuery('input[name=options]:radio:checked').val()==='refresh'){
                                        jQuery('#cnn_olympic_widget').empty();
                                }
                                CNN.olympicWidget.create({target:'#cnn_olympic_widget',url:_url,clearTarget:true,section:_section,debug:debug})
        
                                jQuery('#json_test').val(indx);
                                
                                renderIt(indx);
                                indx=(indx===(16)) ? 1 : indx + 1;
                        }
                        
                        jQuery('#start_timer').click(function(){
                                _timer=setInterval(_render, 3500);
                                jQuery('#timer span').html('On');
                        });
                        jQuery('#stop_timer').click(function(){
                                clearInterval(_timer);
                                jQuery('#timer span').html('Off');
                        });
        
                        function renderIt(indx){
                                
                                switch (indx){
                                        case 1:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/all-good-six-events.json';
                                                break;
                                        case 2:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/all-good-one-event.json';
                                                break;
                                        case 3:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/one-event-null-gender.json';
                                                break;
                                        case 4:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/one-event-missing-phase.json';
                                                break;
                                        case 5:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/one-event-empty-sport-field.json';
                                                break;
                                        case 6:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/six-events-one-empty-sport-field.json';
                                                break;
                                        case 7:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/six-events-one-actual-event.json';
                                                break;
                                        case 8:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/medals-table-no-golds.json';
                                                break;
                                        case 9:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/medals-table-wrong-order.json';
                                                break;
                                        case 10:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/medals-table-no-country.json';
                                                break;
                                        case 11:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/latest-result-null-event.json';
                                                break;
                                        case 12:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/latest-result-null-sport.json';
                                                break;
                                        case 13:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/latest-result-empty-gender.json';
                                                break;
                                        case 14:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/empty.json';
                                                break;
                                        case 15:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/null.json';
                                                break;
                                        case 16:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/made-up-name.json';
                                                break;
                                        case 17:
                                                _url='http://data.cnn.com/jsonp/.element/ssi/auto/3.0/SPECIALS/2012/olympics/json/jsonWidget.json?callback=callback_olympicsWidgetFeed';
                                                break;
                                        case 18:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/only-two-medals.json?callback=callback_olympicsWidgetFeed';
                                                break;
                                        case 19:
                                                _url='http://i.cdn.turner.com/cnn/.element/ssi/auto/3.0/SPECIALS/2012/olympics.sample/json/two-bronze.json?callback=callback_olympicsWidgetFeed';
                                                break;
                                }

                        }
                }
                
        };

        return harness;
                
        

}());