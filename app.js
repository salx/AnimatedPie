(function(){ //don't accidentially pollute the global scope

  	var margin = {top: 50, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
        radius = Math.min(width, height) / 2;

	var x = d3.time.scale()
		.range([0, width])
		.clamp(true);

	var brush = d3.svg.brush()
		.x(x)
		.extent([0, 0])//setzt die "Startposition" fest
		.on("brush", brushed);

	var color = d3.scale.category10();

	var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);

	var pie = d3.layout.pie()
		.sort(d3.ascending)
		.value( function(d){ return d; } );

	/*
	var xAxis = d3.svg.axis()
		.scale(x)
		.tickFormat(d3.time.format("%Y"))
		.orient("top")
		.ticks(53);
	*/

	var svg = d3.select("body").append("svg")
		.attr("width", width  + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom );
	
	var chartGroup = svg.append("g")
		.attr("transform", "translate(" + [width / 2, (height / 2) + margin.top+30] + ")");
	
	var sliderBar = svg.append("g")
		.attr("transform", "translate("+ [margin.left, margin.top] +")");
	
	sliderBar
		.append("rect")
		.attr("class", "background")
		.attr("width", width+15)
		.attr("x", -15)
		.attr("height", 20);
	
	var slider = sliderBar.append("g") 
		.attr("class", "slider")
		.call(brush)

	var handle  = slider.append("circle")
		.attr("class", "handle")
		.attr("transform", "translate(-5,10)")
		.attr("r", 7);

	var axisGroup = svg.append("g")
	.attr("transform", "translate("+ [margin.left, margin.top] +")");


	function forYear(year){
		var i = 0, d;			
		while(d = data[i]){
			if(d.Jahr.getFullYear() === year){
				return [ d.aLpP, d.bFlpP ];	
			}
			i++;
		}
	};
	
	d3.json("Bodenverbrauchsindex.json", function (result){
		data = result;
		data.forEach(function(d){ d.Jahr = new Date(d.Jahr); });
		x.domain(d3.extent(data, function(d) { return d.Jahr; }));

		drawChart(1961);

		/*
		axisGroup.append("g")
			.selectAll("text")
			.data(data.filter(function(d,i){ return (i%3 === 0)}))
			.enter().append("text")
			.text(function(d){return d.Jahr.getFullYear()})
			.attr("y", function(d){return x(d.Jahr)})
			.style("text-anchor", "start")
			.attr("transform", "rotate(-90)")
			.attr("dx", "0.71em");
		*/

		var axis = axisGroup.append("g")
			.selectAll("g")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d) { return "translate("+ x(d.Jahr) + ",0)"; })
			.attr("class", "axis");

		axis.append("line")
			.attr("stroke", "#000")
			.attr("stroke-width", "1")
			.attr("vector-effect", "non-scaling-stroke")
			.attr("x1", -5)
			.attr("y1", -2)
			.attr("x2", -5)
			.attr("y2", -8);


		axis.append("text")
			.text(function(d, i){
				if (i%3===0){
					return d.Jahr.getFullYear();
				}else{
					return "";
				}
			})
			.style("text-anchor", "start")
			.attr("transform", "rotate(-90)")
			.attr("dx", "0.71em");


	})

	function drawChart(Jahr) {
		//chartGroup.selectAll(".arc")
			//.remove();

		var g = chartGroup.selectAll(".arc")
			.data(pie(forYear(Jahr)) )
		   .enter().append("path")
			.attr("class", "arc")
			.attr("d", arc)
			.style("fill", function(d, i){ return color(i) });

	}

	//siFu wieso funkt das NUR hier herausen?? Nicht in der Daten-Funktion?
	function brushed(){
		var value = brush.extent()[0];

		if(d3.event.sourceEvent){
			value = x.invert(d3.mouse(this) [0]);
			brush.extent([value, value]);
		}
		handle.attr("cx", x(value));
		var currentYear = value.getFullYear();
		chartGroup.selectAll( '.arc' )
		.data(pie(forYear(currentYear)))
		//.transition()
		.attr("d", arc);

	};

})();
