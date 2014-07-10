function updateClientInfo() {
    plugin().getClientInfo({serverId: parseInt(vars.server.serverId)}, function(result, info) {
        if (result.success) {
            vars.clientInfo = info;
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
    var channels = $("#channels");
    for (var i = 0; i < vars.channels.length; i++) {
        channel = vars.channels[i];
        li = $("<li class='channel' data-channelid='" + channel.channelId + "'>");
        li.text(channel.channelName);
        channels.append(li);
    }
}

function mute(mic, speakers) {
    mic = typeof mic !== 'undefined' ? mic : true;
    speakers = typeof speakers !== 'undefined' ? speakers : true;
    plugin().updateClientDeviceState({serverId: vars.server.serverId, muteMicrophone: mic, muteSpeakers: speakers}, function(result) {
        console.log(result);
    });
}


function runTeamSpeak(){
    overwolf.extensions.launch("lafgmhfbkjljkgoggomibmhlpijaofafbdhpjgif");
}

function update_vars(e) {
    console.log("updateing vars");
    if (!e) e = window.event;
    console.log(e.url + " changed " + e.oldValue + " to " + e.newValue);
}

vars = {
    server: null,
    channels: null,
    clientInfo: null,
};

function setup() {
    window.addEventListener("storage", update_vars, false);
    window.localStorage.setItem("server", null);
    window.localStorage.setItem("channels", null);
    window.localStorage.setItem("clientInfo", null);
}
