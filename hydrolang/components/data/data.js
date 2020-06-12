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
	}

	var dataSource = datasources[source][dataType];
	var head = "";
	
	if (params.hasOwnProperty("token") || params.hasOwnProperty("key")) {
		head=params["token"];
	};	

	$.ajax({
		url: dataSource["endpoint"],
		crossDomain: true,
		data: params["arguments"],
		type: 'GET',
		headers: {'token' : head,
		},
		success: function(data,status,xhr){
			callback(data),
			alert("error");
		}
	});
};


/**
 * Convert data types to one another
 * @param {Object} data to be transformed
 * @param {JSON} transformation configuration
 * @returns {Object} transformed data
 * @example
 * var data = {"temperature": "64"};
 * var config = {"from": "JSON", "to": "CSV"};
 * var dataCSV = transform(data, config);
 */
function transform(data, config) {
	return "Data is transformed";
}

export{
	retrieve,
	transform
}