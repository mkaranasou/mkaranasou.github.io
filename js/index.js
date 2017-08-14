"use strict";
var introTyped;

var createForce = function () {
    var d3Force = new D3Force('#about-me', 1000, 800);
    d3Force.create('./data/d3data.json');
};

var startTyping = function () {
    var aboutMe = new Typed('#about-me', {
        strings: data.sections["about-me"],
        typeSpeed: 10,
        onComplete: createForce
    });
};
var welcomeClose = function () {
    introTyped.stop();
    $(".typed-cursor").hide();
    $('.fixed-welcome').fadeOut(1200, function () {
        createForce();

    });
};

/* Main */
(function () {

    introTyped = new Typed('.intro', {
        strings: data.sections["intro"],
        typeSpeed: 40,
        onComplete: welcomeClose
    });
})();