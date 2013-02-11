var CNN = CNN || {};

CNN.olympicWidget = (function() {

	var base_path='http://i.cdn.turner.com/cnn/.e/img/3.0/sect/specials/olympics/2012/';

	var timer;
	var xhrResponse = [];
	var _config;
	var _data;

	var isEmpty=function(ob){
		for(var i in ob){ 
			return false;
		}
		return true;
	};

	var isNotValid=function(item){
		if (item == 'undefined' || item==null || item =='')
			return true;
		else
			return false;
	}

	var dateBuilder=function(day,date){
		
		var end_num = date.charAt(date.length - 1);
		var start_num = date.charAt(0);
		var ordinal = 'th';
		if (end_num == '1' && start_num != '1') ordinal = 'st';
		if (end_num == '2' && start_num != '1') ordinal = 'nd';
		if (end_num == '3' && start_num != '1') ordinal = 'rd';
		
		var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
		
		//ordinal removed in production
		//return days[day] + ' ' + date + ordinal;
		return days[day] + ' ' + date;
		
	}

	var getData=function(url){
		xhrResponse=[];
		jQuery.ajax({
			url: url,
			dataType: 'jsonp',
			cache: true,
			jsonpCallback: 'callback_olympicsWidgetFeed',
			success:getOlympicDataSuccess,
			error: getOlympicDataError
		});
	}

	getOlympicDataSuccess = function (data) {

		xhrResponse.push(data);

		//we have the data, check for goodness and split into component parts
		//TODO if empty we should look at timestamps and remove next event if it's already happened
		if(isEmpty(data) || isNotValid(data)) return false;

		_data=data;

		if(_config.section==='medalTable'){
			if(data['medals-table']!== 'undefined'){
				widget.rendermedalsTable(data['medals-table'])
			}
			if(data['medal-table']!== 'undefined'){ 
				//try it singular
				widget.rendermedalsTable(data['medal-table'])
			}
		}else if(_config.section==='nextEvent'){
			if(data['next-event']!== 'undefined'){
				widget.renderNextEvent(data['next-event']);
			}
		}else if(_config.section==='latestResult'){
			if(data['latest-result']!== 'undefined'){
				widget.renderlatestResult(data['latest-result']);
			}
		} else {
			if(data['medal-table']!== 'undefined'){
				widget.rendermedalsTable(data['medal-table'])
			}
			if(data['medals-table']!== 'undefined'){
				widget.rendermedalsTable(data['medals-table'])
			}
			if(data['latest-result']!== 'undefined'){
				widget.renderlatestResult(data['latest-result']);
			}
			if(data['next-event']!== 'undefined'){
				widget.renderNextEvent(data['next-event']);
			}
		}

	};

	getOlympicDataError = function (jqXHR, textStatus, errorThrown) {
		'use strict';
		xhrError = {};
		xhrError.jqXHR = jqXHR;
		xhrError.textStatus = textStatus;
		xhrError.errorThrown = errorThrown;
		if ( typeof console !== "undefined" && console.error) {
			console.error('getOlympicDataError',xhrError)
		}
	};		
	
	createMedalsArry=function(data){
		var medals=[];
		if (data.length==undefined || data.length=='undefined'){
			if(!data || isNotValid(data['country-iso'])){
				return false;
			}
			medals[0]=data;
		}else{
			 for(var i=0; i<data.length; i++) {
				 if (isNotValid(data[i]['country-iso'])) return false;
				 medals[i]=data[i]
			 }
		}
		
		return medals;
	}

	var widget={

			create : function(config){

				if(isEmpty(config) || isEmpty(config.url)){
					//need to determine here whether we can leave Next Event on screen
					//or the event has actually passed
					return false;
				}
				
				if(!jQuery(jQuery(config.target)) || jQuery(jQuery(config.target)).length<=0){
					return false
				}
				
				if(!isNotValid(config.debug) && !isNotValid(config.debug.base_path)){
					base_path=config.debug.base_path; //debug
				}
				
				_config=config;

				getData(config.url);
				
				//do we render the test harness?
				//check for &ow_test=true querystring
				var cnn_queryargs = cnn_geturlqargs();
				if(cnn_queryargs && cnn_queryargs.ow_test && jQuery("#json_test").length==0){
					CNN.olympicWidgetTest.create({target:config.target});
				}

				//do some timestamp stuff
				//get current unix epoch - Math.round(+new Date()/1000)
			},
			
			getData : function(){
				return _data;
			},

			renderNextEvent : function(data){

				clearInterval(timer);

				var target=jQuery(_config.target);
				if(_config.clearTarget){
					jQuery(_config.target + ' #cnn_ow_nextevent').remove();
				}
				
				if(isNotValid(data['events'])) return false;

				var eventCount=parseInt(data['events'].length);

				if(eventCount===1 && (isNotValid(data['events'][0]['sport-name']))) return false;
				
				//convert GMT to BST
				try{
					var bst=new Date(Date.parse('01/01/2000 ' + data['start-time']));
					bst.setHours(bst.getHours() + 1);
					var mins=bst.getMinutes().toString();
					var hrs=bst.getHours().toString();
					(mins.length==1)?mins='0'+mins:'';
					(hrs.length==1)?hrs='0'+hrs:'';
					data['start-time']=hrs + ":" + mins;
				}catch(err){
					return false;
				}
				
				//debug
				if(_config.debug && _config.debug.eventsOneHourAgo){
					var _now=new Date();
					_now.setHours(_now.getHours() - 1)
					data['start-time']=_now.toTimeString();
				}
				
				//check event not already happened
				var _now=new Date();
				if(Date.parse('01/01/2000 ' + _now.toTimeString()) > Date.parse('01/01/2000 ' + data['start-time'])){
					if(_config.debug && !_config.debug.ignoreStartTime){
						return false;
					}
				}

				var s='<div id="cnn_ow_nextevent"><div class="cnn_clear"></div><h4><p style="float:right;font-size:11px;">(Time in London)</p>Coming Up</h4></div>';

				if(jQuery(_config.target + ' #cnn_ow_latestresult').length){
					jQuery(_config.target + ' #cnn_ow_latestresult').after(s)
				}else{
					jQuery(_config.target).append(s);
				}

				//debug
				if(!isNotValid(_config.debug) && _config.debug.event_tomorrow){
					//set event start time to tomorrow for test
					var today=new Date();
					today.setDate(today.getDate() + 1)
					data['start-date']=today.toDateString();
				}
				
				//check if next event is next day, if so prepend the date
				var today=new Date(); 
				var event=new Date(data['start-date']);
				var date='';
				if(event.getDate() > today.getDate() || event.getMonth() > today.getMonth()){
					date=dateBuilder(event.getDay(),event.getDate().toString()) + ' ';
				}
					
				var events=data['events'];
	
				var renderEvent=function(indx){

					if(isNotValid(events[indx]['sport-name'])){
						return;
					}

					if(!isNotValid(events[indx].gender)){
						(events[indx].gender == 'Female')?events[indx].gender = 'Womens':events[indx].gender;
						(events[indx].gender == 'Male')?events[indx].gender = 'Mens':events[indx].gender;
					}else{
						events[indx].gender='';
					}
					if(isNotValid(events[indx].phase)){
						events[indx].phase='';
					}
					if(isNotValid(data['start-time'])){
						data['start-time']='';
					}

					var eventName=events[indx].gender + ' ' + events[indx]['sport-name'] + ' ' + events[indx].phase;
					if((jQuery(target).width() < 300) && eventName.length>42){
						eventName=eventName.substring(0,42) + "...";
					}
					if((jQuery(target).width() > 300) && eventName.length>48){
						eventName=eventName.substring(0,48) + "...";
					}
					
					jQuery(target.find('#cnn_ow_nextevent')).append('<p class="event"><span style="float:right;color:#ca0002"><strong>     ' + date + data['start-time'] + 
							'</strong></span>' + eventName + '</p>');
					
				}

				if(eventCount===1){

					renderEvent(0);

				}else{

					function updateNextEvent(e){

						jQuery(target.find('#cnn_ow_nextevent p.event')).fadeOut(function(){jQuery(this).remove();});
						indx=(indx===(events.length-1)) ? 0 : indx + 1;
						renderEvent(indx);
						jQuery(target.find('#cnn_ow_nextevent p.event')).hide().fadeIn();

					}

					var indx=0;
					timer=setInterval(updateNextEvent, 3500);
					renderEvent(indx);
					updateNextEvent();
				}


			},


			rendermedalsTable : function(data){

				var s='<div id="cnn_ow_medaltable"><h4>Medal Table</h4>';
				s+='<table width="100%" valign="middle">';
				try{
					//check the medals order
					//it will also error out if not 3 results
					var golds=[];
					for(var i=0;i<3;i++){
						golds[i]=parseInt(data[i].gold);
					}
					if((golds[1] > golds[0]) || (golds[2] > golds[1]) || (golds[2] > golds[0])){
						return false;
					}
				}catch(err){
					return false;
				}
				for(var i=0;i<3;i++){

					if(isNotValid(data[i]['country-iso']) || isNotValid(data[i].gold) || isNotValid(data[i].silver) || isNotValid(data[i].bronze)){
						//exit but don't clear the dom
						return false;
					}

					s+='<tr height="20" valign="middle"><td valign="middle" class="flag"><img src="'+base_path+'flags/'+
						data[i]['country-iso'].toLowerCase()+'.png"></td><td class="country"><strong>' +  data[i]['country-iso'] + 
						'</strong></td><td><img src="'+base_path+'gold.png">' + data[i].gold + '</td><td><img src="'+
						base_path+'silver.png">' + data[i].silver + '</td><td><img src="'+base_path+'bronze.png">' + 
						data[i].bronze +  '</td></tr>';
					
				}

				s+='</table></div>';

				//Medals table not time critical so we can re-render after we know we have valid data 
				var target=jQuery(_config.target);
				if(_config.clearTarget){
					jQuery(_config.target + ' #cnn_ow_medaltable').remove();
				}

				jQuery(target).append(s);
				
				//check icon images loaded
				jQuery('#cnn_ow_medaltable img').css('display','none')
				jQuery('#cnn_ow_medaltable img').each(function(){
					jQuery(this).load(function() {
						jQuery(this).css('display','inline')
				    });
					
					jQuery(this).error(function() {
						jQuery(this).css('display','none')
				    });
				});

			},

			renderlatestResult : function(data){

				//No show rules - exit but don't clear the dom object
				if(isNotValid(data["sport-name"]) || isNotValid(data.name)){
					return false;
				}
				
				if((!data.gold || isNotValid(data.gold)) || 
						(!data.silver || isNotValid(data.silver)) ||
						(!data.gold || isNotValid(data.bronze))){
					return false;
				}
				
				var gold=[],silver=[],bronze=[];
				
				gold=createMedalsArry(data.gold);
				if(!gold) return false;
				
				silver=createMedalsArry(data.silver);
				if(!silver) return false;
				
				bronze=createMedalsArry(data.bronze);
				if(!bronze) return false;

				if(!isNotValid(data.gender)){
					(data.gender == 'Female')?data.gender = 'Womens':data.gender;
					(data.gender == 'Male')?data.gender = 'Mens':data.gender;
				}else{
					data.gender='';
				}

				var s='<div id="cnn_ow_latestresult"><h4>Latest Result</h4>';
				s+='<table width="100%">';
				
				s+='<tr height="20"><td width="12px" valign="middle"><img src="'+
					base_path+'icons/'+data["sport-name"]+'.png"></td><td colspan="3">' + 
					'<h5>' + data.gender + ' ' + data.name + '</h5>' + '</td></tr>';
				
				
				 for(var i=0; i<gold.length; i++) {
					 if(isNotValid(gold[i].athlete)){
						 gold[i].athlete=(!isNotValid(gold[i]['country-full'])?gold[i]['country-full']:'')
					}
					(isNotValid(gold[i].result))?gold[i].result='':gold[i].result;
				 }
				 for(var i=0; i<silver.length; i++) {
					 if(isNotValid(silver[i].athlete)){
						 silver[i].athlete=(!isNotValid(silver[i]['country-full'])?silver[i]['country-full']:'')
					 }
					(isNotValid(silver[i].result))?silver[i].result='':silver[i].result;
				 }
				 for(var i=0; i<bronze.length; i++) {
					 if(isNotValid(bronze[i].athlete)){
						 bronze[i].athlete=(!isNotValid(bronze[i]['country-full'])?bronze[i]['country-full']:'')
					 }
					(isNotValid(bronze[i].result))?bronze[i].result='':bronze[i].result;
				 }

				
//				(isNotValid(data.gold.result))?data.gold.result='':data.gold.result;
//				(isNotValid(data.silver.result))?data.silver.result='':data.silver.result;
//				(isNotValid(data.bronze.result))?data.bronze.result='':data.bronze.result;

				 
				for(var i=0; i<gold.length; i++) {
					s+='<tr height="20"><td width="12px" valign="middle"><img src="'+base_path+'gold.png"></td><td class="country"><strong>' +  gold[i]['country-iso'] + '</strong></td><td>' + gold[i].athlete + '</td><td><font color="#ca0002" style="float:right">' + gold[i].result + '</font></td></tr>';
				}
				for(var i=0; i<silver.length; i++) {
					s+='<tr height="20" valign="middle"><td width="12px"><img src="'+base_path+'silver.png"></td><td class="country"><strong>' +  silver[i]['country-iso'] + '</strong></td><td>' + silver[i].athlete + '</td><td><font color="#ca0002" style="float:right">' + silver[i].result + '</font></td></tr>';
				}
				for(var i=0; i<bronze.length; i++) {
					s+='<tr height="20" valign="middle"><td width="12px"><img src="'+base_path+'bronze.png"></td><td class="country"><strong>' +  bronze[i]['country-iso'] + '</strong></td><td>' + bronze[i].athlete + '</td><td><font color="#ca0002" style="float:right">' + bronze[i].result + '</font></td></tr>';
				}
				s+='</table></div>';

				//Because latest result is not time critical we don't need to empty the dom object
				//until we know we've got valid data
				var target=jQuery(_config.target);
				if(_config.clearTarget){
					jQuery(_config.target + ' #cnn_ow_latestresult').remove();
				}

				if(jQuery(_config.target + ' #cnn_ow_medaltable').length>0){
					jQuery(_config.target + ' #cnn_ow_medaltable').after(s);
				}else{
					jQuery(_config.target).append(s);
				}
				
				//check icon images loaded
				jQuery('#cnn_ow_latestresult img').css('display','none')
				jQuery('#cnn_ow_latestresult img').each(function(){
					jQuery(this).load(function() {
						jQuery(this).css('display','inline')
				    });
					jQuery(this).error(function() {
						jQuery(this).css('display','none')
				    });
				});

			}

	};

	return widget;


}());
