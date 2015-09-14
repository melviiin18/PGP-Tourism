

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
	pgsGetFeatureInfo:'',	
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
				geocoder.geocode({ 'address': addr + ' Philippines'}, function (results, status) {					
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
		var items = [];
		var me=this;		
		
		
		// zoom in
		items.push(
			Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
				control: new OpenLayers.Control.ZoomBox(),
				id: 'btnZoomIn',
				map: map,
				iconCls: 'add',
				iconAlign: 'top',
				icon: 'img/zoom_in.png',
				scale: 'large',
				width: 25, 
				height: 25,
				toggleGroup: 'navigation',
				allowDepress: false,
				tooltip: 'Zoom in',
				handler: function() {
				  if (navigator.appName == "Microsoft Internet Explorer") {
					me.body.applyStyles('cursor:url("img/zoom_in.cur")');
				  }
				  else {
					me.body.applyStyles('cursor:crosshair');
				  }
				}
			}))
		);
		
		
		// zoom out
		items.push(
			Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
				control: new OpenLayers.Control.ZoomBox({out: true}),
				id: 'btnZoomOut',
				map: map,
				iconCls: 'add',
				iconAlign: 'top',
				icon: 'img/zoom_out.png',
				toggleGroup: 'navigation',
				tooltip: 'Zoom out',
				scale: 'large',
				width: 25, 
				height: 25,
				handler: function() {				
					
				  if (navigator.appName == "Microsoft Internet Explorer") {
					me.body.applyStyles('cursor:url("img/zoom_in.cur")');
				  }
				  else {
					me.body.applyStyles('cursor:crosshair');
				  }
				}
			}))
		);
		
		
		// pan
		items.push(
			Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
				control: new OpenLayers.Control.DragPan(),
				id: 'btnPan',
				map: map,
				iconCls: 'add',
				iconAlign: 'top',
				icon: 'img/identify.png',
				scale: 'large',
				width: 25, 
				height: 25,
				toggleGroup: 'navigation',
				tooltip: 'Pan/Identify',
				pressed: true,
				handler: function() {					
					me.body.applyStyles('cursor:default');
				},
				listeners: {
					toggle: function(e){
						if(e.pressed) {
							//info.activate();							
							me.pgsGetFeatureInfo.activate();
						} else {
							//info.deactivate();			
							console.log(me);	
							me.pgsGetFeatureInfo.deactivate();							
						} 
					}
				}
			}))
		);
		
		
		items.push(
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
			}								
		);
		
		items.push(
			{	
				xtype:'radiofield',
				boxLabel:'Location Search',	
				name:'rb',					
				itemId:'rbt2',								
				checked: false,		
				inputValue:'2',	
			}
		);
		
		//search field
		items.push(
			{
				xtype:'textfield',									
				itemId:'Search',
				width:200,
				emptyText:'Location Search',
				disabled:true,

			}
		);
		
		
	
		//Go button		
		items.push(
			{
				xtype:'button',
				text:'Go',
				itemId:'btnGo',
				//disabled:true,
				handler:function(){								
					var me=this.up();				
					var findThis = (me.getComponent('Search').getValue());					
					if (findThis){
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
					}else{
						Ext.Msg.alert('Message', 'Please enter a location');
					}	
				}	
			}		
		
		);
		
		//Get current location button
		items.push(
			{	
				xtype:'button',
				tooltip:'My current location',
				name:'rb',				
				itemId:'btnLoc',
				scale:'large',				
				icon:'./app/chooser/icons/myCurrLoc.png',
				width:25,
				height:25,	
				handler:function(){					
					var me=this.up('panel');								
					if(map.getLayersByName('Gcode').length > 0) {				
						map.getLayersByName('Gcode')[0].destroy();					
					};		
					
					if (navigator.geolocation) {   
		
				/** Overlay current location*/		
						navigator.geolocation.getCurrentPosition(
							function(position){					
								var currLoc = new OpenLayers.Geometry.Point(position.coords.longitude,position.coords.latitude).transform('EPSG:4326', 'EPSG:900913');								
								var Location = new OpenLayers.Layer.Vector(	'My Location', {
										styleMap: new OpenLayers.StyleMap({'default':{
												externalGraphic: "./app/chooser/icons/MyLocation.png",				
												graphicYOffset: -25,
												graphicHeight: 35,
												graphicTitle: "You're here"
										}}) ,
										displayInLayerSwitcher: false,		
										
									});		
								Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
								map.addLayers([Location]);												
								map.zoomToExtent(Location.getDataExtent());		
								}
						)		
						
					} else {
						console.log("Geolocation is not supported by this browser.");
					}						
				}		
			}
		);
		
		//full extent
		items.push(
			{			
				xtype:'button',
				tooltip:'Full extent',
				icon:'./app/chooser/icons/phil.png',
				scale:'medium',
				width:25,
				height:25,
				handler:function(){
					var me=this.up().up();									
					OthoExtent = new OpenLayers.Bounds(120.613472,14.295979, 121.550385,14.827789).transform('EPSG:4326','EPSG:900913')
					
					var lonlat = new OpenLayers.LonLat(121,14).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
					map.setCenter(lonlat);
					if (map.baseLayer.name=="BING Aerial Map")
						map.zoomTo(5);
					else if (map.baseLayer.name=="OpenStreetMap")					  
						map.zoomTo(6);
					else if (map.baseLayer.name=="Google Map - Satellite")
						map.zoomTo(6);
					else if (map.baseLayer.name=="ArcGIS Online - Imagery")
						map.zoomTo(6);		
					else if (map.baseLayer.name=="Ortho Image 2011 - Metro Manila")	
						map.zoomToExtent(OthoExtent);
					else
						map.zoomTo(1);
				}
			}
		);
		
		//measure tool
		items.push(
			{
				xtype:'button',
				tooltip:'Measure tool',
				icon:'./img/measure.png',
				scale:'large',
				width:25,
				height:25,
				handler:function(){
					var me = this.up().up();				
					//console.log(Ext.WindowManager.getActive())
					if(!Ext.getCmp('measureToolWindow')){
						var win = Ext.create('MyPath.MeasureTool', {
							map:map,	
							id: 'measureToolWindow'		
						})					
						win.show();					
					}	
					
				}
			}
		);
		
		//Routing
		items.push(
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
		)
		
		items.push(
			'->',
			{
				xtype:'tbtext',
				itemId:'basemapLabel',
				text: 'Basemap: NAMRIA Basemaps'
			
			},
			'->'
		)
		

		
		//switch basemap
		items.push(					
			
			{
				xtype:'button',
				scale:'large',
				itemId:'btnSwitch',
				icon:'./img/layers.png',				
				width:68,
				height:30,	
				tooltip:'Switch basemap',
				menu     : [
					{
						text: 'NAMRIA Basemaps',
						group: 'basemap',
						checked: true,
						handler: function(){
							map.setBaseLayer(map.layers[0]);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);													
						}
					},
					{
						text: 'Ortho Image 2011 - Metro Manila',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[1]);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
							
						}
					},
					{
						text: 'Bing Maps - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[2]);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
							
						}
					},
					{
						text: 'ArcGIS Online - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[3]);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Open Street Map',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[4]);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Google Map - Satellite',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[5]);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},
					'-',
					{
						text: '&nbsp &nbsp &nbsp &nbsp<b>NOTE:</b><br/>&nbsp &nbsp &nbsp &nbspWE HAVE OBSERVED SOME DISCREPANCIES <br/>&nbsp &nbsp &nbsp &nbspBY AS MUCH AS 10 METERS WHEN USING BASEMAPS<br/>&nbsp &nbsp &nbsp &nbspOTHER THAN THE NAMRIA BASEMAPS AND<br/>&nbsp &nbsp &nbsp &nbspORTHO IMAGE 2011-METRO MANILA.  USERS ARE <br/>&nbsp &nbsp &nbsp &nbspADVISED TO TAKE THE NECESSARY PRECAUTIONS<br/>&nbsp &nbsp &nbsp &nbspESPECIALLY WHEN VIEWING THE ACTIVE FAULTS<br/>&nbsp &nbsp &nbsp &nbsp(VALLEY FAULT SYSTEM) USING OTHER BASEMAPS.',
						plain: true
					}
			   ]
				
			}
		)
		return items;							
	},
	
	
	
	initComponent:function(){		
	
		var popup, me=this 			
		map = new OpenLayers.Map(				
				{ 
				controls: [
					new OpenLayers.Control.Navigation(),							
					new OpenLayers.Control.MousePosition(),
										
				],
				
				fallThrough: true,							
				projection: 'EPSG:900913'
				
		});		
		//Map config
		var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
		//var layerMaxExtent = new OpenLayers.Bounds(11128623.5489416,-55718.7227285097,16484559.8541582,3072210.74548981);
		var layerMaxExtent = new OpenLayers.Bounds( 11516520.903064, 482870.29798867,  15821300.345956,  2448728.3963715);		
		var units = 'm';
		var resolutions = [ 3968.75793751588, 
							2645.83862501058, 
							1322.91931250529, 
							661.459656252646, 
							264.583862501058, 
							132.291931250529, 
							66.1459656252646, 
							26.4583862501058, 
							13.2291931250529, 
							6.61459656252646, 
							2.64583862501058, 
							1.32291931250529, 
							0.661459656252646 ];
		var tileSize = new OpenLayers.Size(256, 256);
		var projection = 'EPSG:900913';
		var tileOrigin = new OpenLayers.LonLat(-20037508.342787,20037508.342787);
		//


        //PGP Basemap
       var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
				'NAMRIA Basemap',
				'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
				{
					isBaseLayer: true,
					displayInLayerSwitcher: false,				
				}
		);
			
		//Ortho
		var pgp_ortho_mm_cache = new OpenLayers.Layer.ArcGISCache( "Ortho Image 2011 - Metro Manila",
			"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_OrthoImage/MapServer", {
			//"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer", {
			isBaseLayer: true,

			//From layerInfo above                        
			resolutions: resolutions,                        
			tileSize: tileSize,
			tileOrigin: tileOrigin,
			maxExtent: layerMaxExtent, 
			projection: projection,
			displayInLayerSwitcher: false
		},
		{
			//additional options
			transitionEffect: "resize"
		});
			
		//Bing
		
		var bing_aerial = new OpenLayers.Layer.Bing({
			name: "BING Aerial Map",
			key: 'AkRWcFAhv1-J1MxSfE5URc4jiUjoL96_frNidZic_5fLeQ54al4UqXcKKr04l2ud',
			type: "Aerial",
			displayInLayerSwitcher: false
			
		}, {
			isBaseLayer: true,
			visibility: false,
			transitionEffect: "resize"
		});
		
		//ArcGIS
		
		var arcgis_world_imagery = new OpenLayers.Layer.ArcGIS93Rest("ArcGIS Online - Imagery", 
		'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export',
		{
			layers: 'show:0,1,2,3',
			format: 'png24'
		}, 
		{
			//additional options
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});
		
		//Open Street Map
		var osm  = new OpenLayers.Layer.OSM("","",
		{
			sphericalMercator: true,
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});	
		
			
	   //Google
	   var google_satellite = new OpenLayers.Layer.Google(
                "Google Map - Satellite",
                {
					type: google.maps.MapTypeId.SATELLITE, 
					numZoomLevels: 22,
					sphericalMercator: true,
					transitionEffect: "resize",
					isBaseLayer: true,
					displayInLayerSwitcher: false
				}
        );




		
		var Location = new OpenLayers.Layer.Vector('My Location', {
		 displayInLayerSwitcher: false,		
		});	

		var Location2 = new OpenLayers.Layer.Vector('Gcode', {
		 displayInLayerSwitcher: false,		
		});			
		
		
		
		map.addLayers([pgp_basemap_cache,pgp_ortho_mm_cache,bing_aerial, arcgis_world_imagery, osm, google_satellite, Location, Location2]);		
		map.zoomToMaxExtent()		
		
		
		//new identify feature 
			OpenLayers.Control.PGSGetFeatureInfo = OpenLayers.Class(OpenLayers.Control, {                
			defaultHandlerOptions: {
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
			},
			maxFeatures: 1,
			queryVisible: true,
			initialize: function(options) {
				this.handlerOptions = OpenLayers.Util.extend(
					{}, this.defaultHandlerOptions
				);
				OpenLayers.Control.prototype.initialize.apply(
					this, arguments
				); 
				this.handler = new OpenLayers.Handler.Click(
					this, {
						'click': this.click
					}, this.handlerOptions
				);
			}, 
			queryLayer: function(e, layer){
				console.log(layer);
				var layer_name = (layer.params.LAYERS || layer.params.layers).replace("geoportal:","");
				var url = layer.url + "?" + 
							"request=GetFeatureInfo" + 
							"&service=WMS" + 
							"&version=1.1.1" + 
							"&layers=" + layer_name + 
							//"&styles=" + (layer.params.STYLES || layer.params.styles) +  
							"&srs=" + (layer.params.SRS || layer.params.srs) + 
							"&format=" + (layer.params.FORMAT || layer.params.format) + 
							"&bbox=" + map.getExtent().toString()+  
							"&width=" + map.getSize().w + 
							"&height=" + map.getSize().h + 
							"&query_layers=" + (layer.params.LAYERS || layer.params.layers) + 
							"&info_format=application/json" + 
							"&feature_count=" + this.maxFeatures + 
							"&x=" + e.xy.x + 
							"&y=" + e.xy.y + 
							"&exceptions=application/json";
							//"&exceptions=application%2Fvnd.ogc.se_xml";
				
				var retVal;
				
				// temporary fix 24 SEP 2014 ghelo
				//url = url.replace('geoserver.namria.gov.ph','202.90.149.232');
				//
				console.log(url);

				
				
				Ext.Ajax.request({
					async: false,
					url: '/webapi/get.ashx?url=' + escape(url),
					success: function(response){
						var obj = Ext.decode(response.responseText);	
						retVal = obj.features;
						
 					},
					failure:function(res){
						console.log(res);
					}
				});
				
				return retVal;
			},
			click: function(e) {				
				OpenLayers.Element.addClass(this.map.viewPortDiv, "olCursorWait");
				
				for(var index = map.layers.length-1;index >= 0;index--){
					var layer = this.map.layers[index];
					
					if(layer instanceof OpenLayers.Layer.WMS &&
						(!this.queryVisible || layer.getVisibility())) {
						// make sure this is a WMS layer and the layer is visible
						var features = this.queryLayer(e, layer);
						console.log('FEATURES', features);
						if(features.length == 0)
							continue;
						this.events.triggerEvent("getfeatureinfo", {xy: e.xy, 
																	layerName: (layer.params.LAYERS || layer.params.layers), 
																	layerTitle: layer.name, 
																	style: (layer.params.STYLES || layer.params.styles),
																	features: features});	
						OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
						break;
					}
				}
				
				OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
				
			}

		});
		
		
		
			this.pgsGetFeatureInfo = new OpenLayers.Control.PGSGetFeatureInfo({
				eventListeners: {
					'getfeatureinfo' : function(e){
					
						if(e.features.length == 0)
							return;
							
						var feature = e.features[0];
					
						var layer_name = e.layerName.replace("geoportal:","");
						var style = e.style;
						var layer_config = MyPath.Utilities.getLayerConfig(layer_name, style);
						console.log(layer_name);
						var data = {};
						Ext.each(layer_config.config, function(item, index){
							data[item.alias] = feature.properties[item.attribute];
						});

						var popup = Ext.create('GeoExt.window.Popup', {
							maximizable: false,
							collapsible: true,
							anchorPosition: 'top-left',
							title: layer_config.title,
							maxHeight: 300,
							width: 250,
							layout: "fit",
							map: map,
							location: e.xy,
							items: {
								xtype:'propertygrid',
								source: data,
								hideHeaders: false,
								sortableColumns: false
							}
						});
						popup.show();
					}
				}
		});
		map.addControl(this.pgsGetFeatureInfo);
		this.pgsGetFeatureInfo.activate();
		
		//

		
		Ext.apply(this, {
			map:map,
			dockedItems: [
				{ xtype: 'toolbar',
				  dock: 'top',
				  items: this.buildItems(),
				  enableOverflow: true
				}
			]			
		});		
		this.callParent();   
    }	
	
	
});


