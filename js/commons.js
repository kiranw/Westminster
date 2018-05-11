
var c_total_nodes = 12;
var districtLeaders = {};


// returns random int between 0 and num
function getRandomInt(num) {return Math.floor(Math.random() * (num));}

d3.range(c_total_nodes).forEach(function(d){

    d_total_nodes = 10;
    var c_districtID = "district_"+d;

    var commonsSvg = "commonsDistrict" + d;
    $("#" + commonsSvg).append("<br><div class='district-name'>DISTRICT " + d + "</div>");

    var c_local_nodes = d3.range(d_total_nodes);
    var c_currentLeader = getRandomInt(d_total_nodes);
    districtLeaders[d] = c_currentLeader;

    var c_nodes = d3.range(d_total_nodes).map(function(d) { return {id: d} });
    var c_links_unflat = d3.range(d_total_nodes).map(function(d) {
        c_local_links = []
        d3.range(d_total_nodes).forEach(function(e){
            if (e!=d){
                c_local_links.push({source:d, target:e})
            }
        })
        return c_local_links;
    });
    var c_links = [];
    c_links_unflat.forEach(function(l){
        l.forEach(function(m){
            c_links.push(m)
        })
    })

    var c_width = 200,
        c_height = 200;
    var force = d3.forceSimulation(c_nodes)
        .force("link", d3.forceLink(c_links));

    var svg = d3.select("#"+commonsSvg).append("svg")
        .attr("width", c_width)
        .attr("height", c_height);

    var dim = 120;
    var d_circle = svg.append("path")
        .attr("d", "M 20, "+(dim/2+40)+" a "+dim/2+","+dim/2+" 0 1,0 "+dim+",0 a "+dim/2+","+dim/2+" 0 1,0 "+dim*-1+",0")
        .style("fill", "#f5f5f5");

    // evenly spaces nodes along arc
    var d_circleCoord = function(node, index, num_nodes){
        var circumference = d_circle.node().getTotalLength();
        var pointAtLength = function(l){return d_circle.node().getPointAtLength(l)};
        var sectionLength = (circumference)/num_nodes;
        var position = sectionLength*index+sectionLength/2;
        return pointAtLength(circumference-position)
    }

    force.restart();

    // set coordinates for container nodes
    c_nodes.forEach(function(n, i) {
        var coord = d_circleCoord(n, i, c_nodes.length);
        n.x = coord.x;
        n.y = coord.y;
    });

    // var c_lines = svg.selectAll("line.node-link")
    //     .data(c_links).enter().append("line")
    //     .attr("class", "node-link")
    //     .attr("opacity",0.7)
    //     .attr("x1", function(d) { return d.source.x; })
    //     .attr("y1", function(d) { return d.source.y; })
    //     .attr("x2", function(d) { return d.target.x; })
    //     .attr("y2", function(d) { return d.target.y; });

    var gnodes = svg.selectAll('g.gnode')
        .data(c_nodes).enter().append('g')
        .attr("transform", function(d) {
            return "translate("+d.x+","+d.y+")"
        })
        .classed('gnode', true);

    var node = gnodes.append("circle")
        .attr("r", 15)
        .attr("class", "node")
        .attr("id", function(d){ return c_districtID + d.id; })
        .on("mouseenter", function(d) {
            is_connected(d, 0.1)
            node.transition().duration(100).attr("r", 15)
            d3.select(this).transition().duration(100).attr("r", 30)
        })
        .on("mouseleave", function(d) {
            node.transition().duration(100).attr("r", 15);
            is_connected(d, 0.7);
        });

    var labels = gnodes.append("text")
        .attr("dy", 4)
        .attr("class","label")
        .text(function(d){return d.id});

    d3.select("#"+c_districtID + c_currentLeader)
        .attr("class","node leader")
        .attr("r",23);

});

var commonsID = "commons"
var commonsSvg = "commonsSvg";
var c_local_nodes = d3.range(c_total_nodes);
var c_scores = c_local_nodes.reduce(function(map, obj) {
    map[obj] = 0;
    return map;
}, {});
var c_currentLeader = 0;

var c_nodes = d3.range(c_total_nodes).map(function(d) { return {id: d} });
var c_links_unflat = d3.range(c_total_nodes).map(function(d) {
    c_local_links = []
    d3.range(c_total_nodes).forEach(function(e){
        if (e!=d){
            c_local_links.push({source:d, target:e})
        }
    })
    return c_local_links;
});
var c_links = [];
c_links_unflat.forEach(function(l){
    l.forEach(function(m){
        c_links.push(m)
    })
})

var c_width = 500,
    c_height = 500;
var c_force = d3.forceSimulation(c_nodes)
    .force("link", d3.forceLink(c_links));

var c_svg = d3.select("#"+commonsSvg).append("svg")
    .attr("width", c_width)
    .attr("height", c_height);

var dim = c_width-80;
var c_circle = c_svg.append("path")
    .attr("d", "M 40, "+(dim/2+40)+" a "+dim/2+","+dim/2+" 0 1,0 "+dim+",0 a "+dim/2+","+dim/2+" 0 1,0 "+dim*-1+",0")
    .style("fill", "#f5f5f5");

// evenly spaces nodes along arc
var c_circleCoord = function(node, index, num_nodes){
    // console.log(c_circle.node());
    var circumference = c_circle.node().getTotalLength();
    console.log(circumference)
    var pointAtLength = function(l){return c_circle.node().getPointAtLength(l)};
    var sectionLength = (circumference)/num_nodes;
    var position = sectionLength*index+sectionLength/2;
    return pointAtLength(circumference-position)
}

c_force.restart();

// set coordinates for container nodes
c_nodes.forEach(function(n, i) {
    var coord = c_circleCoord(n, i, c_nodes.length);
    n.x = coord.x;
    n.y = coord.y;
});

var c_lines = c_svg.selectAll("line.node-link")
    .data(c_links).enter().append("line")
    .attr("class", "node-link")
    .attr("opacity",0.7)
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

var c_gnodes = c_svg.selectAll('g.gnode')
    .data(c_nodes).enter().append('g')
    .attr("transform", function(d) {
        return "translate("+d.x+","+d.y+")"
    })
    .classed('gnode', true);

var c_node = c_gnodes.append("circle")
    .attr("r", 25)
    .attr("class", "node")
    .attr("id", function(d){ return commonsID + d.id; })
    .on("mouseenter", function(d) {
        is_connected(d, 0.1)
        c_node.transition().duration(100).attr("r", 25)
        d3.select(this).transition().duration(100).attr("r", 30)
    })
    .on("mouseleave", function(d) {
        c_node.transition().duration(100).attr("r", 25);
        is_connected(d, 0.7);
    });

var labels = c_gnodes.append("text")
    .attr("dy", 4)
    .attr("class","label2")
    .text(function(d){return d.id + "." + districtLeaders[d.id];});




d3.select("#"+ commonsID + c_currentLeader)
    .attr("class","node leader");
d3.select("#commonsDistrict" + c_currentLeader)
    .classed("leading-district",true);

