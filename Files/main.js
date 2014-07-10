function getPlugin() {
    return document.getElementById('ts_plugin');
}

plugin = getPlugin;

function addEvent(obj, name, func) {
    if (obj.attachEvent) {
        obj.attachEvent("on"+name, func);
    } else {
        obj.addEventListener(name, func, false); 
    }
}

debug = function(result) {
    console.log(result);
}



function pluginLoaded() {
    plugin().addEventListener("onServerStatusChange", function(data) {
        console.log("onServerStatusChang: ",data);
    });

    setTimeout(function() {

        plugin().init({name: "Adam's Overwolf Teamspeak App"}, function(result,servers) {
            //console.log("result: ",result ,servers);

            // no server is connected
            if (servers && !servers.activeServerId)  {
                plugin().connectToServer( { tab :"currentTab", 
                    label:"VBox Server", 
                    address :"webserver", 
                    nickName:"Keener" },
                    function(result,server) {
                        console.log("start new connection: ",result , server)
                    });
                plugin().switchChannel({channelId:"2"}, function(result, channels) {
                    alert("Switched to channel?");
                });
            } else { // connected to server
                plugin().getServerInfo(0, function(result, server){
                    if (result.success)
                        vars.server = server;
                    else
                        alert("Error acquiring server information!");
                    plugin().getChannels(vars.server.serverId, function(result, channels) {
                        console.log("Channels:", channels);
                        vars.channels = channels;
                        addChannels();
                    });
                    window.setInterval(updateClientInfo, 500);
                });
            }
        });

    }, 500);
}




$(function() {
    setup();
    $("button#close").click(function(e) {
        overwolf.windows.getCurrentWindow(function(result) {
            if (result.status === "success")
                overwolf.windows.close(result.window.id);
        });
    });
    $("button#channels").click(function(e) {
        overwolf.windows.obtainDeclaredWindow("channels", function(result) {
            if (result.status === "success")
                overwolf.windows.restore(result.window.id, function(result) {
                    console.log(result);
                });
        });
    });

    $("body").on("click", ".channel", function(e) {
        //alert("Clicked on it! "+ e.target.innerHTML);
        switchChannel(e.target.getAttribute("data-channelid"));
    });
})
