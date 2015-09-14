
Ext.Loader.setConfig({
disableCaching: false,
enabled: true,
paths: {   
    MyPath:'./App',
	GeoExt: "./lib/GeoExt",		
	} 
});

Ext.application({
    name: 'OL3EXT4',	
	requires:[
		'MyPath.LoadedLayerContextMenu',
		'MyPath.MeasureTool',
		'MyPath.Utilities',
		'MyPath.LayerFilter',
		'MyPath.mappanel',				
		'MyPath.Routing',	
		'MyPath.Chooser.Window', 
		'MyPath.Chooser.IconBrowser',		
		'GeoExt.container.WmsLegend', //needed to display legend in the legendpanel
		'GeoExt.tree.Panel',
		'Ext.tree.plugin.TreeViewDragDrop',
		'GeoExt.tree.OverlayLayerContainer',
		'GeoExt.tree.BaseLayerContainer',
		'GeoExt.data.LayerTreeModel',
		'GeoExt.tree.View',		
		'GeoExt.tree.Column',		
		],
    launch: function () {
			
		
		var store = Ext.create('Ext.data.TreeStore', {
            model: 'GeoExt.data.LayerTreeModel',
            root: {
                plugins: [{
                    ptype: "gx_layercontainer",
                    loader: {
                        createNode: function(attr) {                            							
							if (attr.text=="Hotels" || attr.text=="Bus Stations" || attr.text=="Route"){
								
								attr.component = {
									xtype: "gx_overlaylayercontainer",
									layerRecord: MapPanel.layers.getByLayer(attr.layer),
									showTitle: false,
									icon:'./app/chooser/icons/' + attr.text + '.png',
									// custom class for css positioning
									// see tree-legend.html
									cls: "legend"
								};
								return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
							}else{
								// add a WMS legend to each node created								
								attr.component = {
									xtype: "gx_wmslegend",
									layerRecord: MapPanel.layers.getByLayer(attr.layer),
									showTitle: false,
									// custom class for css positioning
									// see tree-legend.html
									cls: "legend"
								};
								return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
							}	
                        }
                    }
                }]
            }
        }); 
		
		var tree = Ext.create('GeoExt.tree.Panel', {
            region: "east",
            title: "Layers",
            width: 250,
            autoScroll: true,
			collapsible:true,
			viewConfig: {
                plugins: [{
                    ptype: 'treeviewdragdrop',
                    appendOnly: false
                }]
            },
            store: store,
            rootVisible: false,
            lines: false
        });  
		
		var MapPanel= Ext.create('MyPath.mappanel',{
			tPanel:tree
		
		});		
	
 		
		var ChooserPanel = Ext.create('MyPath.Chooser.Window', {
			id: 'img-chooser-dlg',
			region:'west',									
			mappanel:MapPanel,	
			TPanel:tree	
			}	
		);    		
		
		
			
		tree.on('itemcontextmenu', function(view, record, item, index, event){
            //alert(record)
			console.log(event.getXY);
			showContextMenu(record,event.getXY())
            //treePanelCurrentNode = record;
            //menu1.showAt(event.getXY());
            event.stopEvent();
		},this);		
		
		//
		function showContextMenu(record, coord){
	
			var contextMenu = Ext.create('MyPath.LoadedLayerContextMenu', {
				width: 160,
				items: [
					{
						text        : '0%&nbsp;&nbsp;&nbsp;&nbsp;Opacity&nbsp;&nbsp;&nbsp;&nbsp;100%',
						canActivate : false,
						hideOnClick : true,
						shadow: true,
						style       : {
								marginTop  : '-5px',
								fontSize   : '9px'
							}
					},
					Ext.create('Ext.slider.Single', {
						width: 100,
						value: 100,
						increment: 1,
						minValue: 0,
						maxValue: 100,
						listeners : {
										change : function(slider,newVal) {
											record.raw.layer.setOpacity(newVal/100)
										}
									} 
					}),
					{
						text: 'Move to top',
						handler: function(){
							record.raw.layer.map.setLayerIndex(record.raw.layer, record.raw.layer.map.layers.length-1);
						}
					
					},
					{
					text: 'Filter',
					handler: function(){
						var layer = record.raw.layer;
						var filterData = [];
						
						if(layer.filterData)
							filterData = layer.filterData;
						
						// remove prefix "geoportal:"
						var layerName = layer.params.LAYERS.replace("geoportal:","");
						var style = (layer.params.STYLES || layer.params.styles);


						var win = Ext.create('MyPath.LayerFilter', { 
							title: 'Filter', 
							layerName: layerName,
							filterData: filterData,
							style: style,
							listeners: {
								close: function(){
									layer.params.cql_filter = win.getCQL();
									layer.filterData = win.getFilterData(); 
									layer.redraw(true);
								}
							}
						});
						win.show();
							
					}
				
				},
					{
						text: 'Zoom to extent',
						handler: function(){
						
							var layer = record.raw.layer;
							var layerName = layer.params.LAYERS.replace("geoportal:","");
							
							var mapProjection = record.raw.layer.map.projection.replace("EPSG:","");
							
							var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymax from " + layerName;

							Ext.Ajax.request({
								
								url: "/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
								method: 'GET',
								success: function(r){
									var obj = Ext.decode(r.responseText);
									var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
									record.raw.layer.map.zoomToExtent(bounds);
								}
							});
							 
							
							
						}
					
					},
					{
						text: 'Zoom to make visible',
						handler: function(){
						
							var layer = record.raw.layer;
							var layerName = layer.params.LAYERS.replace("geoportal:","");
							
							var mapProjection = record.raw.layer.map.projection.replace("EPSG:","");
							
							var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymax from " + layerName + " group by ogc_fid limit 1";

							Ext.Ajax.request({
								url: "/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,							
								method: 'GET',
								success: function(r){
									var obj = Ext.decode(r.responseText);
									var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
									record.raw.layer.map.zoomToExtent(bounds);
								}
							});
							 
							
							
						}
					
					},
					{
						text: 'Remove layer',
						handler: function(){
							record.raw.layer.map.removeLayer(record.raw.layer);
						}
					
					}
									
			
					
					
				] 
			});
			
			contextMenu.showAt(coord);
	
	
	
	
	
		}
		//
		
		
		
        Ext.create('Ext.container.Viewport', {	
            layout: 'border',						
            items:[			
				MapPanel,
				ChooserPanel,
				tree
            ]
        });	
    }
});


