DEBUG = true;

function debug() {
    if (DEBUG)
        console.log.apply(console, arguments);
}

var vars = {
    server: null,
    channels: null,
    clients: {},
    current_window: null,
};

function getUserClient() {
    return storager.get("clients")[storager.get("server").myClientId];
}

function getPlugin() {
    return document.getElementById('ts_plugin');
}



function updateClientInfo(info) {
    console.log("UPDATING CLIENT");
    var clients = storager.get("clients");
    clients[info.clientId] = info;
    storager.set("clients", clients);
}


function switchChannel(channel) {
    debug(storager.get("server"));
    storager.addToQueue("main", "switch_channel", channel);
}

function addChannels() {
    var channels = $("ul#channels");
    debug(storager.get("channels"));
    debug("found " + storager.get("channels").length + " channels");
    //for (var i = 0; i < storager.get("channels").length; i++) {
    //    channel = storager.get("channels")[i];
    if (storager.get("channels").length > 0)
        channels.children("li").remove();
    for (channel_idx in storager.get("channels")) {
        var channel = storager.get("channels")[channel_idx];
        debug(channel);
        var li = $("<li class='channel' data-channelid='" + channel.channelId + "'>");
        li.text(channel.channelName);
        channels.append(li);
    }
}

function onCurrentWindow(callback) {
    overwolf.windows.getCurrentWindow(function (result) {
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
    var mic = options.mic === "toggle" ? !storager.get("clients")[storager.get("server").myClientId].isInputMuted : options.mic;
    var speakers = options.speakers === "toggle" ? !getUserClient().isOutputMuted : options.speakers;
    var params = {serverId: storager.get("server").serverId};
    if (mic !== undefined)
        params.muteMicrophone = mic;
    if (speakers !== undefined)
        params.muteSpeakers = speakers;
    debug(params);
    debug(getUserClient());
    storager.addToQueue("main", "toggle", params);
}

function toggleAway() {
}

function drag() {
    $("body").animate({opacity: .8}, 100);
    onCurrentWindow(overwolf.windows.dragMove);
}

function done_dragging() {
    $("body").animate({opacity: 1},100);
}

function runTeamSpeak() {
    overwolf.extensions.launch("lafgmhfbkjljkgoggomibmhlpijaofafbdhpjgif");
}

function setup(window_ctrls) {
    overwolf.windows.getCurrentWindow(function (result) {
        storager.setLocal("current_window", result.window);
    });
    addWindowCtrls(window_ctrls);
    $("#title").append($('<button class="icon reload" onclick="location.reload()">'));
}


/**
 * Windows
 */

function openWindow(window_name, callback) {
    overwolf.windows.obtainDeclaredWindow(window_name, function (result) {
        debug("opening window '" + window_name + "'");
        if (result.status === "success") {
            overwolf.windows.restore(result.window.id);
            if (callback)
                callback.apply(null, arguments.slice(2));
        } else
            debug("error opening window '" + window_name + "'");
    });
}

function closeWindow(window_name, callback) {
    overwolf.windows.obtainDeclaredWindow(window_name, function (result) {
        debug("closing window '" + window_name + "'");
        if (result.status === "success") {
            overwolf.windows.close(result.window.id);
            if (callback)
                callback.apply(null, arguments.slice(2));
        } else
            debug("error closing window '" + window_name + "'");
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
    //storager.set("control-anim-"+storager.get("current_window").id, window.setTimeout(hideControls, 100));
    else {
        //window.clearTimeout(storager.get("control-anim"));
        showControls();
    }
}


function addWindowCtrls(window_ctrl_ops) {
    if (!window_ctrl_ops) return;
    var window_ctrls = $("<div id='window-controls' style='display: none;'>");
    var close = $("<button id='close-window'>");
    var minimize = $("<button id='minimize-window'>");
    var move = $("<button id='move-window' class='icon move'>");
    var svg = "<svg>\
            <path d='M24,0 L24,60 C24,80 2,55 3,110 L0,110 L0,0 L19,0 A5,5 0 0,1 24,5' style='stroke: none; fill:#33333a;'></path>\
            <path d='M0,1 L19,1 A5,5 0 0,1 24,5 L24,55 C24,80 2,55 3,110' style='stroke: #222229; fill: none; stroke-width: 3px;'></path>\
            <path stroke-dasharray='1,1' d='M3,1 L3,115' style='stroke: #222229; stroke-width: 1px'></path>\
        </svg>";
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
    $("#move-window").mouseup(done_dragging);
    $("#close-window").click(function (e) {
        onCurrentWindow(overwolf.windows.close);
    });
    $("#minimize-window").click(function (e) {
        onCurrentWindow(overwolf.windows.minimize);
    });
}
var timeout_ids = {};
$(function () {
    storager.init({
        app_name: "speak_easy",
        global: [
            { name: "server", value: null },
            { name: "channels", value: null },
            { name: "clients", value: {} },
            { name: "talking", value: [] }
        ],
        local: [
            { name: "current_window", value: null },
            { name: "clients", value: {} }
        ]
    });
    //$(document.body).mousedown(drag);
    $("#header").mousedown(drag);
    $("#header").mouseup(done_dragging);
    $(document.body).mousemove(windowControlVisibility);
//    $("button").mousedown(function(e) { e.stopPropagation() });
    var buttons = $(".button");
    buttons.mouseenter(function (e) {
        timeout_ids[e.target.id] = window.setTimeout(function () {
            $(e.target).children(".tooltip").slideDown(200)
        }, 500);
    });
    buttons.mouseleave(function (e) {
        window.clearTimeout(timeout_ids[e.target.id]);
        delete timeout_ids[e.target.id];
        $(e.target).children(".tooltip").slideUp(200);
    });
    $(".tooltip").mouseleave(function (e) {
        $(e.target).slideUp(200);
    });
//    $(document.body).on("mousedown", ".channel", function(e) { e.stopPropagation() });
});
