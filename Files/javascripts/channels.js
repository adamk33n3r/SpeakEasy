function setupGradients() {
    $("#sides").css("height", ul.outerHeight());
    $("#more-down").css("margin-top", parseInt(ul.css("max-height")) - 6);
}

$(function() {
    setup({move: true, close: true, minimize: true, svg: true});
    
    addChannels();
    $("body").on("click", ".channel", function(e) {
        //alert("Clicked on it! "+ e.target.innerHTML);
        switchChannel(e.target.getAttribute("data-channelid"));
    });
    ul = $("ul#channels")
    mores = $("[id^=more-]")
    mores.css("width", ul.outerWidth());
    if (ul.outerHeight() <= parseInt(ul.css("max-height")))
        mores.hide();
    setupGradients();
    $("#more-up").hide();
    ul.scroll(function() {
        ul = $("ul#channels").get(0);
        if (ul.scrollTop === 0) {
            $("#more-up").fadeOut(200);
            $("#more-down").fadeIn(200);
        } else if (ul.offsetHeight + ul.scrollTop >= ul.scrollHeight) {
            $("#more-down").fadeOut(200);
            $("#more-up").fadeIn(200);
        } else {
            $("#more-up").fadeIn(200);
            $("#more-down").fadeIn(200);
        }
    });
    for(var i=0;i<00;i++)
        addChannel();
});
