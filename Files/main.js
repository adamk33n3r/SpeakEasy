var refresh_id;
function pluginLoaded() {
    plugin().addEventListener("onServerStatusChange", function(data) {
        debug("onServerStatusChange: ",data);
    });

    setTimeout(function() {

        plugin().init({name: "SpeakEasy"}, function(result,servers) {
            debug("result: ",result ,servers);

            if (!result.success) {
                debug("Error loading plugin", result);
                alert("Error loading ts plugin");
                return;
            }

            // no server is connected
            if (servers && !servers.activeServerId)  {
                /*plugin().connectToServer( { tab :"currentTab", 
                    label:"VBox Server", 
                    address :"webserver", 
                    nickName:"Keener" },
                    function(result,server) {
                        debug("start new connection: ",result , server)
                    });
                plugin().switchChannel({channelId:"2"}, function(result, channels) {
                    alert("Switched to channel?");
                });*/
                //refresh_id = window.setInterval(setupServer, 500);
            } else { // connected to server
                plugin().getServerInfo(servers.activeServerId, function(result, server){
                    if (result.success)
                        setupServer(server);
                    else {
                        debug("Error acquiring server information!");
                        debug(result);
                    }
                });
            }
        });

    }, 500);
}




$(function() {
    setup(true);
    addListeners();
    $("button.control[data-window]").click(function() {
        openWindow($(this).data("window"));
    });
});
