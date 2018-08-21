
//self-executing anonymous function
(function () {
    // Creating pseudo-global variables for the map and the bar chart
    var disasterType = ["Severe Storms","Hurricane Storms","Earthquake Storms","Fire Storms","Floods","Landslides","Ice Storms","Tornadoes"];
    var years = ["2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018"];
    
    var uniqueDisaster = disasterType[0]
    var uniqueYears = years[0]
    
    // variables that will be joined   
    var attrArray = ["Severe Storms_2002","Severe Storms_2003","Severe Storms_2004","Severe Storms_2005","Severe Storms_2006","Severe Storms_2007","Severe Storms_2008",
    "Severe Storms_2009","Severe Storms_2010","Severe Storms_2011","Severe Storms_2012","Severe Storms_2013","Severe Storms_2014","Severe Storms_2015","Severe Storms_2016",
    "Severe Storms_2017","Severe Storms_2018","Hurricane Storms_2002","Hurricane Storms_2003","Hurricane Storms_2004","Hurricane Storms_2005","Hurricane Storms_2006","Hurricane Storms_2007","Hurricane Storms_2008","Hurricane Storms_2009","Hurricane Storms_2010","Hurricane Storms_2011","Hurricane Storms_2012","Hurricane Storms_2013","Hurricane Storms_2014","Hurricane Storms_2015","Hurricane Storms_2016","Hurricane Storms_2017","Hurricane Storms_2018","Earthquake Storms_2002","Earthquake Storms_2003","Earthquake Storms_2004","Earthquake Storms_2005","Earthquake Storms_2006","Earthquake Storms_2007","Earthquake Storms_2008","Earthquake Storms_2009","Earthquake Storms_2010","Earthquake Storms_2011","Earthquake Storms_2012","Earthquake Storms_2013","Earthquake Storms_2014","Earthquake Storms_2015","Earthquake Storms_2016","Earthquake Storms_2017","Earthquake Storms_2018","Fire Storms_2002","Fire Storms_2003", "Fire Storms_2004","Fire Storms_2005","Fire Storms_2006","Fire Storms_2007","Fire Storms_2008","Fire Storms_2009","Fire Storms_2010","Fire Storms_2011","Fire Storms_2012","Fire Storms_2013","Fire Storms_2014","Fire Storms_2015","Fire Storms_2016","Fire Storms_2017","Fire Storms_2018","Floods_2002","Floods_2003","Floods_2004","Floods_2005","Floods_2006","Floods_2007","Floods_2008","Floods_2009","Floods_2010","Floods_2011","Floods_2012","Floods_2013","Floods_2014","Floods_2015","Floods_2016","Floods_2017","Floods_2018","Landslides_2002","Landslides_2003","Landslides_2004","Landslides_2005","Landslides_2006","Landslides_2007","Landslides_2008","Landslides_2009","Landslides_2010","Landslides_2011","Landslides_2012","Landslides_2013","Landslides_2014","Landslides_2015","Landslides_2016","Landslides_2017","Landslides_2018","Ice Storms_2002","Ice Storms_2003","Ice Storms_2004","Ice Storms_2005","Ice Storms_2006","Ice Storms_2007","Ice Storms_2008","Ice Storms_2009","Ice Storms_2010","Ice Storms_2011","Ice Storms_2012","Ice Storms_2013","Ice Storms_2014","Ice Storms_2015","Ice Storms_2016","Ice Storms_2017","Ice Storms_2018","Tornadoes_2002","Tornadoes_2003","Tornadoes_2004","Tornadoes_2005","Tornadoes_2006","Tornadoes_2007","Tornadoes_2008","Tornadoes_2009","Tornadoes_2010","Tornadoes_2011","Tornadoes_2012","Tornadoes_2013","Tornadoes_2014","Tornadoes_2015","Tornadoes_2016","Tornadoes_2017","Tornadoes_2018"];   
    var expressed = attrArray[0];
        
    
    
    //create chart dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 170]);

    //execute map when page loads
    window.onload = setMap();

    //setup choropleth map
    function setMap() {
        
        //create map frame dimensions
        var width = window.innerWidth * 0.5,
            height = 520;

        //create svg container    
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height)
            //add zoom and pan functionality to map
            //.call(d3.zoom().on("zoom", function () {
            //    map.attr("transform", d3.event.transform);
            //}))
            .append("g");
            
        //determine map projection
        var projection = d3.geoAlbersUsa()
            .scale(950)
            .translate([width / 2, height / 2]);
        
        //create path generator
        var path = d3.geoPath()
            .projection(projection);
        
        //use queue for asynchronous data loading
        d3.queue()
            .defer(d3.csv, "data/disaster_output.csv")
            .defer(d3.json, "data/us_states.topojson")
            .await(callback);
        
            
        function callback(error, csvData, state) {

            //translate topojson data 
            var stateMap = topojson.feature(state, state.objects.us_states).features;

            //join topojson and csv data
            stateMap = joinData(stateMap, csvData);

            //create color scale
            var colorScale = makeColorScale(csvData);

            //add enumeration units
            setEnumerationUnits(stateMap, map, path, colorScale);

            //add coordinated visualization
            setChart(csvData, colorScale);

            //add dropdown menu
            createDropdown(csvData);
           
            //change attriubute data 
            changeAttribute(csvData, makeColorScale);

            //update charts when data changes
            updateChart(csvData);

        };
    };

    
    function joinData(stateMap, csvData) {
        //loop through csv to collect attributes 
        for (var i = 0; i < csvData.length; i++) {
            var csvDisaster = csvData[i];
            var csvKey = csvDisaster.state;

            for (var a = 0; a < stateMap.length; a++) {
                var geojsonProps = stateMap[a].properties;
                var geojsonKey = geojsonProps.STUSPS;

                if (geojsonKey == csvKey) {

                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvDisaster[attr]);
                        geojsonProps[attr] = val;
                    });
                };
            };
        };
     
        return stateMap;
        
    };

    function setEnumerationUnits(stateMap, map, path, colorScale) {
        
        //add states for analysis to the map
        var disasterStates = map.selectAll(".disasterStates")
            .data(stateMap)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "disasterState " + d.properties.STUSPS;
            })
            .attr("d", path)
            .style("fill", function(d){
                return colorScale(d.properties[expressed]);
            })
            .on("mouseover", function(d){
                highlight(d.properties);
            })
            .on("mouseout", function(d){
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);

            var desc = disasterStates.append("desc")
                .text('{"stroke": "#000", "stroke-width": "0.5"}');

            console.log(disasterStates);

    };

    function makeColorScale(data){
        //assign colors
        var colorClasses = [
        "#ffb3b3",
        "#ff8080",
        "#ff1a1a",
        "#cc0000",
        "#990000"
        ];

        //create color generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //build array of values
        var domainArray = [];
        for (var i = 0; i < data.length; i++) {
            var val = parseFloat(data[i][expressed])
            domainArray.push(val);
        };
            
        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);

        //reset domain array to cluster minimums
        domainArray = clusters.map(function (d) {
            return d3.min(d);
        });

        //remove first value from domain array to create class breakpoints
        domainArray.shift();

        //assign array of last 4 clusters minimum as domain
        colorScale.domain(domainArray);

        return colorScale;
    };

    //function to test for data value and return color
    function choropleth(props, colorScale) {
        //make sure attribute value is a number
        var val = parseFloat(props[expressed]);
        //if attribute value exists, assign a color; otherwise assign white
        if (typeof val === "number" && !isNaN(val)) {
            return colorScale(val);
        } else {
            return "#FFFF";
        }
    };    


    function setChart(csvData, colorScale) {
        
        //create another svg container to hold chart 
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        //create rectangle chart container
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //set bars for each state being evalulated
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b[expressed]-a[expressed];
            })
            .attr("class", function (d) {
                return "bars " + d.state;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            .on("mouseover", highlight)
            .on("mouseout", dehighlight)
            .on("mousemove", moveLabel)
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

        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');

        //create chart title element
        var chartTitle = chart.append("text")
            .attr("x", 150)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Number of Declared " + uniqueDisaster + " in " + uniqueYears + ".");

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

        updateChart(bars, csvData.length, colorScale);
    };

    function createDropdown(csvData){
        
        // create dropdown menu element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData);
            });            

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Disaster Type");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(disasterType)
            .enter()
            .append("option")
            .attr("value", function (d) { return d })
            .text(function (d) { return d });
   
    
        // Adding a select element for year
        var dropdownyear = d3.select("body")
            .append("select")
            .attr("class", "dropdown2")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });
        
        //add initial option
        var titleOption2 = dropdownyear.append("option")
            .attr("class", "titleOption2")
            .attr("disabled", "true")
            .text("Select Year");
        
        // Adding attribute options for the dropdown menu
        var attrOptions2 = dropdownyear.selectAll("attrOptions2")
            .data(years)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };
    
    function changeAttribute(attribute, csvData) {
        // Creating an "if" statement to account for updating dropdown values for each dropdown menu
        if (attribute.indexOf("S","H","E","F","F","I","T") > -1){
            uniqueDisaster = attribute
        } else {
            uniqueYears = attribute
        };
               
        // Combining the attribute values into the expressed input for the map and the bar chart
        expressed = uniqueDisaster + "_" + uniqueYears; 

        //recreate the color scale
        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var disasterState = d3.selectAll(".disasterState")
            .transition()
            .duration(1000)
            .style("fill", function (d) {
                return choropleth(d.properties, colorScale);
            });
        
        //re-configure bars 
        var bars = d3.selectAll(".bars")
            //re-sort bars
            .sort(function (a, b) {
                return b[expressed] - a[expressed];
            })
            .transition()
            .delay(function(d, i){
                return i * 20;
            })
            .duration(500);

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
            .text("Number of Declared " + uniqueDisaster + " in " + uniqueYears + "."); 
    };

    function highlight(props, csvData){

        //highlight enumeration units and bars
        var selected = d3.selectAll("." + props.STUSPS)
            .style("stroke", "#FFFF00")
            .style("stroke-width", "3");

            setLabel(props);
    };

    function dehighlight(props) {

        //remove highlighting when mouse leaves enum unit or bar 
        var selected = d3.selectAll("." + props.STUSPS)
            .style("stroke", function () {
                return getStyle(this, "stroke");
            })
            .style("stroke-width", function () {
                return getStyle(this, "stroke-width");
            });

        function getStyle(element, styleName) {
            var styleText = d3.select(element)
                .select("desc")
                .text();

            var styleObject = JSON.parse(styleText);

            return styleObject[styleName];
        };

        d3.select(".infolabel")
            .remove();
    };

    function setLabel(props, csvData){
        
        //name attributes filtered to replace underscore with space 
        var labelName = props.NAME;
        
        //if statement to specifically add attributes once dropdown menu item is activated 
        var labelAttribute;
        if ([expressed] != expressed) {
            labelAttribute = "<h2>" + labelName +
                "</h2><b>" + "Click dropdown menu to begin viewing disaster figures." + "</b>";

        } else {
            //second if statement to add attribute data only to countries being evaluated 
            if (props[expressed] > 0) {
                labelAttribute = "<h2>" + labelName +
                    "</h2><b>" + "Total Declared " + expressed + " : " + props[expressed] + "</b>";
            } else {
                labelAttribute = "<h2>" + labelName +
                    "</h2><b>" + "No disasters declared for this type." + "</b>";
            };
        };
        //create info label div
        var infolabel = d3.select("body")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", props.NAME + "_label")
            .html(labelAttribute);
   
    };

    function moveLabel(){

        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;

        //use coordinates of mousemove event to set label coordinates
        var x = d3.event.clientX + 10,
            y = d3.event.clientY - 75;
    
        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };


})();
