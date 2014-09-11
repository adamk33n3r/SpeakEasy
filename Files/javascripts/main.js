var loaded = false;
var initialized = false;

function pluginLoaded() {
    loaded = true;
    init();
}

function init() {
    tsplugin.init({name: "SpeakEasy"}, function (result, servers) {
        debug("!!! result:", result, servers);

        if (!result.success) {
            debug("Error loading plugin", result);
            //alert("Error loading plugin");
            return;
        }

        // no server is connected
        if (servers && !servers.activeServerId) {
            /*tsplugin.connectToServer( { tab :"currentTab",
             label:"VBox Server",
             address :"webserver",
             nickName:"Keener" },
             function(result,server) {
             debug("start new connection: ",result , server)
             });
             tsplugin.switchChannel({channelId:"2"}, function(result, channels) {
             alert("Switched to channel?");
             });*/
            //refresh_id = window.setInterval(setupServer, 500);
        } else { // connected to server
            tsplugin.getServerInfo(servers.activeServerId, function (result, server) {
                console.log("!!!!!!! getting server info:",result,server);
                if (result.success) {
                    setupServer(server);
                } else {
                    debug("Error acquiring server information!");
                    debug(result);
                }
            });
        }
    });
}

function setupServer(server) {
    storager.set("server", server);
    tsplugin.getChannels(storager.get("server").serverId, function (result, channels) {
        debug("Channels:", channels);
        storager.set("channels", channels);
        openWindow("talkers");
        openWindow("notifications");
    });
    tsplugin.getClientInfo({serverId: storager.get("server").serverId}, function (result, data) {
        if (result.success)
            updateClientInfo(data);
        else
            console.log("Couldn't get client info");
    });
    tsplugin.getChannelClientList({serverId: storager.get("server").serverId, channelId: storager.get("server").channelId}, function (result, data) {
        if (result.success) {
            data.forEach(function (info) {
                console.log(info);
                updateClientInfo(info);
            });
        }
    });
    $("#no-server").hide();
    $("#container").removeClass("no-server");
    $("button.button").removeClass("hidden");
    //if (refresh_id !== undefined)
    //    window.clearInterval(refresh_id);
    //window.setInterval(updateClientInfo, 500);
}


/**
 * Listeners
 */
function addTSListeners() {
    tsplugin.addEventListener("onClientUpdated", updateClientInfo);
    tsplugin.addEventListener("onServerStatusChange", function (data) {
        debug(data.status);
        if (data.status === "CONNECTION_ESTABLISHED")
            setupServer(data.server);
        else if (data.status === "DISCONNECTED") {
            $("button.button").addClass("hidden");
            $("#no-server").show();
            $("#container").addClass("no-server");
            closeWindow("channels");
            closeWindow("toggles");
            closeWindow("chat");
            storager.reset(true);
        }
        if (data.error)
            debug("Error Code:", data.errorCode, "-", error);
    });
    tsplugin.addEventListener("onTalkStatusChanged", function (data) {
//        storager.push("talking", data);
        storager.addToQueue("talkers", "changed", data);
    });
    tsplugin.addEventListener("onTextMessageReceived", function (data) {
        storager.addToQueue("chat", "new_msg", data);
    });
}


function handle_talking(data) {
    console.log(data);
    if (data.state === "Talk") {
        var old_client = $("div#" + data.clientId)
        if (old_client.length > 0)
            old_client.finish();
        var client = createNotification(data);
        client.slideDown();
    } else {
        var client = $("div#" + data.clientId);
        client.finish();
        client.slideUp(400, function () {
            client.remove()
        });
    }
}

var down = null;
var tsplugin;
$(function () {
    tsplugin = getPlugin();
    window.addEventListener("data_initialized", function () {
        initialized = true;
        console.log("loaded", loaded);
        if (loaded)
            init();
    });
    console.log("listening....");
    setup({move: true, close: true, minimize: true, svg: true});
    addTSListeners();

    storager.listenToQueue("main", function (e) {
        var data = e.detail.data;
        $.each(data, function (method) {
//            console.log(data,"dfhaskdjfsd");
            switch (method) {
                case "toggle":
                    var params = storager.dequeue("main", method);
                    tsplugin.updateClientDeviceState(params, function (result) {
                        debug(result);
                    });
                    break;
                case "switch_channel":
                    var channel = storager.dequeue("main", method);
                    tsplugin.switchChannel({serverId: storager.get("server").serverId, channelId: channel, clientId: storager.get("server").myClientId}, function (result) {
                        debug(result);
                    });
                    break;
                case "send_msg":
                    params = storager.dequeue("main", method);
                    tsplugin.sendTextMessage(params, function (result) {
                        console.log(result);
                    });
                    break;
            }
        });
    });


    var window_btns = $("button[data-window]");
//    window_btns.mousedown(function(e) {
//        down = e.target;
//        return false;
//    });
//    window_btns.mouseup(function(e) {
//        if (e.target === down)
//            openWindow($(this).data("window"));
//        down = null;
//        return false;
//    });
    window_btns.click(function () {
        openWindow($(this).data("window"));
        return false;
    });
    tsplugin.addEventListener("onClientEvent", function (data) {
        console.log("CLIENT EVENT!!!");
        console.log(data);
        switch(data.type) {
            case "Move":
                if (data.channelId == 0) {
                    storager.addToQueue("notifications", "entered", data);
                    tsplugin.getClientInfo({serverId: data.serverId, clientId: data.clientId}, function (result, data) {
                        if (result.success)
                            updateClientInfo(data);
                        else
                            console.log("Couldn't get client info");
                    });
                } else if (data.newChannelId == 0) {
                    storager.addToQueue("notifications", "left", data);
                    var clients = storager.get("clients");
                    delete clients[data.clientId];
                    storager.set("clients", clients);
                }
                break;
            case "TimeOut":
                storager.addToQueue("notifications", "timed_out", data);
                var clients = storager.get("clients");
                delete clients[data.clientId];
                storager.set("clients", clients);
                break;
        }
    });
//    if (loaded)
//        init();
});
