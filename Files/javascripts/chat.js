var channels = {
    Server: {},
    Channel: {},
    current: "Server",
}

function getCurrent() {
    return channels[channels.current]
}

var $messages;

function createMessage(message) {
    var message_div = $("<div>").addClass("message");
    message_div.append($("<span class='time'>").text("("+message[0]+") "));
    message_div.append($("<span class='who'>").text(message[1]+": "));
    message_div.append($("<span class='msg'>").text(message[2]));
    return message_div;
}

function newMessage(message, target, from) {
    var new_data = [getTime(), from, message];
    console.log("new message from " + from);
    if (target === channels.current) {
        console.log("I AMMM HEEEERRRREEEEE");
        $messages.append(createMessage(new_data));
    }
    channels[target].messages.push(new_data);
    scrollBottom();
}

function parseMessages() {
    var formatted_messages = [];
    var messages = getCurrent().messages;
    
    console.log(messages);
    messages.forEach(function(message) {
        formatted_messages.push(createMessage(message));
    });
    return formatted_messages;
}

function getTime() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes();
    var hrs = hours % 12
    return  ((hrs === 0) ? 12 : hrs) + ":" + minutes + ((hours < 13) ? "am" : "pm");
}

function scrollBottom() {
    $messages.scrollTop($messages.prop('scrollHeight'));
}

$(function() {
    initVars();
    setup(false, {move: true, close: true, minimize: true, svg: true});
    $messages = $("#messages");
    var server = [
        [getTime(), "Server", "Chat"],
        ];
    var channel = [
        [getTime(), "Channel", "Chat"],
        ];
    channels.Server = {messages: server};
    channels.Channel = {messages: channel};

    // Switch Channel
    $("body").on("click", ".tab", function() {
        channels.current = this.id;
        $("#messages").html(parseMessages());
        scrollBottom();
        $("#textbox").focus();
    });
    // Show Current Channel
    switchToCurrent();

    // Close button
    $("body").on("click", ".tab > .icon", function(e) {
        var name = $(this).parent().attr("id");
        delete channels[name];
        channels.current = "Server";
        switchToCurrent();
        $("#"+name).remove();
        console.log(channels);
        return false;
    });

    // Send Message
    scrollBottom();
    $("#textbox").keypress(function(e) {
        if (e.which === 13) {
            $this = $(this);
            var val = $this.val();
            //var new_data = [getTime(),"name", val];
            //$messages.append(createMessage(new_data));
            //channels[channels.current].push(new_data);
            switch (channels.current) {
                case "Channel":
                    var targetId = vars.server.channelId;
                case "Server":
                    var type = channels.current;
                    break;
                default:
                    var type = "Client";
                    var targetId = getCurrent().id;
                    break;
            }
            var data = {serverId: vars.server.serverId, type: type, message: val, targetId: targetId}
            console.log(data);
            plugin().sendTextMessage(data, function(result) {
                console.log(result);
            });
            scrollBottom();
            $this.val("");
        }
    });

    // New Tab
    $("#new_tab_button").click(function() {
        openWindow("clients");
    });


    plugin().addEventListener("onTextMessageReceived", function(data) {
        console.log(data);
        switch (data.target) {
            case "Client":
                if (data.fromClientId != vars.server.myClientId) {
                    var name = data.fromClientName;
                    var id = data.fromClientId;
                    if (!channels[id]) {
                        console.log("channels doesnt exist");
                        newTab(id);
                    }
                    newMessage(data.message, data.fromClientId, data.fromClientName);
                } else {
                    newMessage(data.message, data.toClientId, data.toClientName);
                } break;
            case "Server":
            case "Channel":
                newMessage(data.message, data.target, data.fromClientName);
                break;
        }
    });
    window.addEventListener("storage", handle_new_message_queue, false);

    checkNewMessagesQueue(getVar("newMessageQueue"));
});

function switchTo(channel) {
    channels.current = channel;
    switchToCurrent();
}

function switchToCurrent() {
    $("#"+channels.current).click();
}

function newTab(name, switchTo) {
    if (name === parseInt(name)) {
        var client = vars.clients[name];
        console.log("creating new tab for " + client.nickname);
        channels[name] = {id: name, messages: []};
        $("#tabs").append($("<div id='" + name + "'>").addClass("tab").append($("<span>").addClass("name").text(client.nickname)).append($("<span>").addClass("icon cross2")));
        if (switchTo) {
            channels["current"] = name;
            switchToCurrent();
        }
        return;
    }
    //if (channels[name]) return;
    channels[name] = {id: 0, messages: []}; //Might need this id to be correctly set later.
    console.log("make new tab");
    $("#tabs").append($("<div id='" + name + "'>").addClass("tab").append($("<span>").addClass("name").text(name)).append($("<span>").addClass("icon cross2")));
    if (switchTo) {
        channels["current"] = name;
        switchToCurrent();
    }
}



function checkNewMessagesQueue(queue) {
    queue.forEach(function(id) {
        console.log("new message for " + id);
        if (!(id in channels))
            newTab(parseInt(id), true);
        else
            switchTo(id);
    });
    setVar("newMessageQueue", []);
}



function handle_new_message_queue(e) {
    console.log("new val!");
    if (e.key === "newMessageQueue") {
        var new_arr = JSON.parse(e.newValue);
        checkNewMessagesQueue(new_arr);
    }
}

