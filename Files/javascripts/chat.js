var channels = {
    Server: {},
    Channel: {},
    current: "Server"
};

function getCurrent() {
    return channels[channels.current]
}

var $messages;

function createMessage(message) {
    var message_div = $("<div>").addClass("message");
    message_div.append($("<span class='time'>").text("(" + message[0] + ") "));
    message_div.append($("<span class='who'>").text(message[1] + ": "));
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
    if (channels.current === target) scrollBottom();
    else $("#" + target).addClass("unread");
}

function parseMessages() {
    var formatted_messages = [];
    var messages = getCurrent().messages;

    console.log(messages);
    messages.forEach(function (message) {
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


function switchTo(channel) {
    channels.current = channel;
    switchToCurrent();
}

function switchToCurrent() {
    var channel = $("#" + channels.current);
    channel.click();
    channel.removeClass("unread");
}

function newTab(name, switchTo) {
    if (name === parseInt(name)) {
        var client = storager.get("clients")[name];
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


function handle_new_message_queue(e) {
    console.log("new val!");
    if (e.key === "newMessageQueue") {
        var new_arr = JSON.parse(e.newValue);
        checkNewTabQueue(new_arr);
    }
}

$(function () {
    setup({move: true, close: true, minimize: true, svg: true});
    $messages = $("#messages");
    var server = [
        [getTime(), "Server", "Chat"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
        ["10:13pm", "ADMIN", "This is a TEST"],
    ];
    var channel = [
        [getTime(), "Channel", "Chat"],
    ];
    channels.Server = {messages: server};
    channels.Channel = {messages: channel};

    // Switch Channel
    var body = $("body");
    body.on("click", ".tab", function () {
        channels.current = this.id;
        $("#messages").html(parseMessages());
        $("#" + channels.current).removeClass("unread");
        scrollBottom();
        $("#textbox").focus();
    });
    // Show Current Channel
    switchToCurrent();

    // Close button
    body.on("click", ".tab > .icon", function (e) {
        var name = $(this).parent().attr("id");
        delete channels[name];
        channels.current = "Server";
        switchToCurrent();
        $("#" + name).remove();
        console.log(channels);
        return false;
    });

    // Send Message
    $("#textbox").keypress(function (e) {
        if (e.which === 13) {
            $this = $(this);
            var val = $this.val();
            //var new_data = [getTime(),"name", val];
            //$messages.append(createMessage(new_data));
            //channels[channels.current].push(new_data);
            var type, targetId;
            switch (channels.current) {
                // Fall-through on purpose
                case "Channel":
                    targetId = storager.get("server").channelId;
                case "Server":
                    type = channels.current;
                    break;
                default:
                    type = "Client";
                    targetId = getCurrent().id;
                    break;
            }
            var params = {serverId: storager.get("server").serverId, type: type, message: val, targetId: targetId};
            console.log(params);

            storager.addToQueue("main", "send_msg", params);

//            tsplugin.sendTextMessage(params, function (result) {
//                console.log(result);
//            });
            scrollBottom();
            $this.val("");
        }
    });

    // New Tab
    $("#new_tab_button").click(function () {
        openWindow("client_list");
    });


//    window.addEventListener("storage", handle_new_message_queue, false);
    storager.listenToQueue("chat", handle_queue);
    checkNewTabQueue();
    checkNewMsgQueue();
    checkSwitchTabQueue();
});

function handle_new_tab(id) {
    console.log("new message for " + id);
    if (!(id in channels))
        newTab(parseInt(id), true);
    else
        switchTo(id);
}

function checkNewTabQueue() {
    var queue = storager.getQueue("chat", "new_tab");
    queue.forEach(function (id) {
        handle_new_tab(id);
        storager.dequeue("chat", "new_tab");
    });
}

function checkNewMsgQueue() {
    var queue = storager.getQueue("chat", "new_msg");
    queue.forEach(function (data) {
        on_message_received(data);
        storager.dequeue("chat", "new_msg");
    });
}

function checkSwitchTabQueue() {
    var queue = storager.getQueue("chat", "switch_tab");
    queue.forEach(function (data) {
        switchTo(data);
        storager.dequeue("chat", "switch_tab");
    });
}

function handle_queue(e) {
    var data = e.detail.data;
    $.each(data, function (method) {
        switch (method) {
            case "new_tab":
                var id = storager.dequeue("chat", method);
                handle_new_tab(id);
                break;
            case "new_msg":
                var msg_data = storager.dequeue("chat", method);
                on_message_received(msg_data);
                break;
            case "switch_tab":
                var tab_id = storager.dequeue("chat", method);
                switchTo(tab_id);
        }
    });
}

function on_message_received(data) {
    console.log(data);
    switch (data.target) {
        case "Client":
            if (data.fromClientId != storager.get("server").myClientId || data.fromClientId === data.toClientId) {
                var name = data.fromClientName;
                var id = data.fromClientId;
                if (!channels[id]) {
                    console.log("channels doesnt exist");
                    newTab(parseInt(id));
                }
                newMessage(data.message, data.fromClientId, data.fromClientName);
            } else {
                newMessage(data.message, data.toClientId, data.toClientName);
            }
            break;
        case "Server":
        case "Channel":
            newMessage(data.message, data.target, data.fromClientName);
            break;
    }
}