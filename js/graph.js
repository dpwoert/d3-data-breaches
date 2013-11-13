window.graph = {
	tickSizeX: 200,
	h: window.innerHeight - 175 - 50,
	//padding: 20,
	marginLeft: -50
};

graph.colors = {};
graph.colors.cat = {
	'poor-security': '#fff96d',
	'lost': '',
	'hacked': '',
	'inside job': '',
	'accidentally-published': '',
	'unknown': '',
	'virus': ''
};
graph.colors.severity = {
	1: '#fff96d',
	2: '#b2293a',
	3: '#c9c9c9',
	4: '#2f9acc',
	5: '#d88942'
}

graph.init = function(){

	graph.svg = d3.select('svg');
	graph.svg.append('g');
	graph.g = d3.select('g');

	graph.prepare();
	graph.force();

};

graph.export = function(){
	var list = [];
	$.each(graph.data, function(key,val){
		var found = false;
		$.each(list, function(key2,val2){
			if(val.method == val2){
				found = true;
			}
		});

		if(!found){
			list.push(val.method);
		}
	})

	return list;
}

graph.prepare = function(){

	//make a nice json file...
	graph.data = [];
	$.each(window.DATA, function(key,val){
		if(key > 1 && val.subcategory){
			graph.data.push({
				year: val.primaryvalue,
				name: val.name,
				category: val.category,
				severity: val.metric_002,
				records: parseInt(val.metric_001),
				recordsString: val.metric_001,
				method: val.type,
				severity2: (parseInt(val.metric_002) * parseInt(val.metric_001)),
				source: val.FIELD18
			});
		}
	});

	//max years starting from 2004
	graph.years = d3.max(graph.data, function(d) { return +d.year; } );

	//radius needs max size
	graph.minRecords = d3.min(graph.data, function(d) { return +d.severity2; } );
	graph.maxRecords = d3.max(graph.data, function(d) { return +d.severity2; } );
	var maxR = 100;
	graph.radius = d3.scale.sqrt().range([10, maxR]).domain([graph.minRecords, graph.maxRecords]);

	//axis
	graph.axeY = d3.scale.linear().range([maxR,graph.h-maxR]).domain([1,5]);

	console.log(graph.data);
};

graph.data = function(){
	return graph.data;
};

graph.force = function(){

	var w = graph.w = graph.tickSizeX*(graph.years-1);
	var h = graph.h;
	$('svg')
		.width(w)
		.height(h);
	//graph.g.attr("transform", "translate(" + -w/2 + "," + w/2 + ")") 


	graph.force = d3.layout.force()
		.nodes(graph.data)
		.size([w,h])
		.on("tick", graph.tick)
		// .gravity(0.1)
		// .alpha(0.1)
		.start()

	var drag = graph.force.drag()
    	.on("dragstart", function(d) {
	  		d.fixed = true;
	  		d3.select(this).classed("fixed", true);
		}); 

	graph.circle = graph.g.selectAll("circle")
		.data(graph.data)
		.enter().append("circle")
		//.attr("r", function(d){ d.radius = graph.radius(d.records)+graph.padding; return d.radius-graph.padding; })
		.attr("r", function(d){ d.radius = graph.radius(d.records); return d.radius; })
		.style("fill", graph.getColor)
		.call(drag)
		.attr("cx", function(d){ d.x = graph.position.x(d); return d.x; })
		.attr("cy", function(d){ d.y = graph.position.y(d); return d.y; })
		.on('click', graph.showBox)

	$('#box').click(function(){
		$(this).slideUp();
	})
};

graph.position = {};

graph.position.x = function(d){
	return (graph.w - ( (graph.tickSizeX * 0.5) + (graph.tickSizeX * +d.year) ))+graph.marginLeft;
};

graph.position.y = function(d){
	return graph.axeY(d3.max(d.severity));
	// return graph.h/2;
};

graph.moveToCat = function(alpha){
	return function(d){

		var x = graph.position.x(d);
		var y = graph.position.y(d);

		d.x = d.x + (x - d.x) * 0.1 * alpha * 1.5;
		d.y = d.y + (y - d.y) * 0.1 * alpha * 1.9;

		if(d.y < d.radius) d.y = d.radius
		if(d.y > graph.h - d.radius) d.y =graph.h - d.radius;
	};
};

graph.getColor = function(d){
	var index = d3.max(d.severity);
	return graph.colors.severity[index];
}

//animate
graph.tick = function(e){

	if(graph.pause) return false;

	var q = d3.geom.quadtree(graph.data),
      	i = 0,
     	n = graph.data.length;

  	while (++i < n) q.visit(collide(graph.data[i]));

	graph.circle
		.each(collide(e.alpha))
		.each(graph.moveToCat(e.alpha))
		.attr("cx", function(d,i) { return d.x; })
		.attr("cy", function(d,i) { return d.y; });

	//fix width
	if(graph.force.alpha() < 0.01){
		$('svg').width($('g')[0].getBoundingClientRect().width + 200);
	}
};

graph.showBox = function(d){
	$box = $('#box')

	$box.find('h2').text(d.name);
	$box.find('.records').text(d.recordsString.replace('000',' 000') + ' records');
	$box.find('.source').text('Source: ' + d.source);

	$box.slideDown();
}