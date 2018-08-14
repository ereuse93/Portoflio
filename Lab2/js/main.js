//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = [ "Science_Engineering", "Science_Engineering_Related Fields", "Business", "Education", "Arts"]; //list of attributes
	
	
var expressed = attrArray[0]; //initial attribute
	
 var chartWidth = window.innerWidth * 0.65,
        chartHeight = 400,
        leftPadding = 40,
        rightPadding = 0,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
	
  //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 15000]);
	
	


//begin script when window loads
window.onload = function setMap(){

//set up choropleth map

    
    //map frame dimensions
    var width = window.innerWidth*.7,
        height =460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Virginia
    var projection = d3.geoAlbers()
        .center([0, 39.05])
        .rotate([81.00, 0.00, 0])
        .parallels([19.95, 35.65])
        .scale(width*5.7)
        .translate([width / 2, height / 5]);
    
     var path = d3.geoPath()
        .projection(projection);
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/College.csv") //load attributes from csv
        .defer(d3.json, "data/Majors.topojson") //load background spatial data
        .await(callback);
    
      function callback(error, csvData, College){
          
          var Education = topojson.feature(College, College.objects.College).features;
          //examine results
          console.log(Education);
         // console.log(error);
           console.log(csvData);
        	//console.log(county)
        
          Education=joinData(Education, csvData);
          
          var colorScale = makeColorScale(csvData);
          
          setEnumerationUnits(Education, map, path, colorScale);
           
          setChart(csvData, colorScale);  
		  
		  createDropdown(csvData);	  

    };
          
};

    function joinData(Education, csvData){
        
          //loop through csv to assign each set of attr values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvCounty = csvData[i]; //current region
        var csvKey= csvCounty.FIPS; //CSV primary key
        
    //loop through geojson regions to find correct state
    for (var a=0; a < Education.length; a++){
        var geojsonProps = Education[a].properties; //the current region geojson properties
        var geojsonKey = geojsonProps.FIPS; // the geojson primary key
            
     //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){
                    
                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvCounty[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };
            };
        };
		
        return Education;
}; 
    
    function setEnumerationUnits(Education, map, path, colorScale){
        
    var county = map.selectAll(".county")
        .data(Education)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "county " + d.properties.FIPS;
        })
        .attr("d", path)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale);
        })
	
	   .on("mouseover", function(d){
            highlight(d.properties);    
        })
        .on("mouseout", function(d){
            dehighlight(d.properties);
        })
		
        .on("mousemove", moveLabel);
    
    var desc = county.append("desc")
        .text('{"stroke": "black", "stroke-opacity": "0.8", "stroke-width": "0.5px", "stroke-linecap": "round"}');
};
	 	
	 
    function makeColorScale(data){
    var colorClasses = [
        "#FFA07A",
        "#FF6347",
        "#CD5C5C",
        "#B22222",
        "#800000"
    ];
    
    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);
        
          //build arra of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };
        
         //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domina array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();
    
    //assign array of last 4 clusters minimum as domain
    colorScale.domain(domainArray);
    
    return colorScale;
};  
    //function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == "number" && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#add8e6";
    };
}; 
function setChart(csvData, colorScale){
   
    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
	

      //set bars for each country being evalulated
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b[expressed]-a[expressed]
            })
            .attr("class", function (d) {
                return "bars" + d.FIPS;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
		  .on("mouseover", highlight)
		  .on("mouseout", dehighlight)
		   .on("mousemove", moveLabel);
        
	
	 //add style descriptor
    var desc = bars.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}')
	.attr("x", function (d, i) {
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function (d, i) {
            return 463-yScale(parseFloat(d[expressed]));
        })
        .attr("y", function (d, i) {
            return yScale(parseFloat(d[expressed])) ;
        })
        .style("fill", function (d) {
            return choropleth(d, colorScale);
        });
       
	
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Number of Residents with a Degree in " + expressed + " in each County");

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
	
	 //set bar position, heights, and colors
    updateChart(bars, csvData.length, colorScale);
};
	
	
//function to create a dropdown menu for attribute selection
function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
		.on("change", function(){
            changeAttribute(this.value, csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Major");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
	};
	
function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var county = d3.selectAll(".county")
		.transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });
		
		 //re-sort, resize, and recolor bars
   var bars = d3.selectAll(".bars")
            //re-sort bars
            .sort(function (a, b) {
                return b[expressed] - a[expressed];
            })
            .transition()
            .delay(function(d, i){
                return i * 20
            })
   	  		.duration(500);
	//get the max value for the selected attribute
   var max = d3.max(csvData, function(d){
       return + parseFloat(d[expressed])
   });
   
   //set reset yScale
   yScale = d3.scaleLinear()
       .range([chartHeight-10, 0])
       .domain([0, max]);
	
	updateChart(bars, csvData.length, colorScale);
	};
	
	 function updateChart(bars, n, colorScale){
        //position bars
        bars.attr("x", function(d, i){
                return i * (chartInnerWidth / n) + leftPadding;
            })
            //size/resize bars
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //color/recolor bars
            .style("fill", function(d){
                return choropleth(d, colorScale);
            });
		 
		  var chartTitle = d3.select(".chartTitle")
             .text("Number of Residents with a Degree in " + expressed + " in each County");
		 var yAxis = d3.axisLeft()
       .scale(yScale)
   
   d3.selectAll("g.axis")
       .call(yAxis);
    };
	
//function to highlight enumeration units and bars
function highlight(props){
    //change stroke
    var selected = d3.selectAll("."+ props.FIPS)
        .style("stroke", "#f03b20")
        .style("stroke-width", "4");
	
	setLabel(props);
};

//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.FIPS)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });
    
    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();
        
        var styleObject = JSON.parse(styleText);
        
        return styleObject[styleName];
    };
    
    //remove info label
    d3.select(".infolabel")
        .remove();
    
};

//function to create dynamic label
function setLabel(props){
    //name attributes filtered to replace underscore with space 
        var labelName = props.NAME;
        var labelParse = labelName.replace(/_/g, ' '); 

        //if statement to specifically add attributes once dropdown menu item is activated 
        if ([expressed] > 0){
           
        }else{
            var labelAttribute = "<h2>" + labelParse +" "+ props[expressed] + " " + "Residents"
                "</h2>";

        };
    
    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.FIPS + "_label")
        .html(labelAttribute);
    
    var countyName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.name);
};
    
//function to move info label w/mouse
function moveLabel(){
    
    //get width of label
    var labelWidth = d3.select(".infolabel");
    
    //use coordinates of mousemove event to set label coordintes
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;
    
    //horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //vertical label coordinate, tensting for overflow
    var y = d3.event.clientY < 75 ? y2 : y1;
    
    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
    
};
	
	
	
	

})();	