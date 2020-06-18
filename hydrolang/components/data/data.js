import * as datasources from './datasources.js';
import $ from '../../modules/jquery/jquery.js';


/**
 * Main function to retrieve data
 * @param {JSON} params contain paramaters to retrieve data
 * @returns {JSON} retrieved data.
 */
function retrieve(params, callback) {
	var source = params["source"];
	var dataType = params["dataType"]
	if(!(datasources[source] && datasources[source].hasOwnProperty(dataType))){
		callback({
			"info": "No data has been found for given specifications."
		});
		return;
	};

	var dataSource = datasources[source][dataType];
	
	//create headers if required depending on the type supported.
	var head = {};

	if (params.hasOwnProperty("token")) {
		Object.assign(head, {"token" : params["token"]});
	} else if (params.hasOwnProperty("key")) {
		Object.assign(head, {"key" : params["key"]});
	} else if (params.hasOwnProperty("x-api-key")) {
		Object.assign(head, {"x-api-key" : params["x-api-key"]});
	} else if (params.hasOwnProperty("api_key")) {
		Object.assign(head, {"api_key" : params["api_key"]});
	} 
	else {
		head;
	}
	
	$.ajax({
			url: 'https://cors-anywhere.herokuapp.com/' + dataSource["endpoint"],
			data: params["arguments"],
			dataType: params["type"],
			method: 'GET',
			crossDomain: true,
			headers: head,
			success: function(data, status, xhr){
				callback(data)
			},
			error: function(){}
		});
};


/**
 * Convert data types to one another
 * @param {Object} data to be transformed as an object array.
 * @param {JSON} transformation configuration
 * @returns {Object} transformed data
 * @example
 * var data = {"temperature": "64"} as Object;
 * var config = {"type": "CSV", "keep": ["date", "values"]};
 * var dataCSV = transform(data, config);
 */

function transform(data, config) {
	var type = config['type'];
	var clean;
	if (config.hasOwnProperty('keep')) {
	clean = config['keep'];
	};
	
	//verify if the object is an object to go to the following step.
	var arr = data.map((_arrayElement) => Object.assign({}, _arrayElement));
	arr = typeof arr != 'object' ? JSON.parse(arr) : arr;

	//values to be left on the object according to user, fed as array.
	var keep = new RegExp(clean.join("|"));
	for (var i = 0; i < arr.length; i++) {
		for (var k in arr[i]) {
			keep.test(k) || delete arr[i][k];
		}
	}

	//convert array of objects into array of arrays for further manipulation.
	if (type === 'ARR') {
		var arrays = arr.map(function(obj) { return Object.keys(obj).sort().map(function(key) { return obj[key]})})
		var final = Array(arrays[0].length).fill(0).map(() => Array(arrays.length).fill(0));
		for (var j = 0; j < arrays[0].length; j++) {
			for (var n = 0; n < arrays.length; n++) {
				final[j][n] = arrays[n][j];
			};
		};
		return final;
	}
	
	// convert from JSON to CSV
	 else if (type === 'CSV') {
		var str = '';
		for (var i = 0; i < arr.length; i++){
			var line = '';
			for (var index in arr[i]) {
				if (line != '') line += ','

				line += `\"${arr[i][index]}\"`;
			};
			str += line + '\r\n'
		};
		return str;
	}

	//covert data from Object to JSON
	else if (type === 'JSON') {
		var js = JSON.stringify(arr);
		return js;
	}

	//convert data from JSON to XML
	
	else if (type === 'XML') {
		var xml = '';
		for (var prop in arr) {
			xml += arr[prop] instanceof Array ? '' : "<" + prop + ">";
			if (arr[prop] instanceof Array) {
				for (var array in arr[prop]) {
					xml += "<" + prop + ">";
					xml += transform(new Object(arr[prop], config));
				}
			} else if (typeof arr[prop] == "object") {
				xml += transform(new Object(arr[prop], config));
			} else {
				xml += arr[prop];
			}
			xml += arr[prop] instanceof Array ? '' : "</" + prop + ">";
		}
		var xml = xml.replace(/<\/?[0-9]{1,}>/g,'');
		return xml;
	}
	else {
		throw new Error ('Please select a supported data conversion type!')
	};
	
}

/**
 * Download files on different formats, depending on the formatted object.
 * @param {Object} data to be downloaded, pre processed using transform function.
 * @param {JSON} download configuration
 * @returns {Object} downloaded data as link from HTML file.
 * @example
 */
function datadownload(data, config) {
	var type = config['type'];
	var blob;
	var exportfilename = "";

	if (type === 'CSV') {
		var csv = this.transform(data, config);
		blob = new Blob([csv], { type: 'text/csv; charset = utf-8;'});
		exportfilename = 'export.csv';
	} else if (type === 'JSON') {
		var js = this.transform(data,config);
		blob = new Blob([js], {type: 'text/json'});
		exportfilename = 'export.json';
	}; /*else if (type === 'XML') {
		var xs = this.transform(data,config);
		blob = new Blob([xs], {type: 'text/xml'});
		exportfilename = 'export.xml';
	}; */
	
	/*if (config['convtype'] = 'CSV') {
		if (config['options'].hasOwnProperty('headers')){
			var head= config['options']['headers']
			arr.unshift(head)
		};
	*/
	
	if (navigator.msSaveOrOpenBlob) {
		msSaveBlob(blob, exportfilename);
	} else {
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = exportfilename;
		a.click();
		a.remove();
	};
}

export{
	retrieve,
	transform,
	datadownload
}