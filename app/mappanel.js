

Ext.define('MyPath.mappanel',{
	extend:'GeoExt.panel.Map',
	alias:'Widget.mappanel',	
	title: "Philippine Geoportal - Tourism",   			
	layout:'border',	
	region:'center',
	tPanel:'',
	width:100,
	height:100,
	selLayer:'',		
	execUrl:function(url, callback){
		Ext.Ajax.request({
				url:url,
				success: function(response){
					var obj = Ext.decode(response.responseText);					
					callback(obj)		
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
						Ext.Msg.alert("Geocoding failed", "Please enter location")
					}				
					callback(SourceDest);	
				})		
			},
	
	buildItems:function(){
		return[			
			{	
				xtype:'radiofield',
				boxLabel:'Use current location',
				name:'rb',				
				itemId:'rbt1',								
				checked: true,		
				inputValue:'1',	
				handler:function(){					
					var me=this.up();		
					me.getComponent('btnGo').setDisabled(this.checked);
					me.getComponent('Search').setDisabled(this.checked);						
				}		
			},			
			{
				xtype:'radiofield',
				boxLabel:'Location Search',	
				name:'rb',					
				itemId:'rbt2',								
				checked: false,		
				inputValue:'2',	
			},
			{
				xtype:'textfield',
				itemId:'Search',
				width:200,
				emptyText:'Search',
				disabled:true,
					
            },{
				xtype:'button',
				text:'Go',
				scale:'medium',
				itemId:'btnGo',
				disabled:true,
				handler:function(){				
						
					var me=this.up();				
					var findThis = (me.getComponent('Search').getValue());					
					var me=this.up().up();					
					if  (me.map.getLayersByName('My Location').length > 0) {				
						me.map.getLayersByName('My Location')[0].destroy();					
					};	 				
					
					me.gCode(findThis, function(coord){					
						if  (me.map.getLayersByName('Gcode').length > 0) {				
							me.map.getLayersByName('Gcode')[0].destroy();					
						};		 				
						var currLoc = new OpenLayers.Geometry.Point(coord.a,coord.b).transform('EPSG:4326','EPSG:900913');
						var Location = new OpenLayers.Layer.Vector(	'Gcode', {
								 styleMap: new OpenLayers.StyleMap({'default':{										
										externalGraphic: "./app/chooser/icons/marker.png",				
										graphicYOffset: -25,
										graphicHeight: 35,
										graphicTitle: findThis
								}}), 	
								displayInLayerSwitcher: false,		
							});							
						Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
						me.map.addLayer(Location);						
						me.map.zoomToExtent(Location.getDataExtent());			 		
					})						
				}			
			},{			
				xtype:'button',
				tooltip:'Full extent',
				icon:'./app/chooser/icons/phil.png',
				scale:'medium',
				handler:function(){
					var me=this.up().up();				
					console.log(me);
					me.map.zoomToMaxExtent();	
					
				}	
			},		
			
			{			
				xtype:'button',
				tooltip:'Find route',
				scale:'medium',				
				icon:'./app/chooser/icons/route.png',
				handler:function(){
					var me=this.up().up();				
					console.log(me);					
					var window = Ext.create('MyPath.Routing',{
						mapContainer: me					
					});	
					window.show()	
					
					
				}		
			
			}
		]	
	},
	
	
	
	initComponent:function(){		
	
		var popup, me=this 			
		map = new OpenLayers.Map(				
				{ 
				controls: [
					new OpenLayers.Control.Navigation(),					
					new OpenLayers.Control.Zoom(),
					new OpenLayers.Control.MousePosition(),
										
				],
				
				fallThrough: true,							
				projection: 'EPSG:900913'
				
		});		
		        
       var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
				'NAMRIA Basemap',
				'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
				{
					isBaseLayer: true,
					displayInLayerSwitcher: false,				
				}
		);
			
			
		var Location = new OpenLayers.Layer.Vector('My Location', {
		 displayInLayerSwitcher: false,		
		});	

		var Location2 = new OpenLayers.Layer.Vector('Gcode', {
		 displayInLayerSwitcher: false,		
		});			
		
		
		
		map.addLayers([pgp_basemap_cache, Location, Location2]);		
		map.zoomToMaxExtent()		
		
		
		
		 map.events.register("mousemove", map, function (e) {            
			/* var point = map.getLonLatFromPixel( this.events.getMousePosition(e) )     
			//console.log(point.lon, point.lat)
			var pos = new OpenLayers.LonLat(point.lon,point.lat).transform('EPSG:900913', 'EPSG:4326');
			console.log(pos);*/
			OpenLayers.Strategy.Refresh
		}); 
		
		
		
		map.events.register('click', map, function(e){		
			
			
			
			var point = map.getLonLatFromPixel( this.events.getMousePosition(e) )     
			var pos = new OpenLayers.LonLat(point.lon,point.lat).transform('EPSG:900913', 'EPSG:4326');
			
			if (map.layers.length > 1) {
			
				mapIndex = map.layers.length-1
				
				if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
					mapIndex=mapIndex-1
					if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
						mapIndex=mapIndex-1
					}				
				} 
				
				var topLayer = map.layers[mapIndex].params									
				console.log(topLayer)
				var url = "http://geoserver.namria.gov.ph/geoserver/geoportal/wms?" +
						    "request=GetFeatureInfo" + 
							"&service=WMS" + 
							"&version=1.1.1" + 
							"&layers=" + topLayer.LAYERS + 
							"&styles=" + topLayer.STYLES +  
							"&srs=" + topLayer.SRS + 			
							"&format=" + topLayer.FORMAT +							
							"&bbox=" + map.getExtent().toBBOX() +
							"&width=" + map.size.w + 
							"&height=" + map.size.h + 
							"&query_layers=geoportal:" + topLayer.LAYERS + 
							"&info_format=application/json" + 
							"&feature_count=" + 10 + 
							"&x=" + Math.round(e.xy.x) + 
							"&y=" + Math.round(e.xy.y) + 
							"&exceptions=application/json";
					url = "/webapi/get.ashx?url=" + escape(url);	
					
						me.execUrl(url, function(callback){										
								if (callback.features.length > 0){							
									console.log(e);
									var pos =  e.xy	
									
									var feature =callback.features[0]
									var layer_config = MyPath.Utilities.getLayerConfig(topLayer.LAYERS, topLayer.STYLES );	
									console.log(layer_config);
									var data = {};
									Ext.each(layer_config.config, function(item, index){
										data[item.alias] = feature.properties[item.attribute];
									});
									
									if (popup) {
										popup.close();
									}
									//console.log(callback.features[0].properties)
									popup = Ext.create('GeoExt.window.Popup', {
										title: "Feature Information",
										location: pos,
										map:map,	
										width: 300,	
										height:150,							
										items: {
											xtype:'propertygrid',
											//source:callback.features[0].properties,
											source:data,
											hideHeaders: false,
											sortableColumns: false
										},
										autoScroll: true
									})
									popup.show();
								}									
						})						
			}
		});  
		
		Ext.apply(this, {
			map:map,
			dockedItems: [
				{ xtype: 'toolbar',
				  dock: 'top',
				  items: this.buildItems(),
				}
			]			
		});		
		this.callParent();   
    }	
	
	
});


