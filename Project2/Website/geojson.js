var sqlsites = "SELECT * FROM backcountrycampsites";
var cartoUser = "ethanreuse";
var campSites = null;


function createMap(){
    //create the map
    var map = L.map('map').setView(new L.LatLng(40.2428, -105.6836), 11);
    

    //add OSM base tilelayer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a> | EthanReuse',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZXRoYW5yZXVzZSIsImEiOiJjamR0MTNhb2YwaXA3MnZtdWR4bm00ajByIn0.5YrFyf81HkI2L_NiVThZ4A'
}).addTo(map);

    //call getData function
    getData(map);
};

function showSites(){
    if(mymap.hasLayer(campSitesites)){
        mymap.removeLayer(camoSites);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlSites, function(data) {
        parkSites = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ feature.properties.name + '</b><br /><em>' + feature.properties.type + '</em></p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
            }
        }).addTo(mymap);
    });
};


function jsAjax(){
    // Step 1: Create the request 
    var ajaxRequest = new XMLHttpRequest();

    //Step 2: Create an event handler to send received data to a callback function
    ajaxRequest.onreadystatechange = function(){
        if (ajaxRequest.readyState === 4){
            callback(ajaxRequest.response);
        };
    };

    //Step 3: Open the server connection
    ajaxRequest.open('GET', 'data/data.geojson', true);

    //Step 4: Set the response data type
    ajaxRequest.responseType = "json";

    //Step 5: Send the request
    ajaxRequest.send();
};

//define callback function
function callback(response){
    //tasks using the data go here
    console.log(response);
};

window.onload = jsAjax();

$(document).ready(createMap);