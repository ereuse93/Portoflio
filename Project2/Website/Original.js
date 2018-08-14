//Creating sql queries and global vars
var sqlSites = "SELECT * FROM campsites";
var sqlBase = "SELECT * FROM boundary";
var sqlTrails = "SELECT * FROM trails";
var sqlTrailheads = "SELECT * FROM trailheads";
var sqlPicnic = "SELECT * FROM picnicareas";
var sqlScenic = "SELECT * FROM scenicpoints";
var sqlVisitors = "SELECT * FROM visitorcenters";
var cartoUser = "ethanreuse";

//var for queries
var sqlParking = "SELECT * FROM trailheads WHERE parking='Yes'";
var sqlHike = "SELECT * FROM trails WHERE trlclass='Class 3: Developed'";
var sqlFalls = "SELECT * FROM scenicpoints WHERE feature_cl ='Falls'";
var sqlCamp = "SELECT * FROM campsites WHERE groupsite='Yes'";


//setting empty global vars
var campSites = null;
var boundary = null;
var trails = null;
var trailheads = null;
var picnicareas = null;
var scenicpoints =null;
var visitorcenters = null;

//location global vars
var myLocation = null;
var locationMarker = null;

//user points are null
var cartoDBpoints = null;

var cartoDBUserName = "ethanreuse";

//var sqlQuery = "SELECT * FROM data_collector"


var streets = 
	 L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a> | EthanReuse',
	accessToken: 'pk.eyJ1IjoiZXRoYW5yZXVzZSIsImEiOiJjamR0MTNhb2YwaXA3MnZtdWR4bm00ajByIn0.5YrFyf81HkI2L_NiVThZ4A',
	id: 'mapbox.streets',
	 }),
	
	satellite = 
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a> | EthanReuse',
	accessToken: 'pk.eyJ1IjoiZXRoYW5yZXVzZSIsImEiOiJjamR0MTNhb2YwaXA3MnZtdWR4bm00ajByIn0.5YrFyf81HkI2L_NiVThZ4A',
	id: 'mapbox.satellite',
	 });
	
	
	

//set map variable and view
var map = L.map('map', {
    center: [40.3428, -105.6836],
    zoom: 11,
    layers: [satellite, streets]
});
//var map = L.map('map').setView(new L.LatLng(40.3428, -105.6836), 11);
//set tile layer source and attributes
  //add OSM base tilelayer
    //L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  //  attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a> | EthanReuse',
  //  maxZoom: 18,
  //  id: 'mapbox.streets',
  //  accessToken: 'pk.eyJ1IjoiZXRoYW5yZXVzZSIsImEiOiJjamR0MTNhb2YwaXA3MnZtdWR4bm00ajByIn0.5YrFyf81HkI2L_NiVThZ4A'
//}).addTo(map);

var baseMaps = {
	"Satellite": satellite,
    "Basemap": streets
    
}



L.control.layers(baseMaps,null).addTo(map);

var trailStyle = {
    "color": "#A0522D",
    "weight": 2,
    "opacity": 0.75
}

var boundStyle = {
    "color": "#228B22",
	"fillColor": "#3CB371",
	"opacity": .75
}


function showBoundary(){
    if(map.hasLayer(boundary)){
        map.removeLayer(boundary);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlBase, function(data) {
        boundary = L.geoJSON(data,{
			style: boundStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ feature.properties.unitname + '</b><br /><em>' + 'Acres:' + ' '+ feature.properties.acres + '</em></p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var BoundStyle = new L.Polygon({
					fillcolor: "#228B22"
				});
				layer.setStyle(BoundStyle);

            }
	
        }).addTo(map);
       
    });
};


function showSites(){
    if(map.hasLayer(campSites)){
        map.removeLayer(campSites);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlSites, function(data) {
		
        campSites = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Campsite Name:' + ' '+ feature.properties.campsite + '</b><br /><em>' + "Disctric Name:" + " "+ feature.properties.district + '</em></p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var campsiteIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/camping.png'
            });
				layer.setIcon(campsiteIcon);
				
            }
			
        }).addTo(map);
		
		
    
       
		
    });
};


function showTrails(){
    if(map.hasLayer(trails)){
        map.removeLayer(trails);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlTrails, function(data) {
       trails = L.geoJSON(data,{
		   style: trailStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Trail Name:' + ' ' + feature.properties.trlname + '</b><br /><em>' + 
								'Segment Name:' + ' '+ feature.properties.segname + '</b><br /><em>' + 
								'Miles:' + ' '+ feature.properties.lngth_mile + '</em> </p>');
                layer.cartdodb_id=feature.properties.cartdodb_id; 
            }
        }).addTo(map);
		
    });
	
};


function showTrailheads(){
    if(map.hasLayer(trailheads)){
        map.removeLayer(trailheads);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlTrailheads, function(data) {
        trailheads = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Trailhead Name:' + ' ' + feature.properties.thname + '</em> </p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var trailheadIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/trailhead.png'
            });
				layer.setIcon(trailheadIcon);
            }
        }).addTo(map);
		 
       
		
    });
};

function showPicnic(){
    if(map.hasLayer(picnicareas)){
        map.removeLayer(picnicareas);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlPicnic, function(data) {
       picnicareas = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Picnic Area Name:' + ' ' + feature.properties.poiname + '</em> </p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var picnicIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/picnic.png'
            });
				layer.setIcon(picnicIcon);
            }
        }).addTo(map);
		
        
    });
};


function showScenic(){
    if(map.hasLayer(scenicpoints)){
        map.removeLayer(scenicpoints);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlScenic, function(data) {
       scenicpoints = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Name:' + ' '+ feature.properties.feature_na + '</b><br /><em>' + "Type:" + " "+ feature.properties.feature_cl + '</em></p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var scenicIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/camera.png'
            });
				layer.setIcon(scenicIcon);
            }
        }).addTo(map);

    
    });
	
};

function showVisitors(){
    if(map.hasLayer(visitorcenters)){
        map.removeLayer(visitorcenters);
   };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlVisitors, function(data) {
        visitorcenters = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Visitor Center Name:' + ' ' + feature.properties.poiname + '</em> </p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
			var visitorsIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/information.png'
            });
				layer.setIcon(visitorsIcon);
           }
       }).addTo(map);

   
		
		
var baseMaps = {
    "Basemap": streets,
    "Satellite":satellite
}

		
		
	// Add abutton to get the users location and display it on the map
L.control.locate({icon: 'fa fa-location-arrow'}).addTo(map);

// Add a home button to go back to the default map extent
L.easyButton('fa-home', function(btn, map){
    map.setView([40.3428,-105.6836],11);
	}).addTo(map);

    });
	
	
};


function showParking(){
    if(map.hasLayer(trailheads)){
        map.removeLayer(trailheads);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlParking, function(data) {
        trailheads = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Trailhead Name:' + ' ' + feature.properties.thname + '</em> </p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var trailheadIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/trailhead.png'
            });
				layer.setIcon(trailheadIcon);
            }
        }).addTo(map);
    });
};

function showDeveloped(){
    if(map.hasLayer(trails)){
        map.removeLayer(trails);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlHike, function(data) {
       trails = L.geoJSON(data,{
		   style: trailStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Trail Name:' + ' ' + feature.properties.trlname + '</b><br /><em>' + 
								'Segment Name:' + ' '+ feature.properties.segname + '</b><br /><em>' + 
								'Surface Material:' + ' '+ feature.properties.trlsurface + '</b><br /><em>' + 
								'Miles:' + ' '+ feature.properties.lngth_mile + '</em> </p>');
                layer.cartdodb_id=feature.properties.cartdodb_id; 
            }
        }).addTo(map);
		
    });
	
};


function showFalls(){
    if(map.hasLayer(scenicpoints)){
        map.removeLayer(scenicpoints);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlFalls, function(data) {
       scenicpoints = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Trailhead Name:' + ' ' + feature.properties.thname + '</em> </p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var scenicIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/camera.png'
            });
				layer.setIcon(scenicIcon);
            }
        }).addTo(map);
		
    });
};

function showCamp(){
    if(map.hasLayer(campSites)){
        map.removeLayer(campSites);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlCamp, function(data) {
		
        campSites = L.geoJSON(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>'+ 'Campsite Name:' + ' '+ feature.properties.campsite + '</b><br /><em>' + "Disctric Name:" + " "+ feature.properties.district + '</em></p>');
                layer.cartdodb_id=feature.properties.cartdodb_id;
				var campsiteIcon = new L.Icon({
                    iconSize: [27, 27],
                    iconAnchor: [13, 27],
                    popupAnchor:  [1, -24],
                    iconUrl: 'img/camping.png'
            });
				layer.setIcon(campsiteIcon);
				
            }
			
        }).addTo(map);
		
    });
};

// Event listeners for the layers
$('input[value=boundary]').change(function() {
    if (this.checked) {
        showBoundary();
    } else {
        map.removeLayer(boundary)
    };
});

$('input[value=camp]').change(function() {
    if (this.checked) {
        showSites();
    } else {
        map.removeLayer(campSites)
    };
});

$('input[value=trailheads]').change(function() {
    if (this.checked) {
        showTrailheads();
    } else {
        map.removeLayer(trailheads)
    };
});

$('input[value=picnic]').change(function() {
    if (this.checked) {
        showPicnic();
    } else {
        map.removeLayer(picnicareas)
    };
});

$('input[value=trails]').change(function() {
    if (this.checked) {
        showTrails();
    } else {
        map.removeLayer(trails)
    };
});

$('input[value=scenic]').change(function() {
    if (this.checked) {
        showScenic();
    } else {
        map.removeLayer(scenicpoints)
    };
});

$('input[value=center]').change(function() {
    if (this.checked) {
        showVisitors();
    } else {
        map.removeLayer(visitorcenters)
    };
});


$('input[value=parking]').click(function(){
  showParking();
});

$('input[value=earth]').click(function(){
  showDeveloped();
});

$('input[value=falls]').click(function() {
  showFalls();
});

$('input[value=group]').click(function() {
  showCamp();
});

		
var baseMaps = {
    "Basemap": streets,
    "Satellite":satellite
}

		



//create map
//$(document).ready(createMap);
$(document).ready(function() {
    showSites(),
	showBoundary(),
	showTrails(),
	showTrailheads(),
	showPicnic(),
	showScenic(),
	showVisitors()
	//showCamp(),
	//showDeveloped(),
	//showFalls(),
	//showParking()
});


	