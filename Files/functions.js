LANDSCAPE=[800, 33]
PORTRAIT=[200, 400]

DEBUG=true

function debug() {
    if (DEBUG)
        console.log.apply(console, arguments);
}

vars = {
    server: null,
    channels: null,
    clientInfo: null,
};

/**
 * Variables
 */
function update_vars(e) {
    debug("updating vars");
    if (!e) e = window.event;
    debug(e.url + " changed " + e.key + " from " + e.oldValue + " to " + e.newValue);
    vars[e.key] = JSON.parse(e.newValue);
}

function getVar(name) {
    return JSON.parse(window.localStorage.getItem(name));
}

function setVar(name, val) {
    vars[name] = val;
    window.localStorage.setItem(name, JSON.stringify(val));
}

function initVars() {
    vars.server = getVar("server");
    vars.channels = getVar("channels");
    vars.clientInfo = getVar("clientInfo");
}

function saveVars() {
    for (var variable in vars) {
        debug(variable, vars[variable]);
        setVar(variable, vars[variable]);
    }
}


function getPlugin() {
    return document.getElementById('ts_plugin');
}

plugin = getPlugin;

function updateClientInfo(info) {
    setVar("clientInfo", info);
}


function switchChannel(channel) {
    debug(vars.server)
    plugin().switchChannel({serverId: vars.server.serverId, channelId:channel, clientId: vars.server.myClientId}, function(result) {
        debug(result);
        //alert("Switched to channel?");
    });
}

function addChannels() {
    var channels = $("ul#channels");
    debug(vars.channels);
    debug("found "+vars.channels.length+" channels");
    //for (var i = 0; i < vars.channels.length; i++) {
    //    channel = vars.channels[i];
    for (channel_idx in vars.channels) {
        var channel = vars.channels[channel_idx];
        debug(channel);
        li = $("<li class='channel' data-channelid='" + channel.channelId + "'>");
        li.text(channel.channelName);
        channels.append(li);
    }
}

function onCurrentWindow(callback) {
    overwolf.windows.getCurrentWindow(function(result) {
        if (result.status === "success") {
            callback(result.window.id);
            return true;
        } else return false;
    });
}

function mute(options) {
    debug(options);
    if (options.mic === undefined && options.speakers === undefined)
        return False;
    var mic = options.mic === "toggle" ? !vars.clientInfo.isInputMuted : options.mic;
    var speakers = options.speakers === "toggle" ? !vars.clientInfo.isOutputMuted : options.speakers;
    var params = {serverId: vars.server.serverId}
    if (mic !== undefined)
        params.muteMicrophone = mic;
    if (speakers !== undefined)
        params.muteSpeakers = speakers;
    debug(params);
    debug(vars.clientInfo);
    plugin().updateClientDeviceState(params, function(result) {
        debug(result);
    });
}

function toggleAway() {
}

function drag() {
    onCurrentWindow(overwolf.windows.dragMove);
}

function runTeamSpeak(){
    overwolf.extensions.launch("lafgmhfbkjljkgoggomibmhlpijaofafbdhpjgif");
}

function setup(reset) {
    window.addEventListener("storage", update_vars, false);
    if (reset) {
        window.localStorage.setItem("server", null);
        window.localStorage.setItem("channels", null);
        window.localStorage.setItem("clientInfo", null);
    }
}




/**
 * Windows
 */

function openWindow(window_name) {
    overwolf.windows.obtainDeclaredWindow(window_name, function(result) {
        debug("opening window '" + window_name + "'");
        if (result.status === "success")
            overwolf.windows.restore(result.window.id);
        else
            debug("error opening window '" + window_name + "'");
    });
}

function closeWindow(window_name) {
    overwolf.windows.obtainDeclaredWindow(window_name, function(result) {
        debug("closing window '" + window_name + "'");
        if (result.status === "success")
            overwolf.windows.close(result.window.id);
        else
            debug("error closing window '" + window_name + "'");
    });
}

function changeLayout() {
    if (window.innerHeight === LANDSCAPE[1]) {
        onCurrentWindow(function(windowId) { overwolf.windows.changeSize(windowId, PORTRAIT[0], PORTRAIT[1]) });
        $(".container").toggleClass("landscape portrait");
        $("#modules ul").removeClass("inline");
    } else {
        onCurrentWindow(function(windowId) { overwolf.windows.changeSize(windowId, LANDSCAPE[0], LANDSCAPE[1]) });
        $(".container").toggleClass("portrait landscape");
        $("#modules ul").addClass("inline");
    }
}

function setupServer(server) {
    vars.server = server;
    $("button.control").removeClass("hidden");
    plugin().getChannels(vars.server.serverId, function(result, channels) {
        debug("Channels:", channels);
        vars.channels = channels;
        saveVars();
    });
    $("#no-server").hide();
    //if (refresh_id !== undefined)
    //    window.clearInterval(refresh_id);
    //window.setInterval(updateClientInfo, 500);
}

/**
 * Listeners
 */
function addListeners() {
    plugin().addEventListener("onClientUpdated", updateClientInfo);
    plugin().addEventListener("onServerStatusChange", function(obj) {
        debug(obj.status);
        if (obj.status === "CONNECTION_ESTABLISHED")
            setupServer(obj.server);
        else if (obj.status === "DISCONNECTED") {
            $("button.control").addClass("hidden");
            $("#no-server").show();
            closeWindow("channels");
        }
        if(obj.error)
            debug("Error Code:", obj.errorCode, "-", error);
    });
}

$(function() {
    $(document.body).mousedown(drag);
    $("button").mousedown(function(e) { e.stopPropagation() });
    $(".channel").mousedown(function(e) { debug("hi");e.stopPropagation() });
    $("button#close").click(function(e) {
        onCurrentWindow(overwolf.windows.close);
    });
    $("button#minimize").click(function(e) {
        onCurrentWindow(overwolf.windows.minimize);
    });
    $("button#layout").click(changeLayout);
    if (window.innerHeight === LANDSCAPE[1]) {
        $(".container").toggleClass("portrait landscape");
        $("#modules ul").addClass("inline");
        //$("#modules ul").removeClass("unstyled");
    }
});
