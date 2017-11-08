// set up SVG for D3
$(document).ready(function(){

var graph = 
{
 "name": "Syria",
 "children": [
  {"name": "Migrant Crisis", "size": 55},
  {
   "name": "Arab Spring",
   "children": [
    {
     "name": "Middle East",
     "children": [
      {"name": "Iran", "size": 40},
      {"name": "Saudi Arabia", "size": 60},
      {"name": "Palestine", "size": 40},
      {"name": "Iraq", "size": 30},
      {"name": "Yemen", "size": 35}
     ]
    },
    {
     "name": "Africa",
     "children": [
      {"name": "Egypt", "size": 35},
      {"name": "Algeria", "size": 57},
      {"name": "Morocco", "size": 70},
      {"name": "Tunisia", "size": 34}
     ]
    }
   ]
  }
 ]
};  
var width = $(document).width(),
    height = 700,
    colors = d3.scale.category10(),
    root;

var leafColor = colors(Math.random(4))
var force = d3.layout.force()
    .linkDistance(200)
    .charge(-500)
    .gravity(.05)
    .size([width, height])
    .on("tick", tick);

var min_zoom = 0.1;
var max_zoom = 7;
var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])

var svg = d3.select("#graphTest").append("svg")
    .attr("width", width)
    .attr("height", height)

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node"),
    g = svg.selectAll(".g");




  root = graph;
  update();
 function rescale() {
  trans=d3.event.translate;
  scale=d3.event.scale;

  svg.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

function update() {
  var nodes = flatten(root),
      links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .start();

  // Update links.
  link = link.data(links, function(d) { return d.target.id; });

  link.exit().remove();

  link.enter().insert("line", ".node")
      .attr("class", "link");

  // Update nodes.
  node = node.data(nodes, function(d) { return d.id; });

  node.exit().remove();
 
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .on("click", click)
      .call(force.drag);

  nodeEnter.append("circle")
      .attr("r", function(d) { return d.size || 50});

  nodeEnter.append("text")
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  node.select("circle")
      .style("fill", color);
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function color(d) {
  return d._children ? colors(9) // collapsed package
      : d.children ? colors(10) // expanded package
      : leafColor; // leaf node
}

// Toggle children on click.
function click(d) {
  if (d3.event.defaultPrevented) return; // ignore drag
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update();
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}
})

