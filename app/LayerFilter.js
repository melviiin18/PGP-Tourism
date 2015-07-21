Ext.define('MyPath.LayerFilter', {
	alias: 'widget.pgp_layerfilter',
	extend: 'Ext.Window',	
	title: 'Hello',
	height: 300,
	width: 500,
	layout: 'fit',
	modal: true,
	style: '',
	layerName: 'layerName',
	filterData: [],
	initComponent: function() {
		
		var layer_config = MyPath.Utilities.getLayerConfig(this.layerName, this.style);
		
		var attributeStore = Ext.create('Ext.data.Store', {
			fields: ['attribute', 'alias'],
			data : layer_config.config
		});
	
	
	
		var Filter = function(alias, attribute, operator, value, andOr){
			return {alias: alias, attribute: attribute, operator: operator, value: value, displayValue:value, andOr: andOr}
		}
		
		var me = this;
		
		
		var filterStore = Ext.create('Ext.data.Store', {
			fields:['alias','attribute', 'operator', 'value', 'andOr'],
			data: me.filterData
		});
		
		
		var cellEditingPlugin = Ext.create('Ext.grid.plugin.CellEditing', {
										clicksToEdit: 1
									});
		
		function setAndOrBehaviour(){
			var andOr = Ext.getCmp('cmbAndOr');
			if(filterStore.getCount() < 1){
				andOr.setDisabled(true);
				andOr.setValue(null);
			} else {
				andOr.setDisabled(false);
				andOr.setValue('AND');

			}
			// make sure AND/OR is set to null on first items
			var firstItem = filterStore.getAt(0);
			if(firstItem){
				firstItem.set('andOr',null);
				filterStore.commitChanges();
			}	
		}
		
		
		
		Ext.apply(me, {
			
			items: {
					 xtype: 'panel',
					 layout: {
						type: 'vbox',
						align : 'stretch'
					},
					 width: 500,
					 margin: '10 10 10 10',
						 items: [ 
								{ 	xtype: 'panel',
									layout: {
										type: 'hbox',
										align: 'stretch'
									},
									defaults: {	
										margin: '5 5 5 5'
									},
									items: [
									{
										xtype: 'combo',
										id: 'cmbAndOr',
										editable: false,
										width: 50,
										store: ['AND', 'OR'],
										fieldLabel: 'And/Or',
										labelAlign: 'top',
										disabled: true
									},
									{
										xtype: 'combo',
										id: 'cmbAttribute',
										editable: false,
										width: 120,
										store: attributeStore,
										displayField: 'alias',
										valueField: 'attribute',
										fieldLabel: 'Attribute',
										labelAlign: 'top',
										flex: 2
									},
									{
										xtype: 'combo',
										id: 'cmbOperator',
										editable: false,
										width: 80,
										store: ['=', 'LIKE', 'NOT LIKE', '>','<','!=','>=','<='],
										flex: 1,
										fieldLabel: 'Operator',
										labelAlign: 'top'
									},
									{
										xtype: 'textfield',
										id: 'txtValue',
										width: 80,
										flex: 1,
										fieldLabel: 'Value',
										labelAlign: 'top'
									},
									{
										xtype: 'button',
										text: 'Add',
										handler: function(){
											
										
											var value = txtValue.getValue();
											var newFilter = Filter(
												cmbAlias.getDisplayValue(),
												cmbAttribute.getValue(),
												cmbOperator.getValue(),
												value,
												cmbAndOr.getValue()
											);
										
											filterStore.loadData([newFilter], true);
											setAndOrBehaviour();
										}
									}]
									
								},
								{
									xtype: 'grid',
									id:'filterGrid',
									border: false,
									columns: [
										{ text: 'And/Or', dataIndex: 'andOr', width: 50 },
										{ text: 'Attribute',  dataIndex: 'alias' },
										{ text: 'Operator', dataIndex: 'operator', flex: 1 },
										{ text: 'Value', dataIndex: 'value', flex: 1, editor: {} },
										{
											xtype: 'actioncolumn',
											width:30,
											sortable: false,
											items: [{
												icon: 'http://pgp.namria.gov.ph/resources/img/pan.png',
												tooltip: 'Delete',
												handler: function(grid, rowIndex, colIndex) {

													filterStore.removeAt(rowIndex); 
													setAndOrBehaviour();	

												}
											}]
										}
									],
									flex: 2,
									store: filterStore,
									plugins: [ cellEditingPlugin ],
									listeners:{
										edit: function(){
											filterStore.commitChanges();
										}
									}
								},
								{ 	xtype: 'panel',
									layout: {
										type: 'hbox',
										align: 'stretch',
										pack: 'center'
									},
									defaults: {	
										margin: '5 5 5 5'
									},
									items: [
										{
											xtype: 'button',
											text: 'Ok',
											align: 'bottom',
											handler: function(){
												//this.focus();
												//me.close();
												var task = new Ext.util.DelayedTask(function(){ me.close(); });
												task.delay(200);
											
											}
										},
										{
											xtype: 'button',
											text: 'Reset',
											align: 'bottom',
											handler: function(){
												cmbAlias.setValue(null);
												cmbAttribute.setValue(null);
												cmbOperator.setValue(null);
												txtValue.setValue(null);
												cmbAndOr.setValue(null);
												filterStore.removeAll();
												setAndOrBehaviour();
											}
										}
									]
								}
								
							]
			}

	
		});
		this.callParent(arguments);
		
		
		setAndOrBehaviour();
		
		var cmbAlias = Ext.getCmp('cmbAttribute');
		var cmbAttribute = Ext.getCmp('cmbAttribute');
		var cmbOperator = Ext.getCmp('cmbOperator');
		var txtValue = Ext.getCmp('txtValue');
		var cmbAndOr = Ext.getCmp('cmbAndOr');
		
		this.getCQL = function(){
			var retVal = "";
			filterStore.each(function(row,index){
				
				var value = row.get('value');
				//var isText = (typeof row.get('value')) === "string";
				
				
				var isText = !(!isNaN(parseFloat(value)) && isFinite(value));

				
				
				//var value = ((typeof row.get('value') === 'string')?'strToLower('+ row.get('value') + ')':row.get('value'));
				var operator = row.get('operator');
				
				
				if (operator === "LIKE" || operator === "NOT LIKE") {
					value = "'%" + value + "%'";
				} else {
					value = "'" + value + "'";
				}
				//value = (isText?'strToLowerCase(' + value + ')':value);
				value = value.toLowerCase();
				var attribute = row.get('attribute');
				
				attribute = (isText?'strToLowerCase(' + attribute + ')':attribute);
				
				retVal += (row.get('andOr')?' ' + row.get('andOr') + ' ':'') +
						  attribute +
						  ' ' + operator + ' ' +
						  value;
			});
			return (retVal === ""? null: retVal);
		};
		this.getFilterData = function(){
			var retVal = [];
			Ext.each(filterStore.data.items, function(row, index){
				retVal.push(row.raw);
			});
			return retVal;
		}
	}
});
