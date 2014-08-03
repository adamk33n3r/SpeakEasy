DEBUG=true

function debug() {
    if (DEBUG)
        console.log.apply(console, arguments);
}

vars = {
    server: null,
    channels: null,
    clients: {},
    current_window: null,
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
    vars.clients = getVar("clients");
}

function saveVars() {
    for (var variable in vars) {
        debug(variable, vars[variable]);
        setVar(variable, vars[variable]);
    }
}

function getUserClient() {
    return vars.clients[vars.server.myClientId];
}

function getPlugin() {
    return document.getElementById('ts_plugin');
}

plugin = getPlugin;

function updateClientInfo(info) {
    console.log("UPDATING CLIENT");
    var clients = getVar("clients");
    clients[info.clientId] = info;
    setVar("clients", clients);
}


function switchChannel(channel) {
    debug(vars.server)
    plugin().switchChannel({serverId: vars.server.serverId, channelId:channel, clientId: getUserClient()}, function(result) {
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
    if (vars.channels.length > 0)
        channels.children("li").remove();
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
    var mic = options.mic === "toggle" ? !vars.clients[vars.server.myClientId].isInputMuted : options.mic;
    var speakers = options.speakers === "toggle" ? !getUserClient().isOutputMuted : options.speakers;
    var params = {serverId: vars.server.serverId}
    if (mic !== undefined)
        params.muteMicrophone = mic;
    if (speakers !== undefined)
        params.muteSpeakers = speakers;
    debug(params);
    debug(getUserClient());
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

function setup(reset, window_ctrls) {
    overwolf.windows.getCurrentWindow(function(result){
        vars.current_window = result.window;
    });
    addWindowCtrls(window_ctrls);
    window.addEventListener("storage", update_vars, false);
    if (reset) {
        window.localStorage.setItem("server", null);
        window.localStorage.setItem("channels", null);
        window.localStorage.setItem("clients", null);
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

function setupServer(server) {
    setVar("server", server);
    $("button.button").removeClass("hidden");
    plugin().getChannels(vars.server.serverId, function(result, channels) {
        debug("Channels:", channels);
        setVar("channels", channels);
        saveVars();
        openWindow("notifications");
    });
    plugin().getClientInfo({serverId: vars.server.serverId}, function(result, data) {
        if (result.success)
            updateClientInfo(data);
        else
            console.log("Couldn't get client info");
    });
    $("#no-server").hide();
    $("#container").removeClass("no-server");
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
            $("button.button").addClass("hidden");
            $("#no-server").show();
            closeWindow("channels");
            closeWindow("toggles");
            closeWindow("chat");
        }
        if(obj.error)
            debug("Error Code:", obj.errorCode, "-", error);
    });
}

function addChannel() {
    $('#channels').append($('<li>').text('channel').addClass("channel"));
    ul = $("ul#channels");
    $("#sides").css("height", ul.outerHeight());
    if (ul.outerHeight() - 10 >= parseInt(ul.css("max-height"))) {
        $("#more-down").show();
        //$("#more-down").css("margin-top", ul.outerHeight() - 25);
    }
}

function showControls() {
    ctrls = $("#window-controls");
    //if (!ctrls.is(":hidden"))
    //ctrls.hide();
    ctrls.fadeIn(200);
}

function hideControls() {
    ctrls = $("#window-controls");
    //if (!ctrls.is(":hidden"))
    //ctrls.hide();
    ctrls.finish();
    ctrls.fadeOut(200);
}

function windowControlVisibility(e) {
    if (e.pageX === 0 && e.pageY === 0)
        hideControls();
        //setVar("control-anim-"+vars.current_window.id, window.setTimeout(hideControls, 100));
    else {

        //window.clearTimeout(getVar("control-anim"));
        showControls();
    }
}


function addWindowCtrls(window_ctrl_ops) {
        var window_ctrls = $("<div id='window-controls' style='display: none;'>");
        var close = $("<button id='close-window'>");
        var minimize = $("<button id='minimize-window'>");
        var move = $("<button id='move-window' class='icon move'>");
        var svg = "<svg>\
            <path d='M24,0 L24,60 C24,80 2,55 3,110 L0,110 L0,0 L19,0 A5,5 0 0,1 24,5' style='stroke: none; fill:#222;' />\
            <path d='M0,1 L19,1 A5,5 0 0,1 24,5 L24,55 C24,80 2,55 3,110' style='stroke: #111; fill: none; stroke-width: 3px;' />\
            <path stroke-dasharray='1,1' d='M3,1 L3,115' style='stroke: #111; stroke-width: 1px'/>\
        </svg>"
        if (window_ctrl_ops.close)
            window_ctrls.append(close);
        if (window_ctrl_ops.minimize)
            window_ctrls.append(minimize);
        if (window_ctrl_ops.move)
            window_ctrls.append(move);
        if (window_ctrl_ops.svg)
            window_ctrls.append(svg);
        $(document.body).prepend(window_ctrls);
        $("#move-window").mousedown(drag);
        $("#close-window").click(function(e) {
            onCurrentWindow(overwolf.windows.close);
        });
        $("#minimize-window").click(function(e) {
            onCurrentWindow(overwolf.windows.minimize);
        });
}

$(function() {
    //$(document.body).mousedown(drag);
    $("#header").mousedown(drag);
    $(document.body).mousemove(windowControlVisibility);
    $("button").mousedown(function(e) { e.stopPropagation() });
    $(".button").mouseover(function(e) {$(e.target).children(".tooltip").addClass("shown-inline")});
    $(".button").mouseout(function(e) {$(e.target).children(".tooltip").removeClass("shown-inline")});
    $(document.body).on("mousedown", ".channel", function(e) { debug("hi");e.stopPropagation() });
});
