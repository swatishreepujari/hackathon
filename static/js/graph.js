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
	.orient("bottom").ticks(10);

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
	y.domain([d3.min(values, function(d) { return d.Close; }), d3.max(values, function(d) { return d.Close; })]);

	// Add the valueline path.
	svg.append("path")		// Add the valueline path.
	    .style("stroke", "blue")
		.attr("class", "line")
		.style("stroke-width",2)
		.attr("d", valueline(values));

	// create a tooltip
    var Tooltip = d3.select(id)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

     // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1)
      }
      var mousemove = function(d) {
        Tooltip
          .html("Close Price: " + d.Close)
          .style("left", (d3.mouse(this)[0]+70) + "px")
          .style("top", (d3.mouse(this)[1]) + "px")
      }
      var mouseleave = function(d) {
        Tooltip
          .style("opacity", 0)
      }


	// Add the X Axis
	svg.append("g")			// Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg
      .append("g")
      .selectAll("dot")
      .data(values)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.dt) } )
        .attr("cy", function(d) { return y(d.Close) } )
        .attr("r", 5)
        .attr("fill", "#69b3a2")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

	// Add the Y Axis
	svg.append("g")			// Add the Y Axis
		.attr("class", "y axis")
		.call(yAxis);
	};
    draw(corDataList);
}

function sentiGraph(id,cData){
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
	.orient("bottom").ticks(10);


var	yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(5);

	//.innerTickSize(-width)
    //.outerTickSize(0)
    //.tickPadding(10);

// Define the line
var	valueline = d3.svg.line()
	.x(function(d) { return x(d.dt); })
	.y(function(d) { return y(d.SentiScore); });

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
        d.SentiScore = +d.SentiScore;
      });
      console.log(values);


	// Scale the range of the data
	x.domain(d3.extent(values, function(d) { return d.dt; }));
	y.domain([d3.min(values, function(d) { return d.SentiScore; }), d3.max(values, function(d) { return d.SentiScore; })]);

	// Add the valueline path.
	svg.append("path")		// Add the valueline path.
	    .style("stroke", "red")
	    .style("stroke-width",2)
		.attr("class", "line")
		.attr("d", valueline(values));

	// create a tooltip
    var Tooltip = d3.select(id)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

     // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1)
      }
      var mousemove = function(d) {
        Tooltip
          .html("Score: " + d.SentiScore)
          .style("left", (d3.mouse(this)[0]+70) + "px")
          .style("top", (d3.mouse(this)[1]) + "px")
      }
      var mouseleave = function(d) {
        Tooltip
          .style("opacity", 0)
      }


	svg
      .append("g")
      .selectAll("dot")
      .data(values)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.dt) } )
        .attr("cy", function(d) { return y(d.SentiScore) } )
        .attr("r", 5)
        .attr("fill", "#69b3a2")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)


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

function regression(id, rData){

    regDataList = {};
    sentiCount={};

    rData.forEach(function(d) {
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
    rData.forEach(function(d) {
         d.forEach(function(d1){
            var regData ={};
            regData.Change = d1.qt.c - d1.qt.o;
            regData.SentiScore = sentiCount[d1.qt.d]
            regDataList[d1.qt.d] = regData
         });
    });
    var height = 300;
	var width = 600;
	var margin = {top: 20, right:20, bottom: 50, left: 20};

	// formatters for axis and labels
	var decimalFormat = d3.format("0.2f");
	var currencyFormat = d3.format("$0.2f");

	var svg = d3.select(id)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
		.attr("class", "y axis");

	svg.append("g")
		.attr("class", "x axis");

	var xScale = d3.scale.ordinal()
		.rangeRoundBands([margin.left, width], .1);

	var yScale = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");

	 // define function
    function draw(data) {
        // extract the x labels for the axis and scale domain
		var xLabels = data.map(function (d) { return d.SentiScore; })

		xScale.domain(xLabels);
		yScale.domain([0, Math.round(d3.max(data, function(d) { return parseFloat(d.Change); }))]);

		var line = d3.svg.line()
			.x(function(d) { return xScale(d.SentiScore); })
			.y(function(d) { return yScale(d.Change); });

		svg.append("path")
			.datum(data)
			.attr("class","line")
			.attr("d", line);

		svg.select(".x.axis")
			.attr("transform", "translate(0," + (height) + ")")
			.call(xAxis.tickValues(xLabels.filter(function(d, i) {
				if (i % 12 == 0)
					return d;
				})))
			.selectAll("text")
			.style("text-anchor","end")
			.attr("transform", function(d) {
				return "rotate(-45)";
			});

		svg.select(".y.axis")
			.attr("transform", "translate(" + (margin.left) + ",0)")
			.call(yAxis.tickFormat(currencyFormat));

		// chart title
		svg.append("text")
			.attr("x", (width + (margin.left + margin.right) )/ 2)
			.attr("y", 0 + margin.top)
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("font-family", "sans-serif")
			.text("USD/EURO Exhange Rate");

		// x axis label
		svg.append("text")
			.attr("x", (width + (margin.left + margin.right) )/ 2)
			.attr("y", height + margin.bottom)
			.attr("class", "text-label")
			.attr("text-anchor", "middle")
			.text("Year-Month");

		// get the x and y values for least squares
		var xSeries = d3.range(1, xLabels.length + 1);
		var ySeries = data.map(function(d) { return decimalFormat(d.Change); });

		var leastSquaresCoeff = leastSquares(xSeries, ySeries);

		// apply the reults of the least squares regression
		var x1 = xLabels[0];
		var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
		var x2 = xLabels[xLabels.length - 1];
		var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
		var trendData = [[x1,y1,x2,y2]];

		var trendline = svg.selectAll(".trendline")
			.data(trendData);

		trendline.enter()
			.append("line")
			.attr("class", "trendline")
			.attr("x1", function(d) { return xScale(d[0]); })
			.attr("y1", function(d) { return yScale(d[1]); })
			.attr("x2", function(d) { return xScale(d[2]); })
			.attr("y2", function(d) { return yScale(d[3]); })
			.attr("stroke", "black")
			.attr("stroke-width", 1);

		// display equation on the chart
		svg.append("text")
			.text("eq: " + decimalFormat(leastSquaresCoeff[0]) + "x + " +
				decimalFormat(leastSquaresCoeff[1]))
			.attr("class", "text-label")
			.attr("x", function(d) {return xScale(x2) - 60;})
			.attr("y", function(d) {return yScale(y2) - 30;});

		// display r-square on the chart
		svg.append("text")
			.text("r-sq: " + decimalFormat(leastSquaresCoeff[2]))
			.attr("class", "text-label")
			.attr("x", function(d) {return xScale(x2) - 60;})
			.attr("y", function(d) {return yScale(y2) - 10;});

	};

	// returns slope, intercept and r-square of the line
	function leastSquares(xSeries, ySeries) {
		var reduceSumFunc = function(prev, cur) { return prev + cur; };

		var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
		var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

		var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
			.reduce(reduceSumFunc);

		var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
			.reduce(reduceSumFunc);

		var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
			.reduce(reduceSumFunc);

		var slope = ssXY / ssXX;
		var intercept = yBar - (xBar * slope);
		var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

		return [slope, intercept, rSquare];

    }

     var values = Object.keys(regDataList).map(function(key){
            return regDataList[key];
        });
      values.forEach(function(d) {
        d.Change = d.Change;
        d.SentiScore = d.SentiScore;
     });
     console.log(values);

     draw(values)

}
