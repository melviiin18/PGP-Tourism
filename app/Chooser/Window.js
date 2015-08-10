/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chooser.Window
 * @extends Ext.window.Window
 * @author Ed Spencer
 * 
 * This is a simple subclass of the built-in Ext.window.Window class. Although it weighs in at 100+ lines, most of this
 * is just configuration. This Window class uses a border layout and creates a DataView in the central region and an
 * information panel in the east. It also sets up a toolbar to enable sorting and filtering of the items in the 
 * DataView. We add a few simple methods to the class at the bottom, see the comments inline for details.
 */

Ext.define('MyPath.Chooser.Window', {
    extend: 'Ext.panel.Panel',      
	TPanel:'',	 
	mappanel:'',    
    width : 330,
    title : 'Choose a layer',	
	collapsible:true,				
	layout:'fit',    
    border: false,
    bodyBorder: false,
	loadLayer:function(selectedImage){
		var me = this
		var layername = selectedImage.data.name;
		var layer = selectedImage.data.url;
		var isWMS=	selectedImage.data.isWms;
		var type = layer;		
		
		if(this.mappanel.map.getLayersByName(layername).length > 0) {				
			this.mappanel.map.getLayersByName(layername)[0].destroy();		
			
		};
		
		if (!isWMS){			
			var icon='./app/chooser/icons/' + layername + '.png'
			var vectorLayer = new OpenLayers.Layer.Vector(layername, {									
				styleMap: new OpenLayers.StyleMap({'default':{										
					externalGraphic: icon,			
					graphicYOffset: -25,
					graphicHeight: 30,					
				}}), 								
			})		
			
			selectctrl = new OpenLayers.Control.SelectFeature(
			vectorLayer,
				{
				 clickout: false, 
				 toggle: false,
				 multiple: false, 
				 hover: false,	
				}				
			)
					
			
			this.mappanel.map.addControl(selectctrl)		
			selectctrl.activate();    		
			vectorLayer.events.on({
				"featureselected": function(event) {
					popup = Ext.create('GeoExt.window.Popup', {
					title: "Feature Information",
					//location: pos,
					map:map,	
					width: 300,	
					height:150,							
					items: {
						xtype:'propertygrid',
						source:event.feature.data,
						hideHeaders: false,
						sortableColumns: false
					},
					autoScroll: true
				})
				popup.show();			
				
			}
			});
			
			var bott = me.mappanel.map.getExtent().transform('EPSG:900913', 'EPSG:4326').bottom			
			var left = me.mappanel.map.getExtent().transform('EPSG:900913', 'EPSG:4326').left
			var top = me.mappanel.map.getExtent().transform('EPSG:900913', 'EPSG:4326').top
			var right = me.mappanel.map.getExtent().transform('EPSG:900913', 'EPSG:4326').right
			
			

			 var bounds = new google.maps.LatLngBounds(
			    new google.maps.LatLng(bott,left), 
			    new google.maps.LatLng(top,right)				
			);  
			
			

			
			/* var type
			
			if (layername=='Hotels'){
				type='lodging'
			}else{
				type='bus station'
			} */
			
			var request = {				
				location:bounds.getCenter(),
				//rankby:'distance',
				radius: '3000',					
				keyword:type	
				
				
			};			
			var service = new google.maps.places.PlacesService(me.mappanel.map.baseLayer.div);			
			service.nearbySearch(request, function callback(results, status, pagination){
					
					if (status == google.maps.places.PlacesServiceStatus.OK) {																		
						me.createMarker(results, vectorLayer, icon);									
					 }								
				    if (pagination.hasNextPage) {
						pagination.nextPage();
					} 				  										
			});	 					
		
		}else{		
		
						
			//change the PEC layername to PES then load the PHS layer			    
			if (layername.indexOf('School')>-1){			
				layername = 'Public Elementary School'			
				
				var Layer2 = new OpenLayers.Layer.WMS(
					'Public High School',
					'http://geoserver.namria.gov.ph/geoserver/geoportal/wms', 
					{
						layers:'depedpublichs_updated_052014',				
						transparent:true						
					},
					{
						//isBaseLayer:false,
						opacity:.7
					}
				); 		
				this.mappanel.map.addLayer(Layer2);		
			}
			
				
			 var Layer1 = new OpenLayers.Layer.WMS(
				layername,
				'http://geoserver.namria.gov.ph/geoserver/geoportal/wms',
				{
					layers:layer,					
					transparent:true						
				},
				{					
					opacity:.7,
					
				}
			); 		 			
			this.mappanel.map.addLayer(Layer1);		
		}
	
	
	},
	createMarker: function(place, vLayer, icon){			
		var pointFeatures=[]
		console.log(place);		
	     for (var i = 0; i < place.length; i++) {		   
			 
		   var point = new OpenLayers.Geometry.Point(place[i].geometry.location.K,place[i].geometry.location.G).transform('EPSG:4326','EPSG:900913')
		   var PointAttr = {'name':place[i].name,'type':place[i].types[0], 'vicinity':place[i].vicinity }
		   var pointFeature = new OpenLayers.Feature.Vector(point, PointAttr, {
				pointRadius: 16,
				//fillOpacity: 0.7,
				externalGraphic: icon//place[i].icon,
			});
		   pointFeatures.push(pointFeature);   
		} 
		vLayer.addFeatures(pointFeatures)
		this.mappanel.map.addLayer(vLayer);							
		this.mappanel.map.layers[0].redraw();
	},
    
    /**
     * initComponent is a great place to put any code that needs to be run when a new instance of a component is
     * created. Here we just specify the items that will go into our Window, plus the Buttons that we want to appear
     * at the bottom. Finally we call the superclass initComponent.
     */
    initComponent: function() {
        this.items = [
            {
                xtype: 'panel',
                region: 'west',
                autoScroll: true,					
                items: [
				{
                    xtype: 'iconbrowser',
                    id: 'img-chooser-view',
                    listeners: {
                        scope: this,
                        selectionchange: this.onIconSelect,
						itemdblclick: this.onIconSelect
                    }				
                }]
            }					
			
        ];            
        
		this.callParent();        
       
    },   
    /**
     * Called whenever the user clicks on an item in the DataView. 
     */	 
	 
	onIconSelect: function(dataview, selections) {
	
		var me=this;
		var selectedImage = this.down('iconbrowser').selModel.getSelection()[0];
			
		if(this.mappanel.map.getLayersByName('My Location').length > 0) {				
			this.mappanel.map.getLayersByName('My Location')[0].destroy();					
		};	
		
		
		if (this.mappanel.dockedItems.items[1].getComponent('rbt1').checked){	
			
			if(this.mappanel.map.getLayersByName('Gcode').length > 0) {				
				this.mappanel.map.getLayersByName('Gcode')[0].destroy();					
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
						me.mappanel.map.addLayers([Location]);												
						me.mappanel.map.zoomToExtent(Location.getDataExtent());	
						me.loadLayer(selectedImage);	
						}
				)		
				
			} else {
				console.log("Geolocation is not supported by this browser.");
			}
		}else{
			me.loadLayer(selectedImage);		
		}
		
    },  
	
    /**
     * Fires the 'selected' event, informing other components that an image has been selected
     */
    fireImageSelected: function() {
        var selectedImage = this.down('iconbrowser').selModel.getSelection()[0];        
        if (selectedImage) {
            this.fireEvent('selected', selectedImage);
        
        }
    }
	
});
