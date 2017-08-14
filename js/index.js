"use strict";
var introTyped;
var introShown;
var times = 0;

var createForce = function () {
    var d3Force = new D3Force('#experience-chart', parseInt($('.container-fluid').css('width')), 900);
    d3Force.create('./data/d3data.json');
};

var startTyping = function () {
    if(!introShown){
        $('#about-me').empty();

    for(let i=0; i < data.sections["about-me"].length; i++) {
        $('#about-me').append("<p id='about-me" + i + "'></p>");

        var aboutMe = new Typed('#about-me' + i, {
            strings: [data.sections["about-me"][i]],
            typeSpeed: 20,
        });
        $(".typed-cursor").hide();
    }
    }
    else{
        for(let i=0; i < data.sections["about-me"].length; i++) {
            $('#about-me').append("<p id='about-me" + i + "'>"+data.sections["about-me"][i]+"</p>");
        }
    }

};
var welcomeClose = function () {
    introTyped? introTyped.stop() : null;
    localStorage.setItem("intro", true)
    localStorage.setItem("times", times+1)
    $(".typed-cursor").hide();
    $('.fixed-welcome').fadeOut(1200, function () {
        startTyping();
        createForce();

    });
};

/* Main */
(function () {

    introShown = localStorage.getItem("intro");
    times = localStorage.getItem("times");
    if(introShown && times < 2){
        welcomeClose();
    }
    else{
        times = 0;
        introTyped = new Typed('.intro', {
            strings: data.sections["intro"],
            typeSpeed: 40,
            onComplete: welcomeClose
        });
    }

})();