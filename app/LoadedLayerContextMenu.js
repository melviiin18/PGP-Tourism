Ext.define('MyPath.LoadedLayerContextMenu', {
    alias: 'widget.loadedlayer_contextmenu',
    extend: 'Ext.menu.Menu',
	items: [
			{
				text        : '0%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Opacity&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;100%',
				canActivate : false,
				hideOnClick : true,
				shadow: true,
				style       : {
						marginTop  : '-5px',
						fontSize   : '9px'
					}
			},
			Ext.create('Ext.slider.Single', {
				width: 200,
				value: 50,
				increment: 10,
				minValue: 0,
				maxValue: 100
				/* listeners : {
								change : function(slider,newVal) {
									//var node = loaded_layer.getSelectionModel().getSelectedNode();
									//node.layer.setOpacity(newVal/100);
								}
							} */
			})
			
			
	],
    initComponent: function() {
        this.callParent(arguments);
		
		
		
		
    }
});



