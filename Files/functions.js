vars = {
    server: null,
    channels: null,
    clientInfo: null,
};

/**
 * Variables
 */
function update_vars(e) {
    console.log("updateing vars");
    if (!e) e = window.event;
    console.log(e.url + " changed " + e.key + " from " + e.oldValue + " to " + e.newValue);
    vars[e.key] = e.newValue;
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
        console.log(variable, vars[variable]);
        setVar(variable, vars[variable]);
    }
}


function getPlugin() {
    return document.getElementById('ts_plugin');
}

plugin = getPlugin;

function updateClientInfo() {
    plugin().getClientInfo({serverId: parseInt(vars.server.serverId)}, function(result, info) {
        if (result.success) {
            setVar("clientInfo", info);
            stat_vals = [info.isInputMuted, info.isTalking, info.isAway];
            stats = $("#stats").eq(0).children("li");
            for (var i = 0; i < stats.length; i++) {
                stat = stats.eq(i);
                stat.children("span").eq(0).text(stat_vals[i]);
                //console.log(info);
            }
        }
    });
}


function switchChannel(channel) {
    console.log(vars.server)
    plugin().switchChannel({serverId: vars.server.serverId, channelId:channel, clientId: vars.server.myClientId}, function(result) {
        console.log(result);
        //alert("Switched to channel?");
    });
}

function addChannels() {
    var channels = $("ul#channels");
    console.log(vars.channels);
    console.log("found "+vars.channels.length+" channels");
    //for (var i = 0; i < vars.channels.length; i++) {
    //    channel = vars.channels[i];
    for (channel_idx in vars.channels) {
        var channel = vars.channels[channel_idx];
        console.log(channel);
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

function mute(mic, speakers) {
    onCurrentWindow(function(windowId) { overwolf.windows.changeSize(windowId, 200, 400, debug) });
    return;
    mic = typeof mic !== 'undefined' ? mic : true;
    speakers = typeof speakers !== 'undefined' ? speakers : true;
    plugin().updateClientDeviceState({serverId: vars.server.serverId, muteMicrophone: mic, muteSpeakers: speakers}, function(result) {
        console.log(result);
    });
}


function drag() {
    onCurrentWindow(overwolf.windows.dragMove);
}

function runTeamSpeak(){
    onCurrentWindow(function(windowId) { overwolf.windows.changeSize(windowId, 13, 33, debug) });
    return;
    overwolf.extensions.launch("lafgmhfbkjljkgoggomibmhlpijaofafbdhpjgif");
}

function setup() {
    window.addEventListener("storage", update_vars, false);
    window.localStorage.setItem("server", null);
    window.localStorage.setItem("channels", null);
    window.localStorage.setItem("clientInfo", null);
}




/**
 * Open Windows
 */

function openWindow(window_name) {
    overwolf.windows.obtainDeclaredWindow(window_name, function(result) {
        if (result.status === "success")
            overwolf.windows.restore(result.window.id);
    });
}

$(function() {
    $("body").mousedown(drag);
    $("button#channels").click(function() { openWindow("channels"); });
});
