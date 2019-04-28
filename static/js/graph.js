function dashboard(id, fData){
    var barColor = 'steelblue';
    function segColor(c){ return {low:"#807dba", mid:"#e08214",high:"#41ab5d"}[c]; }

    // compute total for each state.
    fData.forEach(function(d){d.total=d.freq.low+d.freq.mid+d.freq.high;});

    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 500 - hGDim.l - hGDim.r,
        hGDim.h = 200 - hGDim.t - hGDim.b;

        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));

        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Create function for y-axis map.
        var y = d3.scale.linear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");

        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);// mouseout is defined below.

        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");

        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            var st = fData.filter(function(s){ return s.State == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});

            // call update functions of pie-chart and legend.
            pC.update(nD);
            leg.update(nD);
        }

        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.
            pC.update(tF);
            leg.update(tF);
        }

        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);

            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });
        }
        return hG;
    }

    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }
        return pC;
    }

    // function to handle legend.
    function legend(lD){
        var leg = {};

        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');

        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '10').attr("height", '10').append("rect")
            .attr("width", '10').attr("height", '10')
			.attr("fill",function(d){ return segColor(d.type); });

        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
    }

    // calculate total frequency by segment for all state.
    var tF = ['low','mid','high'].map(function(d){
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))};
    });

    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.State,d.total];});

    var hG = histoGram(sF); // create the histogram.
        //pC = pieChart(tF); // create the pie-chart.
        //leg= legend(tF);  // create the legend.
}

function pieGraph(id, oData){
    var key = oData.key;
    var barColor = 'steelblue';
    function segColor(c){ return {pos:"#807dba", neg:"#e08214",net:"#41ab5d"}[c]; }

    // compute total for each state.
    // fData.forEach(function(d){d.total=d.freq.low+d.freq.mid+d.freq.high;});

    var pDataList = [];
    //console.log(oData.length);
    oData.forEach(function(d) {
        d.forEach(function(d1){
            var pData ={};

            pData.dt = d1.dt;
            //console.log(d1.dt);
            if(key == 'infosys'){
                pos=0;
                neg = 5;
                net = 7;
            } else if(key == 'tcs'){
                pos=0;
                neg = 15;
                net = 20;
            } else if(key == "hdfc") {
                pos=0;
                neg = 10;
                net = 18;
            } else if (key == 'maruti'){
                pos=9;
            neg = 5;
            net = 10;
            } else {
                pos=0;
            neg = 5;
            net = 7;
            }

            if(d1.score == 'pos'){
                pos = pos+1;
            } else if(d1.score == 'neg'){
                neg = neg+1;
            } else {
                net = net +1;
            }
            pData.freq = {};
            pData.freq.pos = pos;
            pData.freq.neg = neg;
            pData.freq.net = net;
            pDataList.push(pData)

        });
    });
    //console.log(pDataList)


    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(40);


        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);



        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);

        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }
        return pC;
    }

    // calculate total frequency by segment for all state.
     //var tF = ['low','mid','high'].map(function(d){
       // return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))};
    //});

    // calculate total frequency by segment for all state.
    var tF1 = ['pos','neg','net'].map(function(d){
        return {type:d, freq: d3.sum(pDataList.map(function(t){ return t.freq[d];}))};
    });

    var pC = pieChart(tF1); // create the pie-chart.

}

function lineGraph(id,lData){
    var lDataList = [];
    console.log(lData.length);
    lData.forEach(function(d) {
        d.forEach(function(d1){
            var lData ={};
            lData.Date = d1.qt.d;
            lData.High = d1.qt.h;
            lData.Low = d1.qt.l;
            lData.o = d1.qt.o;
            lData.Close = d1.qt.c;
            lDataList.push(lData)

        });
    });
    console.log(lDataList)

    // Set the dimensions of the svg
    var margin = {top: 30, right: 50, bottom: 30, left: 50};
    var svgWidth = 600;
    var svgHeight = 270;
    var graphWidth = svgWidth - margin.left - margin.right;
    var graphHeight = svgHeight - margin.top - margin.bottom;
    // Parse the date / time
    var parseDate = d3.time.format("%d/%B/%Y").parse;
    // Set the ranges
    var x = d3.time.scale().range([0, graphWidth]);
    var y = d3.scale.linear().range([graphHeight, 0]);
    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);
    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(6);
    // Define the High line
    var highLine = d3.svg.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.High); });
    var closeLine = d3.svg.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Close); });
    var lowLine = d3.svg.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Low); });
    var area = d3.svg.area()
      .x(function(d) { return x(d.Date); })
      .y0(function(d) { return y(d.Low); })
      .y1(function(d) { return y(d.High); })
    // Adds the svg canvas
    var svg = d3.select(id)
      .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
      .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

    // define function
    function draw(data) {
      data.forEach(function(d) {
        d.Date = parseDate(d.Date);
        d.High = +d.High;
        d.Close = +d.Close;
        d.Low = +d.Low;
      });
      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.Date; }));
      y.domain([d3.min(data, function(d) {
          return Math.min(d.High, d.Close, d.Low) }),
          d3.max(data, function(d) {
          return Math.max(d.High, d.Close, d.Low) })]);
      // Add the area path.
      svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
      // Add the 2 valueline paths.
      svg.append("path")
        .style("stroke", "green")
        .style("fill", "none")
        .attr("class", "line")
        .attr("d", highLine(data));
      svg.append("path")
        .style("stroke", "blue")
        .style("fill", "none")
        .style("stroke-dasharray", ("3, 3"))
        .attr("d", closeLine(data));
      svg.append("path")
        .style("stroke", "red")
        .attr("d", lowLine(data));
      // Add the X Axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + graphHeight + ")")
          .call(xAxis);
      // Add the Y Axis
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
      svg.append("text")
        .attr("transform", "translate("+(graphWidth+3)+","+y(graphData[0].High)+")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", "green")
        .text("High");
      svg.append("text")
        .attr("transform", "translate("+(graphWidth+3)+","+y(graphData[0].Low)+")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", "red")
        .text("Low");
      svg.append("text")
        .attr("transform", "translate("+(graphWidth+3)+","+y(graphData[0].Close)+")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", "blue")
        .text("Close");
    };
    draw(lDataList);
}

function corelationGraph(id,cData){
    corDataList = {};
    sentiCount={};

    cData.forEach(function(d) {
        d.forEach(function(d1){
            count = 0;
            if (d1.qt.d in sentiCount) {
                count = sentiCount[d1.qt.d];
                if (d1.score == 'pos'){
//                    console.log("pos count" + count)
                    count = count + 1;
                } else {
//                    console.log("neg count" + count)
                    count = count - 1;
                }
                sentiCount[d1.qt.d] = count;
            } else {
                sentiCount[d1.qt.d] = count +1;
            }
        });
    });
    cData.forEach(function(d) {
         d.forEach(function(d1){
            var corData ={};
            corData.dt = d1.qt.d;
            corData.High = d1.qt.h;
            corData.Low = d1.qt.l;
            corData.Open = d1.qt.o;
            corData.Close = d1.qt.c;
            corData.Change = d1.qt.c - d1.qt.o;
            corData.SentiScore = sentiCount[d1.qt.d]
            corDataList[d1.qt.d] = corData
         });
    });

    // Set the dimensions of the canvas / graph
var	margin = {top: 30, right: 20, bottom: 30, left: 50},
	width = 600 - margin.left - margin.right,
	height = 270 - margin.top - margin.bottom;

// Parse the date / time
var	parseDate = d3.time.format("%d/%B/%Y").parse;

// Set the ranges
var	x = d3.time.scale().range([0, width]);
var	y = d3.scale.linear().range([height, 0]);

// Define the axes
var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(5);

var	yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(5);

// Define the line
var	valueline = d3.svg.line()
	.x(function(d) { return x(d.dt); })
	.y(function(d) { return y(d.Close); });

// Adds the svg canvas
var	svg = d3.select(id)
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // define function
    function draw(data) {
        var values = Object.keys(data).map(function(key){
            return data[key];
        });
      values.forEach(function(d) {
        d.dt = parseDate(d.dt);
        d.Close = +d.Close;
      });
      console.log(values);


	// Scale the range of the data
	x.domain(d3.extent(values, function(d) { return d.dt; }));
	y.domain([0, d3.max(values, function(d) { return d.Close; })]);

	// Add the valueline path.
	svg.append("path")		// Add the valueline path.
		.attr("class", "line")
		.attr("d", valueline(values));

	// Add the X Axis
	svg.append("g")			// Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// Add the Y Axis
	svg.append("g")			// Add the Y Axis
		.attr("class", "y axis")
		.call(yAxis);
	};
    draw(corDataList);
}

//{"20190427": [{"pos":4},{"neg":3}]}