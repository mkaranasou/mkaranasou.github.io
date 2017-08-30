"use strict";

let D3Force = (function () {

    function D3Force(selector, width, height) {
        this.selector = selector;
        this.data = {};
        this.filteredData = {};
        this.linkedByIndex = {};
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

    D3Force.prototype._getLinkedByIndex = function (links) {
        var self = this;
        links.forEach(function(d) {
            self.linkedByIndex[d.source.name + "," + d.target.name] = 1;
        });
        return this.linkedByIndex;
    }

    D3Force.prototype._isConnected = function(a, b) {
        return this.linkedByIndex[a.name + "," + b.name] || this.linkedByIndex[b.name + "," + a.name]; // || a.name == b.name;
    }

    D3Force.prototype._createForce = function (data) {
        let self = this;

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

        let color = d3.scaleOrdinal(d3.schemeCategory20);
        let fitText = function (text, r) {
            return text.substr(0, 10);
            /* return text.length < r * 2
                         ? text
                         : text.substr(0, r-3) + "...";*/
        };
        let fillColor = function (value) {
            switch (value) {
                case "Employer":
                    return "#EE6E73"; // LYNCH
                default:
                    return "#4DB6AC"
            }
        };

        let fillTextColor = function (value) {
            return "white";

            switch (value) {
                case "Person":
                    return "rgb(249, 105, 14)"; // ECSTASY
                case "Employer":
                    return "rgb(25, 181, 254)"; // DODGER BLUE
                case "Position":
                    return "rgb(191, 85, 236)"; // MEDIUM PURPLE
                case "Language":
                    return "rgb(3, 201, 169)"; // CARIBBEAN GREEN
                case "Framework":
                case "DB":
                    return "rgb(34, 167, 240)"; // PICTON BLUE
                case "Skill":
                    return "rgb(210, 77, 87)"; //  CHESTNUT ROSE
                case "Project":
                    return "rgb(246, 71, 71)"; // SUNSET ORANGE
                default:
                    return "white";
            }
        };
        let radius = function (value) {
            switch (value) {
                case "Person":
                    return 60;
                case "Employer":
                    return 55;
                case "Position":
                    return 50;
                case "Language":
                    return 45;
                case "Framework":
                case "DB":
                    return 40;
                case "Skill":
                    return 35;
                case "Project":
                    return 30;
                default:
                    return 30;
            }
        };

        let h3 = function (v) {
            return "<h3>" + v + "</h3>";
        };
        let p = function (v) {
            return "<p>" + v + "</p>";
        };
        let a = function (v) {
            return "<a href='" + v + "'>" + v + "</a>";
        };
        let img = function (v) {
            return "<img src='" + v + "'>";
        };
        let getInfo = function (d) {
            switch (d.type) {
                case "Person":
                    return h3(d.name) + p(d.details) + p(img(d.url));
                case "Employer":
                    return h3(d.name) + p(d.details) + a(d.url) + p(img(d.img));
                case "Position":
                    return h3(d.name) + p(d.details);
                case "Language":
                    return h3(d.name) + p(d.details) + (d.img ? p(img(d.img)) : "");
                case "Framework":
                case "DB":
                    return h3(d.name) + p(d.details) + (d.img ? p(img(d.img)) : "");
                case "Skill":
                    return h3(d.name) + p(d.details);
                case "Technology":
                    return h3(d.name) + p(d.details);
                case "Project":
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

        let link = this.svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke-width", function (d) {
                return "8px";
                return Math.sqrt(d.source);
            });

        let node = this.svg.append("g")
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

        let texts = this.svg.append("g")
            .attr("class", "texts")
            .selectAll("text")
            .data(data.nodes)
            .enter()
            .append("text")
            .attr("opacity", function (d) {
                return (d.img === undefined || d.img === "")? 1 : 0;
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
        let images = this.svg.append("g")
            .attr("class", "image")
            .selectAll("image")
            .data(data.nodes)
            .enter()
            .append("svg:image")
            .attr("opacity", function (d) {
                return (d.img === undefined || d.img === "")? 0 : 1;
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

        let drag_handler = d3.drag()
            .on("start", drag_start)
            .on("drag", drag_drag)
            .on("end", drag_end);
        //same as using .call on the node variable as in https://bl.ocks.org/mbostock/4062045
        drag_handler(node);
        drag_handler(images);

        self._getLinkedByIndex(data.links);

        let aspect = this.width / this.height;

        d3.select(window)
            .on("resize", function () {
                // let targetWidth = self.svg.node().getBoundingClientRect().width;
                // emtpy element
                // d3.select(self.selector).html('');
                // initialize w, h
                self.width = window.innerWidth - 50;
                // self.height = window.innerWidth / aspect;
                // redraw
                self.create(data);
            });


        self.search("#search", ".fa-search");

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
                    let cannotFit = d.name.length > 5;
                    return d.x + (cannotFit?(-radius(d.type) + 12):0);
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
        let self = this;
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

    D3Force.prototype._searchForce = function (value) {
        if (value.length === 0) {
            this.create(this.data);
        }
        else {
            var self = this;

            this.filteredData.nodes = this.data.nodes.filter(function (o) {
                return o.name.toLowerCase().indexOf(value) > -1;
            }).slice(0);
            var extra = [];

            this.data.nodes.forEach(function(d){
                self.filteredData.nodes.forEach(function(o){
                    if(self._isConnected(d, o)){
                        extra.push(d);
                    }
                })
            });

            this.filteredData.nodes = this.filteredData.nodes.concat(extra);
            this.filteredData.links = this.data.links.filter(function (o) {
                return self.filteredData.nodes.indexOf(o.source) > -1 && self.filteredData.nodes.indexOf(o.target) > -1;
            }).slice(0);

            this.create(this.filteredData);
        }
    }
    D3Force.prototype.search = function (selector, icon) {
        let self = this;
        let search = d3.select(selector).on("keydown", function (d) {
            if (d3.event.key === "Enter") {
                self._searchForce(d3.select(selector).node().value.toLowerCase())
            }
        });

        d3.select(icon).on("click", function (d) {
            self._searchForce(d3.select(selector).node().value.toLowerCase());
        })


    };
    return D3Force;
}());

let D3Timeline = (function () {
    function D3Timeline(selector) {
        this.selector = selector;
    }

    D3Timeline.prototype.create = function (data) {
        let self = this;
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

let D3SwimLane = (function () {
    function D3SwimLane(selector, width, height) {
        this.selector = selector;
        this.data = {};
        this.filteredData = {};
        this.width = width;
        this.height = height;
        this.svg = null;
    }

    D3SwimLane.prototype._createLanes = function (data) {
        let self = this;
        let lanes = [];
        let lanesToItems = {};
        let itemsToGroups = {};
        let lanesToNames = {};
        let items = [];
        let timeBegin = 2009; // min start
        let timeEnd = 2017;   // min end
        let toolTip = d3.tip()
            .attr("class", "d3-tip-lane")
            .offset([-8, 0])
            .html(function (d) {
                return d;
            });

        function sortBy(data, key) {
            for (let i = 1; i < data.length; i++) {
                if (data[i - 1][key] > data[i][key]) {
                    let a = data[i];
                    data[i] = data[i - 1];
                    data[i - 1] = a;
                }
            }

            return data;
        }

        function overlap(data, fromKey, toKey) {
            for (let i = 0; i < data.length; i++) {
                data[i]["overlaps"] = 0;
                itemsToGroups[data[i]["id"]] = [];
                for (let j = 0; j < data.length; j++) {
                    if (j === i) {
                         if(itemsToGroups[data[i]["id"]].length > 0 &&
                            itemsToGroups[data[i]["id"]].indexOf(data[i]["id"]) === -1){
                            // itemsToGroups[data[i]["id"]].splice(0, 0, data[i]["id"])
                            itemsToGroups[data[i]["id"]].push(data[i]["id"]);
                        }
                        continue;
                    }
                    /*
                    * |\\\\that1\\\\\//////this///////  that1 is after this
                    * |                              \\\\\that2\\\\\\\\\ after this
                    * |_________________________________________________
                    * */

                    let notOverlap = ((data[i][fromKey] < data[j][fromKey])
                                        && (data[i][toKey] <= data[j][fromKey])) ||
                                    ((data[i][fromKey] >= data[j][toKey])
                                        && (data[i][toKey] > data[j][toKey]));

                    // let index = itemsToGroups[data[i]["id"]].indexOf(data[j]["id"]);

                    if (notOverlap) {
                        // if (i > j) continue;
                        // if (index > -1) {
                        //     itemsToGroups[data[i]["id"]].splice(data[j]["id"], index);
                        // }

                    } else {

                        data[i]["overlaps"] += 1;
                        // if (i <= j) {
                            // if(index === -1){
                                itemsToGroups[data[i]["id"]].push(data[j]["id"]);
                            // }
                        // }
                        // else { // i > j we're looking at previous data
                        //     itemsToGroups[data[i]["id"]] = itemsToGroups[data[j]["id"]];
                        // }
                    }
                }


                itemsToGroups[data[i]["id"]] = Array.from(new Set(itemsToGroups[data[i]["id"]]));
            }
            return data;
        }

        data = sortBy(data, "from");

        for (let i = 0; i < data.length; i++) {
            let isPerson = data[i]["type"] === "Person";
            if (isPerson) continue;
            if (lanes.indexOf(data[i]["type"]) === -1) {
                lanes.push(data[i]["type"]);
                lanesToItems[lanes.length - 1] = [];
                lanesToNames[lanes.length - 1] = [];
            }
            let e = {
                "lane": lanes.indexOf(data[i]["type"]),
                "id": data[i]["name"],
                "start": data[i]["from"],
                "end": data[i]["to"]
            };
            if (e.start < timeBegin) timeBegin = e.start;
            if (e.end > timeEnd) timeEnd = e.end;
            lanesToItems[lanes.indexOf(data[i]["type"])].push(e);
            lanesToNames[lanes.indexOf(data[i]["type"])].push(e.id);
            items.push(e);

        }

        let laneLength = lanes.length;


        Object.keys(lanesToItems).forEach(function (key) {
            lanesToItems[key] = overlap(lanesToItems[key], "start", "end");
        });

        let m = [20, 15, 15, 120], //top right bottom left //todo: dictionary
            w = this.width - m[1] - m[3] - 40,
            h = this.height,
            miniHeight = laneLength * 12 + 50,
            mainHeight = h - miniHeight - 40;

        //scales
        let x = d3.scaleLinear()
            .domain([timeBegin, timeEnd])
            .range([0, w]);
        let x1 = d3.scaleLinear()
            .domain([timeBegin, timeEnd])
            .range([0, w]);
        let y1 = d3.scaleLinear()
            .domain([0, laneLength])
            .range([0, h]);
            // .range([0, mainHeight]);
        let y2 = d3.scaleLinear()
            .domain([0, laneLength])
            .range([0, miniHeight]);

        d3.select(this.selector).select("svg").remove();
        let chart = d3.select(this.selector)
            .append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .attr("class", "chart");

        chart.call(toolTip);
        // filters go in defs element
        let defs = chart.append("defs");

        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        let filter = chart.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "120%")
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur")
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");
        let feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
                .attr("in", "offsetBlur");
        feMerge.append("feMergeNode")
                .attr("in", "SourceGraphic");

        // Add the x Axis
        chart.append("g")
            .attr("transform", "translate(" + m[3] + "," + h + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

        chart.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", w)
            .attr("height", mainHeight);

        let main = chart.append("g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
            .attr("width", w)
            .attr("height", mainHeight)
            .attr("class", "main");

        let mini = chart.append("g")
            .attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
            .attr("width", w)
            .attr("height", miniHeight)
            .attr("class", "mini");


        //main lanes and texts
        main.append("g")
            .selectAll(".laneLines")
            .data(items)
            .enter().append("line")
            .attr("x1", 0)
            .attr("y1", function (d) {
                return y1(d.lane);
            })
            .attr("x2", w)
            .attr("y2", function (d) {
                return y1(d.lane);
            })
            .attr("stroke", "lightgray");

        main.append("g")
            .selectAll(".laneText")
            .data(lanes)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", -m[1])
            .attr("y", function (d, i) {
                return y1(i + .5);
            })
            .attr("dy", ".5ex")
            .attr("text-anchor", "end")
            .attr("class", "laneText");

       /* //mini lanes and texts
        mini.append("g").selectAll(".laneLines")
            .data(items)
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("y1", function (d) {
                return y2(d.lane);
            })
            .attr("x2", w)
            .attr("y2", function (d) {
                return y2(d.lane);
            })
            .attr("stroke", "lightgray");*/

        /*mini.append("g").selectAll(".laneText")
            .data(lanes)
            .enter().append("text")
            .text(function(d) {return d;})
            .attr("x", -m[1])
            .attr("y", function(d, i) {return y2(i + .5);})
            .attr("dy", ".5ex")
            .attr("text-anchor", "end")
            .attr("class", "laneText");*/

        let itemRects = main.append("g")
            .attr("clip-path", "url(#clip)");

        /*//mini item rects
        mini.append("g").selectAll("miniItems")
            .data(items)
            .enter().append("rect")
            .attr("class", function (d) {
                return "miniItem" + d.lane;
            })
            .attr("x", function (d) {
                return x(d.start);
            })
            .attr("y", function (d) {
                return y2(d.lane + .5) - 5;
            })
            .attr("width", function (d) {
                return x(d.end) - x(d.start);
            })
            .attr("height", 10);
*/
        //mini labels
        /*mini.append("g").selectAll(".miniLabels")
            .data(items)
            .enter().append("text")
            .text(function(d) {return d.id;})
            .attr("x", function(d) {return x(d.start);})
            .attr("y", function(d) {return y2(d.lane + .5);})
            .attr("dy", ".5ex");*/

        const display = function () {
            let rects;
            let labels;
            // let d0 = d3.event? d3.event.selection.map(x.invert): brush.extent()();
            let minExtent = brush.extent()()[0];
            let maxExtent = brush.extent()()[1];
            let visItems = items.filter(function (d) {
                return x(d.start) <= maxExtent[0] && x(d.end) >= minExtent[0];
            });

           /* mini.select(".brush")
                .call(brush.extent([minExtent, maxExtent]));
*/
            x1.domain([minExtent, maxExtent]);
            let basicHeight = .8 * y1(1);

            //update main item rects
            rects = itemRects.selectAll("rect")
                .data(visItems, function (d) {
                    return d.id;
                })
                .attr("x", function (d) {
                    return x(d.start);
                })
                .attr("width", function (d) {
                    return x(d.end) - x(d.start) - 5;
                });

            rects.enter().append("rect")
                .attr("class", function (d) {
                    return "miniItem" + d.lane;
                })
                .attr("x", function (d) {
                    return x(d.start);
                })
                .attr("y", function (d, i) {
                    let initial = y1(d.lane) + 5;
                    d.overlaps = itemsToGroups[d.id].length;
                    d.index = d.index || itemsToGroups[d.id].indexOf(d.id);
                    d.height = d.height || basicHeight * (d.overlaps ? 1 / d.overlaps : 1); // divide basic height by the num of items in the overlapping list


                    /*console.log("--------------------------------------------------|");
                    console.log("Block", d.id)
                    console.log("Block Height", d.height)
                    console.log("Block Overlaps", d.overlaps, itemsToGroups[d.id], d.index)*/
                    if(d.index <0) {
                        d.index = 0;
                    }
                    // either return intitial y
                    // or add to initial (d.height / d.index) * d.overlaps
                    // y = initialY else initialY + (height/num of items overlapping) * index of current item
                    // return initial + (d.overlaps ? (d.height * lanesToNames[d.lane].indexOf(d.id)): 0);

                    d.y_ = initial + (d.overlaps ? (d.height * d.index): 0);
                    return d.y_;
                })
                .attr("width", function (d) {
                    d.width = Math.abs(x(d.end) - x(d.start) - 2);
                    return d.width;
                })
                .attr("height", function (d, i) {
                    d.index = itemsToGroups[d.id].indexOf(d.id);
                    d.overlaps = itemsToGroups[d.id].length; //lanesToItems[d.lane][d.index].overlaps;
                    if(d.index <0) {
                        d.index = 0;
                    }
                    // height = initialHeight Or initialHeight / num of items overlapping
                    d.height = basicHeight * (d.overlaps ? (1 / itemsToGroups[d.id].length) : 1);
                    // d.height = basicHeight/ lanesToItems[d.lane].length;
                    return d.height;
                })
                .attr("data-overlaps", function (d) {
                    return d.overlaps;
                })
                .on("mouseover", function (d) {
                    d3.select(this).attr("filter", "url(#drop-shadow)");
                    toolTip.show(d.id);
                })
                .on("mouseout", function (d) {
                    d3.select(this).attr("filter", "");
                    toolTip.hide();
                });

            rects.exit().remove();

            //update the item labels
            labels = itemRects.selectAll("text")
                .data(visItems, function (d) {
                    return d.id;
                })
                .attr("x", function (d) {
                    return x(Math.max(d.start, minExtent[0]) + 2);
                });

            labels.enter().append("text")
                .text(function (d) {
                    let s = d3.select("body").selectAll("span").data([d]).append("text").text(d.id);
                    let l = s.node().getBoundingClientRect().width;
                    s.remove();
                    let ratio = Math.ceil(d.width/l)
                    // console.warn(l, d.width, ratio, d.id.length);
                    if(l >= d.width){
                        return d.height < 8? "": d.id.substr(0, ratio * d.id.length);
                    }
                    return d.height < 9? "": d.id.substr(0, (ratio > 1? d.length: d.length/ratio));
                })
                .attr("x", function (d) {
                    return x(Math.max(d.start, minExtent[0])) + 5;
                })
                .attr("y", function (d, i) {
                    return d.y_ + (d.height/1.5);
                    return y1(d.lane + .2) + (d.overlaps ? itemsToGroups[d.id].indexOf(d.id) * d.height : 0);
                })
                .attr("text-anchor", "start")
                .attr("class", "lane-text")
                .style("font-size",function (d) {
                    return d.height < 100? "xx-small":"medium";
                })
                .on("mouseover", function (d) {
                    toolTip.show(d.id);
                })
                .on("mouseout", function (d) {
                    toolTip.hide();
                });

            labels.exit().remove();

        };

        function brushended() {
            if(!d3.event) return;
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            display();
             /* var d0 = d3.event.selection.map(x.invert),
                  d1 = d0.map(d3.timeDay.round);

              console.log(d0, d1);

              // If empty when rounded, use floor & ceil instead.
              if (d1[0] >= d1[1]) {
                d1[0] = d3.timeDay.floor(d0[0]);
                d1[1] = d3.timeDay.offset(d1[0]);
              }

              d3.select(this).transition().call(d3.event.target.move, d1.map(x));*/
        }
        //brush
        let brush = d3.brushX()
            .extent([[0, 0], [w, miniHeight]]);
            // .on("end", brushended);

        mini.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", 1)
            .attr("height", miniHeight - 1);

        display();

        d3.select(window)
            .on("resize", function () {
                // let targetWidth = self.svg.node().getBoundingClientRect().width;
                // emtpy element
                // d3.select(self.selector).html('');
                // initialize w, h
                self.width = window.innerWidth - 50;
                // self.height = window.innerWidth / aspect;
                // redraw
                self.create(data);
            });

    };

    D3SwimLane.prototype.create = function (data, key) {
        let self = this;
        key = key || null;
        if (typeof (data) === "string") {
            d3.json(data, function (e, data) {
                if (e)
                    throw e;
                if (data) {
                    if(key) data = data[key]
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
