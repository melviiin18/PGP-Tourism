Ext.define('MyPath.Utilities', {
    statics: {	
        add: function (a, b) {
            return a + b;
        },
		/* 
		 *   A function that converts a PostGIS query into a GeoJSON object.
		 *   Copyright (C) 2012  Samuel Giles <sam@sam-giles.co.uk>
		 *
		 *   This program is free software: you can redistribute it and/or modify
		 *   it under the terms of the GNU General Public License as published by
		 *   the Free Software Foundation, either version 3 of the License, or
		 *   (at your option) any later version.
		 *
		 *   This program is distributed in the hope that it will be useful,
		 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
		 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		 *   GNU General Public License for more details.
 
		 *  You should have received a copy of the GNU General Public License
		 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
		 */
 
		/**
		 * Takes an array of associative objects/arrays and outputs a FeatureCollection object.  See <http://www.geojson.org/geojson-spec.html> example 1.1/
		 * The Query that fetched the data would need to be similar to: 
		 *              SELECT {field_list}, st_asgeojson(...) AS geojson FROM geotable
		 * Where the "AS geojson" must be as is. Because the function relies on a "geojson" column.
		 * 
		 * @param queryResult The query result from the PostGIS database.  Format deduced from <https://gist.github.com/2146017>
		 * @returns The equivalent GeoJSON object representation.
		 */
		queryToFeatureCollection: function(queryResult) {
		
		  // Initalise variables.
		  var i = 0,
		      length = queryResult.length,
		      prop = null,
		      geojson = {
		        "type": "FeatureCollection",
		        "features": []
		      };    // Set up the initial GeoJSON object.
		  for(i = 0; i < length; i++) {  // For each result create a feature
			
		    var feature = {
		      "type": "Feature",
		      "geometry": JSON.parse(queryResult[i].geojson),
			  "properties": {}
		    };
		    // finally for each property/extra field, add it to the feature as properties as defined in the GeoJSON spec.
		    for(prop in queryResult[i]) {
		      if (prop !== "geojson" && queryResult[i].hasOwnProperty(prop)) {
		        //feature[prop] = queryResult[i][prop];
				//feature.properties.push(queryResult[i][prop]);
				feature.properties[prop] = queryResult[i][prop];
		      }
		    }
		    // Push the feature into the features array in the geojson object.
		    geojson.features.push(feature);
		  }
		  // return the FeatureCollection geojson object.
		  return geojson;
		},
		toProperCase: function toTitleCase(str){
		    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		},
		generatePermalink: function(map){

			//http://geoportal.gov.ph/?p=x,y|z|basemap|title,name,opacity,style,tiled,cql;name,opacity,style,tiled,cql
	
			
			var param = {};
		
			var g = [];
			g.push(map.getCenter().lon);
			g.push(map.getCenter().lat);
			g.push(map.getZoom());
			g.push(map.baseLayer.name);
			param.g = g;
			
			
			var l = [];
			
			for(var i = 1; i < map.layers.length; i++){
				var layer = map.layers[i];
				if(layer.isBaseLayer)
					continue;
					
					
				l.push([layer.name, 
						layer.params.LAYERS, 
						layer.opacity, 
						layer.params.STYLES, 
						(layer.singleTile?1:0), 
						layer.params.cql_filter]);	
				
			}
			param.l = l;
			
			var origin = document.location.origin + "/viewer/";
			var link = origin + "?p=" + escape(JSON.stringify(param));
		
			return link;
		},
		applyPermalink:function(map){

		
			var url = unescape(document.URL);

			if(url.indexOf("?p=") == -1){
				return;
			}
		
		
			var p = url.substr(url.lastIndexOf("?p=") + 3,url.length - url.lastIndexOf("?p="));
			p = unescape(p);
			var params = JSON.parse(p);
			
			var layers = [];
			for(var item in params.l){
				
				var layerInfo = params.l[item];
				
				var layerTitle = layerInfo[0];
				var layerName = layerInfo[1];
				var opacity = layerInfo[2];
				var style = layerInfo[3]== "undefined" ? "" : layerInfo[3];
				var singleTile = layerInfo[4] == 1;
				var cql = layerInfo[5]== "undefined" ? null : layerInfo[5];

				var wmsLayer = new OpenLayers.Layer.WMS(
						layerTitle, 
						PGP.settings.WMS_URL,
						{
							layers: layerName,
							styles: style,
							transparent: true,
							cql_filter: cql
						},
						{
						   singleTile: singleTile, 
						   ratio: 1, 
						   isBaseLayer: false
						   //transitionEffect: 'resize'
						} 
				);
				layers.push(wmsLayer);
			}
		
			var center = new OpenLayers.LonLat([params.g[0],params.g[1]]);

			var zoom = parseInt(params.g[2]);
		
			var baseLayerName = params.g[3];
			
			var baseLayer = map.getLayersByName(baseLayerName)[0];
			
			map.setBaseLayer(baseLayer);
			map.addLayers(layers);
			
			
			
			map.setCenter(center,zoom);

		},
		getLayerConfig: function(layer_name, style){
			var retVal;
			Ext.Ajax.request({
				async: false,
				url: '/webapi/api/layers/getlayerconfig/' + layer_name,
				success: function(response){
					var obj = Ext.decode(response.responseText);
					if ( obj.config === "")
						obj.config = [];
					else 
						obj.config = Ext.decode(obj.config);
					retVal = obj;
				}
			});
			return retVal;
		},
		getLayerConfig2: function(layer_name, style){
			var retVal;
			Ext.Ajax.request({
				async: false,
				url: 'http://202.90.149.231/webapi/api/layers/getlayerconfig?layername=' + layer_name + '&style=' + style,
				success: function(response){
					var obj = Ext.decode(response.responseText);
					if ( obj.config === "")
						obj.config = [];
					else 
						obj.config = Ext.decode(obj.config);
					retVal = obj;
				}
			});
			return retVal;
		},
		
		download: function(url,fields){
			if (!Ext.isArray(fields))
				return;
			var body = Ext.getBody(),
				frame = body.createChild({
					tag:'iframe',
					cls:'x-hidden',
					id:'hiddenform-iframe',
					name:'iframe'
				}),
				form = body.createChild({
					tag:'form',
					cls:'x-hidden',
					id:'hiddenform-form',
					action: url,
					method: 'post',
					target:'iframe'
				});

			Ext.each(fields, function(el,i){
				if (!Ext.isArray(el))
					return false;
				form.createChild({
					tag:'input',
					type:'text',
					cls:'x-hidden',
					id: 'hiddenform-' + el[0],
					name: el[0],
					value: el[1]
				});
			});

			form.dom.submit();

			return frame;
		}



    }
});
