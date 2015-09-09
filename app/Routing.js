//var SourceDest={};	

Ext.define('MyPath.Routing',{
	extend: 'Ext.window.Window',	
	width:370,	
	height:180,	
	title:'Route',
	alias: 'widget.Routing',			
	mapContainer:'',   		
	autoScroll:true,
	bodyPadding:10,
	findRoute:function(Srclat, Srclong, Destlat, Destlong, callback){
		var url = 'http://www.yournavigation.org/api/1.0/gosmore.php' +
					'?&flat=' + Srclat +  
					'&flon=' + Srclong +
					'&tlat=' + Destlat + 
					'&tlon=' + Destlong +  
					'&v=motorcar&fast=0&layer=mapnik&instructions=1&format=geojson'
		url = url = "/webapi/get.ashx?url=" + escape(url);			
		Ext.Ajax.request({			
			 url : url, 								
			//url:'http://localhost:3000/www.yournavigation.org/api/1.0/gosmore.php?format=kml&flat=14.5176184&flon=121.05086449999999&tlat=14.1876712&tlon=121.12508249999996&v=motorcar&fast=1&layer=mapnik&instructions=1&format=geojson',			
			success: function(response){
				var obj = Ext.decode(response.responseText);			
				callback(obj);					
			},
				failure: function(response){
				var obj = Ext.decode(response.responseText);				
				Ext.Msg.alert('Error:', obj);
			}
			
		});
	},
	gCode:function(addr, callback){	  
		var geocoder = new google.maps.Geocoder();					
		geocoder.geocode({ 'address': addr }, function (results, status) {					
			if (status == google.maps.GeocoderStatus.OK) {		
				var xx=results[0].geometry.location.lng();			
				var yy=results[0].geometry.location.lat();		
				SourceDest={a:xx, b:yy};							
			}else{
				console.log("Geocoding failed: " + status); 
				Ext.Msg.alert("Geocoding failed")
			}				
			callback(SourceDest);	
		})		
	},
	initComponent:function(){			
		this.items = this.buildItems();
		this.buttons = this.buildButtons();
		this.callParent();	
	},	
	buildItems:function(){
		return[{		
				xtype: 'textfield',
				value: '',				
				itemId: 'PntA',
				emptyText:'e.g. Street, City',
				width:320,								
				fieldLabel: '<img STYLE="position:absolute; TOP:2px; LEFT:85px; WIDTH:25px; HEIGHT:25px" src="./icons/org.png" class="info_image" data-qtip="your help text or even html comes here...."></img>Origin', 
			},{
				xtype: 'textfield',
				value:'',
				
				width:320,
				itemId: 'PntB',	
				emptyText:'e.g. Street, City',				
				fieldLabel: '<img STYLE="position:absolute; TOP:35px; LEFT:85px; WIDTH:20px; HEIGHT:20px" src="./icons/dest.png" class="info_image" data-qtip="your help text or even html comes here...."></img> Destination ',
				
				
			}];				
	},
	buildButtons:function(){
		return[{
			xtype:'button',				
			itemId:'Route',
			text:'Find route',		
			handler:function(){		
			
				var me = this.up('panel');					
				me.update('');
				if  (map.getLayersByName('Route').length > 0) {				
					 map.getLayersByName('Route')[0].destroy();					
				}				
				
				var pnt1 = me.getComponent('PntA').getValue();				
				var pnt2 = me.getComponent('PntB').getValue();
				
				var vectorLayer = new OpenLayers.Layer.Vector(	'Route', {
					styleMap: new OpenLayers.StyleMap({'default':{
							strokeWidth: 5,
							strokeColor: '#005aff'
					}}),
					//displayInLayerSwitcher: false,		
				
				});																		
				
				//Start routing here
				me.gCode(pnt1, function(result){															
						me.gCode(pnt2, function(result1){						
								me.findRoute(result.b, result.a, result1.b, result1.a, function(result2){									
									var coords=result2.coordinates;										
									//console.log(result2.properties.description);										
									var strCaption ='<br> Instructions: <br><br>' 
									me.update(strCaption.bold() + result2.properties.description);
									var Apoints=[];		
									for(var i in coords){
										var coordinate = coords[i];
										Apoints.push(new OpenLayers.Geometry.Point(coordinate[0], coordinate[1]));																					
									} 									
									var lineString = new OpenLayers.Geometry.LineString(Apoints).transform('EPSG:4326', 'EPSG:900913');
									//
									var origin = lineString.components[0]
									var lastIndex = Apoints.length
									console.log(lastIndex);
									var destination = lineString.components[lastIndex-1]
									console.log(destination)
									
									var style2 = {
										externalGraphic: "./icons/org.png",				
										graphicYOffset: -25,
										graphicHeight: 35,		
										graphicTitle:'Origin',						
									}
									var style3 = {
										externalGraphic: "./icons/dest.png",				
										graphicYOffset: -25,
										graphicHeight: 35,		
										graphicTitle:'Destination',						
									}
									
									//	
									
									var lineFeatures = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Collection([lineString]));	
									origin = new OpenLayers.Feature.Vector(origin, null, style2);	
									destination = new OpenLayers.Feature.Vector(destination, null, style3);	
									vectorLayer.addFeatures([lineFeatures, origin, destination]);
									map.addLayers([vectorLayer]);																
									map.zoomToExtent(vectorLayer.getDataExtent());	
										
									
								})
							
						});					
				});				
			}	
			
		},
		{
			xtype:'button',				
			itemId:'Close',
			text:'Close',
			handler:function(){
				this.up('panel').close()		
			}
		}];
	
	}
	
});




