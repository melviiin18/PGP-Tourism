
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


