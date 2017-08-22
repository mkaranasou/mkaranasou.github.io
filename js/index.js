"use strict";
var introTyped;
var introShown;
var times = 0;

var createForce = function () {
    var d3Force = new D3Force('#experience-chart', parseInt($('.container-fluid').css('width')) - 50, 900);
    d3Force.create('./data/d3data.json');
};

var createTimeline = function () {
    d3.json("./data/education.json", function (e, data) {

        /*    var data = [
          { name: "http requests", data: [new Date('2014/09/15 13:24:54'), new Date('2014/09/15 13:25:03'), new Date('2014/09/15 13:25:05')] },
          { name: "SQL queries", data: [new Date('2014/09/15 13:24:57'), new Date('2014/09/15 13:25:04'), new Date('2014/09/15 13:25:04')] },
          { name: "cache invalidations", data: [new Date('2014/09/15 13:25:12')] }
        ];*/
        if (e) throw e;

        for(let i=0; i < data["education"].length; i++){
            for(let j=0; j < data["education"][i]["data"].length;j++){
                data["education"][i]["data"][j] = new Date(data["education"][i]["data"][j]);
            }

        }
        var eventDropsChart = d3.chart.eventDrops()
            .start(new Date("2000-01-01"))
            .end(new Date(Date.now()))
            .mouseover(function (d) {
                console.log(d);
            });

        d3.select('#education')
            .datum(data["education"])
            .call(eventDropsChart);

    });

};

var startTyping = function () {
    if (times) {
        $('#about-me').empty();

        for (let i = 0; i < data.sections["about-me"].length; i++) {
            $('#about-me').append("<p id='about-me" + i + "'></p>");

            var aboutMe = new Typed('#about-me' + i, {
                strings: [data.sections["about-me"][i]],
                typeSpeed: 20,
            });
            $(".typed-cursor").hide();
        }
    }
    else {
        for (let i = 0; i < data.sections["about-me"].length; i++) {
            $('#about-me').append("<p id='about-me" + i + "'>" + data.sections["about-me"][i] + "</p>");
        }
    }

};
var welcomeClose = function () {
    introTyped ? introTyped.stop() : null;
    localStorage.setItem("times", times + 1);
    createForce();
    createTimeline();
    $(".typed-cursor").hide();
    $('.fixed-welcome').fadeOut(1200, function () {
        startTyping();

    });
};

/* Main */
(function () {

    times = localStorage.getItem("times");
    if (times && times < 2) {
        welcomeClose();
    }
    else {
        // source: https://jmperezperez.com/medium-image-progressive-loading-placeholder/
        let placeholder = document.querySelector('.placeholder');
        let small = placeholder.querySelector('.calm');
        // 1: load small image and show it
        let img = new Image();
        img.src = small.src;
        img.onload = function () {
            small.classList.add('loaded');
        };

        // 2: load large image
        let imgLarge = new Image();
        imgLarge.src = placeholder.dataset.large;
        imgLarge.onload = function () {
            imgLarge.classList.add('loaded');
            times = 0;
            introTyped = new Typed('.intro', {
                strings: data.sections["intro"],
                typeSpeed: 40,
                onComplete: welcomeClose
            });
        };
        placeholder.appendChild(imgLarge);
        placeholder.removeChild(small);
        imgLarge.className = "calm loaded profile-img lg";


    }

})();