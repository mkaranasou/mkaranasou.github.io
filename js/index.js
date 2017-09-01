"use strict";
var introTyped;
var introShown;
var times = 0;
var swimLane;
var educationLane;
var d3Force;
var subject;
var body;

var createForce = function () {
    d3Force = new D3Force('#experience-chart', parseInt($('#steps').css('width')) - 50, 700);
    d3Force.create('./data/d3data.json');
};

var createTimeline = function () {
    educationLane = new D3SwimLane("#education-lane", parseInt($('#steps').css('width')) - 50, 350);
    educationLane.create("./data/education.json", "education");
};

var mailTo = function(){
    if(subject[0].value === "" || body[0].value === ""){
        // $.notify("Please, fill all neccessary fields!");
        return;
    }
    var completeSubj = "subject=" + subject[0].value;
    var completeBody = "&body=" + body[0].value;
    var recipient="karanasou";
    var at = String.fromCharCode(64);
    var dotcom="gmail.com?";
    var mail="mailto:";

    window.open(mail+recipient+at+dotcom + completeSubj + completeBody);
}

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

    subject = $("#subject");
    body = $("#body");
};

var welcomeClose = function () {
    introTyped ? introTyped.stop() : null;
    localStorage.setItem("times", times + 1);
    animateTo("#about");
    createForce();
    createTimeline();
    $(".typed-cursor").hide();
    $('.fixed-welcome').fadeOut(1200, function () {
        startTyping();

    });
};

var toggleLane = function(){
    if (!swimLane){
        swimLane = new D3SwimLane("#experience-timeseries",
                            parseInt($('#steps').css('width')) - 50,
                            900);
        swimLane.create(d3Force.data.nodes);
    }
    else{
        swimLane.toggle();
    }

    d3Force.toggle()
};

function animateTo(hash){
    // animate
    $('html, body').animate({
        scrollTop: $(hash).offset().top
    }, 300, function(){

        // when done, add hash to url
        // (default click behaviour)
        window.location.hash = hash;
    });
}

/* Main */
(function () {
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();
    $("nav ul li a[href^='#']").on('click', function(e) {

        // prevent default anchor click behavior
        e.preventDefault();

        // store hash
        var hash = this.hash;

        // animate
        animateTo(hash);

    });

    times = localStorage.getItem("times");
    if (times && times < 1) {
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
        imgLarge.className = "calm loaded img-fluid profile-img lg";


    }

})();