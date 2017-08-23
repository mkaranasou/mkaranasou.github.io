"use strict";

var D3Force = (function () {
    function D3Force(selector, width, height) {
        this.selector = selector;
        this.data = {};
        this.filteredData = {};
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
        this.simulation = null;
    }

    D3Force.prototype._createForce = function (data) {
        var self = this;

        // set data once
        if (Object.keys(self.data).length === 0) {
            self.data = data;
        }
        d3.select(this.selector).select("svg").remove();

        this.svg = d3.select(this.selector)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("opacity", 1);

        let toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-25, 0])
            .html(function (d) {
                return d;
            });

        let colorScale = d3.scaleQuantile()
            .domain([0, 10])
            .range(this.colorRange);

        this.svg.call(toolTip);

        var color = d3.scaleOrdinal(d3.schemeCategory20);
        var fitText = function (text, r) {
            return text.substr(0, 10);
            /* return text.length < r * 2
                         ? text
                         : text.substr(0, r-3) + "...";*/
        };
        var fillColor = function (value) {
            switch (value) {
                case "employer":
                    return "rgb(246, 71, 71)"; // LYNCH
                default:
                    return "#7979FF"
            }
        };

        var fillTextColor = function (value) {
            switch (value) {
                case "person":
                    return "rgb(249, 105, 14)"; // ECSTASY
                case "employer":
                    return "rgb(25, 181, 254)"; // DODGER BLUE
                case "position":
                    return "rgb(191, 85, 236)"; // MEDIUM PURPLE
                case "programming language":
                    return "rgb(3, 201, 169)"; // CARIBBEAN GREEN
                case "framework":
                case "data storage":
                    return "rgb(34, 167, 240)"; // PICTON BLUE
                case "skill":
                    return "rgb(210, 77, 87)"; //  CHESTNUT ROSE
                case "project":
                    return "rgb(246, 71, 71)"; // SUNSET ORANGE
            }
        };
        var radius = function (value) {
            switch (value) {
                case "person":
                    return 60;
                case "employer":
                    return 55;
                case "position":
                    return 50;
                case "programming language":
                    return 45;
                case "framework":
                case "data storage":
                    return 40;
                case "skill":
                    return 35;
                case "project":
                    return 30;
            }
            return value.length + 10;
        };

        var h3 = function (v) {
            return "<h3>" + v + "</h3>";
        };
        var p = function (v) {
            return "<p>" + v + "</p>";
        };
        var a = function (v) {
            return "<a href='" + v + "'>" + v + "</a>";
        };

        var img = function (v) {
            return "<img src='" + v + "'>";
        };
        var getInfo = function (d) {
            switch (d.type) {
                case "person":
                    return h3(d.name) + p(d.details) + p(img(d.url));
                case "employer":
                    return h3(d.name) + p(d.details) + a(d.url) + p(img(d.img));
                case "position":
                    return h3(d.name) + p(d.details);
                case "programming language":
                    return h3(d.name) + p(d.details) + (d.img ? p(img(d.img)) : "");
                case "framework":
                case "data storage":
                    return h3(d.name) + p(d.details) + (d.img ? p(img(d.img)) : "");
                case "skill":
                    return h3(d.name) + p(d.details);
                case "project":
                    return h3(d.name) + p(d.details);
            }
        };

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d, i) {
                return i;
            }).distance(50))
            .force("charge", d3.forceManyBody())
            .force("collide", d3.forceCollide().radius(function (d) {
                return radius(d.type) + 1.5;
            }).iterations(2))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));
        // .force("y", d3.forceY(0))
        // .force("x", d3.forceX(0));

        var link = this.svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.type);
            });

        var node = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("circle")
            .attr("r", function (d, i) {
                return radius(d.type);
            })
            .attr("fill", function (d) {
                return fillColor(d.type);
            })
            .on("mouseover", function (d) {
                if (d.dragged) return;
                toolTip.show(getInfo(d));
            })
            .on("mouseout", function (d) {
                toolTip.hide();
            })
            .on("dblclick", function (d) {
                self.simulation.alphaTarget(0.3).restart();
            });

        node.append("title")
            .text(function (d) {
                return d.name;
            });

        var texts = this.svg.append("g")
            .attr("class", "texts")
            .selectAll("text")
            .data(data.nodes)
            .enter()
            .append("text")
            .attr("opacity", function (d) {
                return d.img === undefined ? 1 : 0;
            })
            .text(function (d) {
                return fitText(d.name, d.r || radius(d.type));
            })
            .attr("fill", function (d, i) {
                return fillTextColor(d.type);
            })
            .on("mouseover", function (d) {
                if (d.dragged) return;
                toolTip.show(getInfo(d));
            })
            .on("mouseout", function (d) {
                toolTip.hide();
            });

        // Append images
        var images = this.svg.append("g")
            .attr("class", "image")
            .selectAll("image")
            .data(data.nodes)
            .enter()
            .append("svg:image")
            .attr("opacity", function (d) {
                return d.img !== undefined ? 1 : 0;
            })
            .attr("xlink:href", function (d) {
                return d.img;
            })
            .attr("x", function (d) {
                return -45;
            })
            .attr("y", function (d) {
                return -35;
            })
            .attr("height", function (d) {
                return radius(d.type) + 10;
            })
            .attr("clip-path", "url(#clip)")
            .attr("width", function (d) {
                return radius(d.type) + 10;
            })
            .on("mouseover", function (d) {
                if (d.dragged) return;
                toolTip.show(getInfo(d));
            })
            .on("mouseout", function (d) {
                toolTip.hide();
            });

        this.simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        this.simulation.force("link")
            .links(data.links);

        var drag_handler = d3.drag()
            .on("start", drag_start)
            .on("drag", drag_drag)
            .on("end", drag_end);
        //same as using .call on the node variable as in https://bl.ocks.org/mbostock/4062045
        drag_handler(node);
        drag_handler(images);

        var aspect = this.width / this.height;

        d3.select(window)
            .on("resize", function () {
                // var targetWidth = self.svg.node().getBoundingClientRect().width;
                // emtpy element
                d3.select(self.selector).html('');
                // initialize w, h
                self.width = window.innerWidth - 50;
                // self.height = window.innerWidth / aspect;
                // redraw
                self.create(data);
            });


        self.search("#search");

        function ticked() {
            link
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            // Set the top bottom left right collision rules:
            node
                .attr("cx", function (d) {
                    d.r = d.r || radius(d.type);
                    return (d.x = Math.max(d.r, Math.min(self.width - d.r, d.x)));
                })
                .attr("cy", function (d) {
                    d.r = d.r || radius(d.type);
                    return (d.y = Math.max(d.r, Math.min(self.height - d.r, d.y)));
                });
            images.attr("x", function (d) {
                d.r = d.r || radius(d.type);
                return (d.x = Math.max(d.r, Math.min(self.width - d.r - 20, d.x - 20)));
            })
                .attr("y", function (d) {
                    d.r = d.r || radius(d.type);
                    return (d.y = Math.max(d.r, Math.min(self.height - d.r - 20, d.y - 20)));
                });
            texts
                .attr("x", function (d) {
                    return d.x - radius(d.type) + 10;
                })
                .attr("y", function (d) {
                    return d.y + radius(d.type) - 10;
                })
        }

        function dragstarted(d) {
            if (!d3.event.active)
                self.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active)
                self.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        function drag_start(d) {
            d.dragged = true;
            if (!d3.event.active) self.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function drag_drag(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function drag_end(d) {
            d.dragged = false;
            if (!d3.event.active) self.simulation.alphaTarget(0);
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
    D3Force.prototype.toggle = function () {
        $(this.selector).slideToggle();
    };
    D3Force.prototype.search = function (selector) {
        var self = this;
        var search = d3.select(selector).on("keydown", function (d) {
            console.log(d, d3.event, self.data);
            if (d3.event.key === "Enter") {
                var value = d3.select(selector).node().value.toLowerCase();
                if (value.length === 0) {
                    self.create(self.data);
                }
                else {
                    self.filteredData.nodes = self.data.nodes.filter(function (o) {
                        return o.name.toLowerCase().indexOf(value) > -1;
                    }).slice(0);
                    self.filteredData.links = self.data.links.filter(function (o) {
                        return o.source.name.toLowerCase().indexOf(value) > -1 && o.target.name.toLowerCase().indexOf(value) > -1;
                    }).slice(0);
                    self.create(self.filteredData);
                }
            }

        })
    };
    return D3Force;
}());

var D3Timeline = (function () {
    function D3Timeline(selector) {
        this.selector = selector;
    }

    D3Timeline.prototype.create = function (data) {
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

var D3SwimLane = (function () {
    function D3SwimLane(selector, width, height) {
        this.selector = selector;
        this.data = {};
        this.filteredData = {};
        this.width = width;
        this.height = height;
        this.svg = null;
    }

    D3SwimLane.prototype._createLanes = function (data)  {
        var lanes = [];
        var lanesToItems = {};
        var items = [];
        for(let i=0; i < data.nodes.length;  i++){
            let isPerson = data.nodes[i]["type"]=== "person" ;
            if (isPerson) continue;
            if(lanes.indexOf(data.nodes[i]["type"]) === -1){
                lanes.push(data.nodes[i]["type"]);
                lanesToItems[data.nodes[i]["type"]] = [];
            }
            var e = {
                "lane": lanes.indexOf(data.nodes[i]["type"]),
                "id": data.nodes[i]["name"],
                "start": data.nodes[i]["from"],
                "end": data.nodes[i]["to"]
            };
            lanesToItems[data.nodes[i]["type"]].push(e);
            items.push(e);

        }
        console.log(lanes, items);
        var laneLength = lanes.length;
        var timeBegin = 2009;
        var timeEnd = 2018;

		var m = [20, 15, 15, 120], //top right bottom left
			w = this.width - m[1] - m[3] - 40,
			h = this.height - m[0] - m[2],
			miniHeight = laneLength * 12 + 50,
			mainHeight = h - miniHeight - 50;

		//scales
		var x = d3.scaleLinear()
				.domain([timeBegin, timeEnd])
				.range([0, w]);
		var x1 = d3.scaleLinear()
                .domain([timeBegin, timeEnd])
				.range([0, w]);
		var y1 = d3.scaleLinear()
				.domain([0, laneLength])
				.range([0, mainHeight]);
		var y2 = d3.scaleLinear()
				.domain([0, laneLength])
				.range([0, miniHeight]);

		var chart = d3.select(this.selector)
					.append("svg")
					.attr("width", w + m[1] + m[3])
					.attr("height", h + m[0] + m[2])
					.attr("class", "chart");

        // Add the x Axis
        chart.append("g")
            .attr("transform", "translate("+ m[3]+"," + h + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

		chart.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", w)
			.attr("height", mainHeight);

		var main = chart.append("g")
					.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
					.attr("width", w)
					.attr("height", mainHeight)
					.attr("class", "main");

		var mini = chart.append("g")
					.attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
					.attr("width", w)
					.attr("height", miniHeight)
					.attr("class", "mini");

		//main lanes and texts
		main.append("g").selectAll(".laneLines")
			.data(items)
			.enter().append("line")
			.attr("x1", m[1])
			.attr("y1", function(d) {return y1(d.lane);})
			.attr("x2", w)
			.attr("y2", function(d) {return y1(d.lane);})
			.attr("stroke", "lightgray");

		main.append("g").selectAll(".laneText")
			.data(lanes)
			.enter().append("text")
			.text(function(d) {return d;})
			.attr("x", -m[1])
			.attr("y", function(d, i) {return y1(i + .5);})
			.attr("dy", ".5ex")
			.attr("text-anchor", "end")
			.attr("class", "laneText");

		//mini lanes and texts
		mini.append("g").selectAll(".laneLines")
			.data(items)
			.enter().append("line")
			.attr("x1", m[1])
			.attr("y1", function(d) {return y2(d.lane);})
			.attr("x2", w)
			.attr("y2", function(d) {return y2(d.lane);})
			.attr("stroke", "lightgray");

		/*mini.append("g").selectAll(".laneText")
			.data(lanes)
			.enter().append("text")
			.text(function(d) {return d;})
			.attr("x", -m[1])
			.attr("y", function(d, i) {return y2(i + .5);})
			.attr("dy", ".5ex")
			.attr("text-anchor", "end")
			.attr("class", "laneText");*/

		var itemRects = main.append("g")
							.attr("clip-path", "url(#clip)");

		//mini item rects
		mini.append("g").selectAll("miniItems")
			.data(items)
			.enter().append("rect")
			.attr("class", function(d) {return "miniItem" + d.lane;})
			.attr("x", function(d) {return x(d.start);})
			.attr("y", function(d) {return y2(d.lane + .5) - 5;})
			.attr("width", function(d) {
                console.log(x(d.end) - x(d.start), d.start, d.end);
                return x(d.end) - x(d.start);
			})
			.attr("height", 10);

		//mini labels
		/*mini.append("g").selectAll(".miniLabels")
			.data(items)
			.enter().append("text")
			.text(function(d) {return d.id;})
			.attr("x", function(d) {return x(d.start);})
			.attr("y", function(d) {return y2(d.lane + .5);})
			.attr("dy", ".5ex");*/

		const display = function() {
			let rects;
			let labels;
            let minExtent = brush.extent()()[0];
            let maxExtent = brush.extent()()[1];
            let visItems = items.filter(function(d) {return d.start < maxExtent[0] && d.end > minExtent[0];});

            console.log(minExtent, maxExtent, visItems)
			mini.select(".brush")
				.call(brush.extent([minExtent, maxExtent]));

			x1.domain([minExtent[0], maxExtent[0]]);

			//update main item rects
			rects = itemRects.selectAll("rect")
                .data(visItems, function(d) { return d.id; })
				.attr("x", function(d) {return x(d.start);})
				.attr("width", function(d) {return x(d.end) - x(d.start);});

			rects.enter().append("rect")
				.attr("class", function(d) {return "miniItem" + d.lane;})
				.attr("x", function(d) {return x(d.start);})
				.attr("y", function(d) {return y1(d.lane) + 10;})
				.attr("width", function(d) {return x(d.end) - x(d.start);})
				.attr("height", function(d) {return .8 * y1(1);});

			rects.exit().remove();

			//update the item labels
			labels = itemRects.selectAll("text")
				.data(visItems, function (d) { return d.id; })
				.attr("x", function(d) {return x(Math.max(d.start, minExtent[0]) + 2);});

			labels.enter().append("text")
				.text(function(d) {return d.id;})
				.attr("x", function(d) {

				        return x(Math.max(d.start, minExtent[0])) + 5;
				})
				.attr("y", function(d, i) {return y1(d.lane + .5)})
				.attr("text-anchor", "start");

			labels.exit().remove();

		};

		//brush
		let brush = d3.brushX()
							.extent([[0, 0], [w, miniHeight]])
							.on("brush", display);

		mini.append("g")
			.attr("class", "x brush")
			.call(brush)
			.selectAll("rect")
			.attr("y", 1)
			.attr("height", miniHeight - 1);

		display();



    };

    D3SwimLane.prototype.create = function (data) {
        var self = this;
        if (typeof (data) === "string") {
            d3.json(data, function (e, data) {
                if (e)
                    throw e;
                if (data) {
                    return self._createLanes(data);
                }
            });
        }
        else {
            return self._createLanes(data);
        }
    };
    D3SwimLane.prototype.update = function () {
    };
    D3SwimLane.prototype.reset = function () {
    };
    D3SwimLane.prototype.show = function () {
    };
    D3SwimLane.prototype.hide = function () {
    };
    D3SwimLane.prototype.toggle = function () {
        $(this.selector).slideToggle();
    };
    D3SwimLane.prototype.search = function () {
    };
    return D3SwimLane;
}());
