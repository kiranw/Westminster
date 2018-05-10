var districtID = "example"
var districtSvg = "districtExampleSvg"
var total_nodes = 10;

var local_nodes = d3.range(total_nodes);
var scores = local_nodes.reduce(function(map, obj) {
    map[obj] = 0;
    return map;
}, {});
var currentLeader = 0;

var nodes = d3.range(total_nodes).map(function(d) { return {id: d} });
var links_unflat = d3.range(total_nodes).map(function(d) {
    local_links = []
    d3.range(total_nodes).forEach(function(e){
        if (e!=d){
            local_links.push({source:d, target:e})
        }
    })
    return local_links;
});
var links = [];
links_unflat.forEach(function(l){
    l.forEach(function(m){
        links.push(m)
    })
})


var width = 500,
    height = 500;
var force = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links));


// returns random int between 0 and num
function getRandomInt(num) {return Math.floor(Math.random() * (num));}


// evenly spaces nodes along arc
var circleCoord = function(node, index, num_nodes){
    var circumference = circle.node().getTotalLength();
    var pointAtLength = function(l){return circle.node().getPointAtLength(l)};
    var sectionLength = (circumference)/num_nodes;
    var position = sectionLength*index+sectionLength/2;
    return pointAtLength(circumference-position)
}


// fades out lines that aren't connected to node d
var is_connected = function(d, opacity) {
    lines.transition().style("stroke-opacity", function(o) {
        return o.source === d || o.target === d ? 0.7 : opacity;
    });
}


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}


var svg = d3.select("#"+districtSvg).append("svg")
    .attr("width", width)
    .attr("height", height);

var dim = width-80
var circle = svg.append("path")
    .attr("d", "M 40, "+(dim/2+40)+" a "+dim/2+","+dim/2+" 0 1,0 "+dim+",0 a "+dim/2+","+dim/2+" 0 1,0 "+dim*-1+",0")
    .style("fill", "#f5f5f5");

var state = "none";

force.restart();

// set coordinates for container nodes
nodes.forEach(function(n, i) {
    var coord = circleCoord(n, i, nodes.length);
    console.log(coord);
    n.x = coord.x;
    n.y = coord.y;
});

var lines = svg.selectAll("line.node-link")
    .data(links).enter().append("line")
    .attr("class", "node-link")
    .attr("opacity",0.7)
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

var gnodes = svg.selectAll('g.gnode')
    .data(nodes).enter().append('g')
    .attr("transform", function(d) {
        return "translate("+d.x+","+d.y+")"
    })
    .classed('gnode', true);

var node = gnodes.append("circle")
    .attr("r", 15)
    .attr("class", "node")
    .attr("id", function(d){ return districtID + d.id; })
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

d3.select("#"+districtID + currentLeader)
    .attr("class","node leader");





function transitionLeader(node,i){
    if (i==0){
        newLeader = Object.keys(scores).reduce(function(a, b){ return scores[a] > scores[b] ? a : b });
        appendToLog("new leader: node"+newLeader);

        appendToLog("transitioning leader")
        if (currentLeader != newLeader){
            d3.select("#"+districtID + currentLeader)
                .classed("leader", false);
            currentLeader = newLeader;
            d3.select("#"+districtID + currentLeader)
                .attr("class","node leader");
        }
    }
}


// every regular interval update scores
function updateScores(){
    // If currentLeader, multiply reward/deduction by 5
    // Else add or deduct random amount;
    // If leader's score is not the max, change color to red
    local_nodes.forEach(function(d){
        if (currentLeader == d){
            scores[d] += (getRandomInt(30) - 8)/100;
        }
        else {
            scores[d] += (getRandomInt(30) - 10)/100;
        }
    })
    $("#" + districtID + "Scores").text(JSON.stringify(scores, null, 2));
}
setInterval(updateScores, 500);


// Initiate an election at a regular interval
// function runElection(){
    // broadcast election

    // Collect votes within a specific time limit
    // Choose random order of nodes

    // Choose random number of total votes
    // Each node submits a vote to the leader and backup
    // Once time limit expires, count votes

d3.select("#exampleRunElection").on("click", function() {
    appendToLog("initiating election");

    var nodes = d3.range(total_nodes).map(function(d) { return {id: d} });
    nodes.forEach(function(n, i) {
        var coord = circleCoord(n, i, nodes.length);
        console.log(coord);
        n.x = coord.x;
        n.y = coord.y;
    });

    // function endall(transition, callback) {
    //     if (typeof callback !== "function") throw new Error("Wrong callback in endall");
    //     if (transition.size() === 0) { callback() }
    //     var n = 0;
    //     transition
    //         .each(function() { ++n; })
    //         .each("end", function() { if (!--n) callback.apply(this, arguments); });
    // }

    var transitions = 0;

    var broadcast_node = svg.append("g")
        .attr("class","broadcast")
        .selectAll(".bnode")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", "black")
        .attr("opacity", 0)
        .attr("class", "bnode")
        .attr("cx",function(d){ console.log(nodes[0].x); return nodes[currentLeader].x;  })
        .attr("cy", function(d){ return nodes[currentLeader].y ; })
        .transition()
        .duration(6000)
        .attr("opacity",1)
        .attr("cx", function(d){ return d.x;})
        .attr("cy", function(d){ return d.y})
        .on( "end", function(d,i) {
            appendToLog("broadcasting vote request",d,i,true);
        })
        .transition(0)
        .duration(1000)
        .attr("opacity",0)
        .on( "end", function(d,i) {
            appendToLog(i + " received request",d,i,false);
        })
        .transition()
        .duration(6000)
        .attr("opacity",1)
        .attr("cx", nodes[currentLeader].x)
        .attr("cy", nodes[currentLeader].y)
        .on( "end", function(d,i) {
            appendToLog(i + " voted",d,i,false);
        })
        .transition(100)
        .duration(1000)
        .attr("opacity",0)
        .transition()
        .duration(6000)
        .attr("opacity",1)
        .attr("cx", function(d){ return d.x;})
        .attr("cy", function(d){ return d.y})
        .on( "end", function(d,i) {
            appendToLog("voted processed",d,i,true);
        })
        .transition(100)
        .duration(1000)
        .attr("opacity",0)
        .on( "end", function(d,i) {
            transitionLeader(d,i);
        })
    ;
    // New leader starts

});

// Run a write at some random interval
function callWrite(){
    // Randomly choose a node to request to current leader
    // Send circle to leader
    // Leader either adds to their issue list or doesnt randomly
}

// Run a read on some random interval
function callRead(){
    // Randomly choose a node to request
    // Send circle to the leader
    // Leader responds back
}

function appendToLog(msg,node,index,flag){
    if (flag){
        if (index==0){
            $("#log-text").append(Date.now() + "<br><strong>" + msg+"</strong><br><br>")
        }
    }
    else {
        $("#log-text").append(Date.now() + "<br><strong>" + msg+"</strong><br><br>")
    }
}