"use strict";

var D3Force = (function () {
    function D3Force(selector, width, height) {
        this.selector = selector;
        this.byId = selector.indexOf("#") === 0;
        this.width = width;
        this.height = height;
        this.colorRange = [
            "rgba(219, 10, 91, 0.9)",
            "rgba(246, 36, 89, 0.9)",
            "rgba(210, 77, 87, 0.9)",
            "rgba(34, 167, 240, 0.9)",
            "rgba(107, 185, 240, 1.0)",
            "rgba(137, 196, 244, 1.0)",
            "rgba(78,205,196, 1.0)",
            "rgba(54, 215, 183, 1.0)",
            "rgba(210, 77, 87,1.0)",
            // "rgba(38, 194, 129, 1.0)",
        ]
    }
    D3Force.prototype._createForce = function (data) {
        console.log(data)
        var self = this;

        this.svg = d3.select(this.selector)
            .append("svg")
            .attr("width",  this.width)
            .attr("height", this.height);

        let toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function (d) {
                return d;
            });

        let colorScale = d3.scaleQuantile()
            .domain([0, 10])
            .range(this.colorRange);

        this.svg.call(toolTip);

        var color = d3.scaleOrdinal(d3.schemeCategory20);
        var radius = function (value) {
            switch (value){
                case "person":
                    return 40;
                case "employer":
                    return 35;
                case "position":
                    return 35;
                case "programming language":
                    return 30;
                case "framework":
                case "data storage":
                    return 25;
                case "skill":
                    return 20;
                case "project":
                    return 15;
            }
            return value.length + 10;
        };

        var h3 = function (v) {
            return "<h3>" + v + "</h3>";
        }
        var p = function (v) {
            return "<p>" + v + "</p>";
        }
        var a = function (v) {
            return "<a href='" + v + "'>" + v + "</a>";
        }

        var img = function (v) {
            return "<img src='" + v + "'>";
        }
        var getInfo = function (d) {
            switch (d.type){
                case "person":
                    return h3(d.name) + p(d.details) + p(img(d.url));
                case "employer":
                    return h3(d.name) + p(d.details) + a(d.url);
                case "position":
                    return h3(d.name) + p(d.details);
                case "programming language":
                    return h3(d.name) + p(d.details);
                case "framework":
                case "data storage":
                    return h3(d.name) + p(d.details);;
                case "skill":
                    return h3(d.name) + p(d.details);
                case "project":
                    return h3(d.name) + p(d.details);
            }
        }

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d, i) { return i; }).distance(130))
            .force("charge", d3.forceManyBody())
            .force("collide", d3.forceCollide().radius(function(d) { return radius(d.type) + 0.5; }).iterations(2))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        var link = this.svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke-width", function (d) { return Math.sqrt(d.type); });

        var node = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("circle")
            .attr("r", function (d, i) { return radius(d.type); })
            .attr("fill", function (d) { return colorScale(d.type.length % 10); })
            .on("mouseover", function (d) {
                toolTip.show(getInfo(d));
            })
            .on("mouseout", function (d) {
                toolTip.hide();
            })
            .on("dblclick", function (d) {
                simulation.alphaTarget(0.3).restart();
            })

        node.append("title")
            .text(function (d) { return d.name; });

        var texts = this.svg.append("g")
                        .attr("class", "texts")
                        .selectAll("text")
                        .data(data.nodes)
                        .enter().append("text")
                        .text(function (d) { return d.name; })
                        .on("mouseover", function (d) {
                            toolTip.show(getInfo(d));
                        })
                        .on("mouseout", function (d) {
                            toolTip.hide();
                        });

        simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(data.links);

        var drag_handler = d3.drag()
            .on("start", drag_start)
            .on("drag", drag_drag)
            .on("end", drag_end);
        //same as using .call on the node variable as in https://bl.ocks.org/mbostock/4062045
        drag_handler(node)

        var aspect = this.width / this.height;

        d3.select(window)
            .on("resize", function() {
                // var targetWidth = self.svg.node().getBoundingClientRect().width;
                // emtpy element
                d3.select(self.selector).html('');
                // initialize w, h
                self.width = window.innerWidth;
                // self.height = window.innerWidth / aspect;
                // redraw
                self.create(data);
            });


        function ticked() {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            // Set the top bottom left right collision rules:
            node
                .attr("cx", function(d) {
                    d.r = d.r || radius(d.type);
                    return (d.x = Math.max(d.r, Math.min(self.width - d.r, d.x)));
                })
                .attr("cy", function(d) {
                    d.r = d.r || radius(d.type);
                    return (d.y = Math.max(d.r, Math.min(self.height - d.r, d.y)));
                })

            texts
                .attr("x", function (d) { return d.x - 7; })
                .attr("y", function (d) { return d.y; });
        }
        function dragstarted(d) {
            if (!d3.event.active)
                simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        function dragended(d) {
            if (!d3.event.active)
                simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        function drag_start(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function drag_drag(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        function drag_end(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = d.x;
            d.fy = d.y;
        }
    };
    D3Force.prototype.create = function (data) {
        var self = this;
        if (typeof (data) === "string") {
            d3.json(data, function (e, data) {
                if (e)
                    throw e;
                if (data) {
                    return self._createForce(data);
                }
            });
        }
        else {
            return self._createForce(data);
        }
    };
    D3Force.prototype.update = function () {
    };
    D3Force.prototype.reset = function () {
    };
    D3Force.prototype.show = function () {
    };
    D3Force.prototype.hide = function () {
    };
    D3Force.prototype.search = function () {
    };
    return D3Force;
}());

var D3Timeline = (function () {
    function D3Timeline(selector) {
        this.selector = selector;
    }
    D3Timeline.prototype.create = function () {
    };
    D3Timeline.prototype.update = function () {
    };
    D3Timeline.prototype.reset = function () {
    };
    D3Timeline.prototype.show = function () {
    };
    D3Timeline.prototype.hide = function () {
    };
    D3Timeline.prototype.search = function () {
    };
    return D3Timeline;
}());
