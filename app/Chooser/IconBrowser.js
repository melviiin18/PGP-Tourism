/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chooser.IconBrowser
 * @extends Ext.view.View
 * @author Ed Spencer
 * 
 * This is a really basic subclass of Ext.view.View. All we're really doing here is providing the template that dataview
 * should use (the tpl property below), and a Store to get the data from. In this case we're loading data from a JSON
 * file over AJAX.
 */
Ext.define('MyPath.Chooser.IconBrowser', {
    extend: 'Ext.view.View',
    alias: 'widget.iconbrowser',    
    uses: 'Ext.data.Store',    
    singleSelect: true,
	padding:40,		
    overItemCls: 'x-view-over',
    itemSelector: 'div.thumb-wrap',
    tpl: [
        // '<div class="details">',
            '<tpl for=".">',
                '<div class="thumb-wrap" data-qtip="{tooltip}">',
                    '<div class="thumb" text-align="center">',
                    //(!Ext.isIE6 ? '<img src="http://localhost:3000/geoserver.namria.gov.ph/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=:ready_volcanic" />' : '<div style="width:100px;height:100px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'icons/{thumb}\')"></div>'),
					(!Ext.isIE6 ? '<img src="./App/Chooser/icons/{thumb}" />' : '<div style="width:74px;height:74px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'icons/{thumb}\')"></div>'),
                    '</div>',
                    '<span>{name}</span>',
                '</div>',
            '</tpl>'
        // '</div>'
    ],
    
    initComponent: function() {
        this.store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: ['name', 'thumb', 'url', 'tooltip', 'isWms'],
            proxy: {
                type: 'ajax',
                url : './App/Chooser/Data.json',
                reader: {
                    type: 'json',
                    rootProperty: ''
                }
            }
        });
        
        //this.callParent(arguments);
		this.callParent();
        this.store.sort();
    }
});
