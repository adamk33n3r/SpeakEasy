function pluginLoaded() {

}

$(function() {
    initVars();
    
    addChannels();
    $("body").on("click", ".channel", function(e) {
        //alert("Clicked on it! "+ e.target.innerHTML);
        switchChannel(e.target.getAttribute("data-channelid"));
    });
});
