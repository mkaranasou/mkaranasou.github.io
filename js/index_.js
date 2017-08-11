var startTyping = function () {
    var aboutMe = new Typed('#about-me', {
        strings: data.sections["about-me"],
        typeSpeed: 10
    });
};


var welcomeClose = function (e) {
    $(".typed-cursor").hide();
    $('.fixed-welcome').fadeOut(1200, function () {
        startTyping();
        /*var welcomeTyped = new Typed('.welcome', {
            strings: data.sections["welcome"],
            typeSpeed: 30,
            onComplete: startTyping
        });*/
    });

};



/* Main */
(function(){

    var introTyped = new Typed('.intro', {
        strings: data.sections["intro"],
        typeSpeed: 40,
        onComplete: welcomeClose
    });

})();