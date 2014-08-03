var channels = {
    Server: [],
    Channel: [],
    private1: [],
    private2: [],
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
    if (target === channels.current)
        $messages.append(createMessage(new_data));
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
    return hours % 12 + ":" + minutes + ((hours < 13) ? "am" : "pm");
}

function scrollBottom() {
    $messages.scrollTop($messages.prop('scrollHeight'));
}

$(function() {
    initVars();
    setup(false, {move: true, close: true, minimize: true, svg: true});
    $messages = $("#messages");
    var server = [
        ["9:10pm", "mod1", "hi alfred"],
        ["9:12pm", "mod2", "how are you doing?"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "ADMIN", "SYSTEM RESTART!"],
        ["9:13pm", "dsfa", "f"],
        ];
    var channel = [
        ["9:10am", "Adam", "hi Alex"],
        ["9:12am", "Alex", "how are you doing?"],
        ["12:13pm", "Adam", "SYSTEM RESTART!"],
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
                    var targetId = channels.current;
                    break;
            }
            plugin().sendTextMessage({serverId: vars.server.serverId, type: type, message: val, targetId: targetId},function(result) {
                console.log(result);
            });
            scrollBottom();
            $this.val("");
        }
    })


    plugin().addEventListener("onTextMessageReceived", function(data) {
        console.log(data);
        switch (data.target) {
            case "Client":
                if (data.fromClientId !== vars.server.myClientId) {
                    var name = data.fromClientName;
                    var id = data.fromClientId;
                    if (!channels[name]) {
                        console.log("channels doesnt exist");
                        newTab(name);
                        channels[name] = {id: id, messages: []};
                    }
                    newMessage(data.message, data.fromClientName, data.fromClientName);
                } break;
            case "Server":
            case "Channel":
                newMessage(data.message, data.target, data.fromClientName);
                break;
        }
    });
});

function switchToCurrent() {
    $("#"+channels.current).click();
}

function newTab(name, switchTo) {
    //if (channels[name]) return;
    console.log("make new tab");
    $("#tabs").append($("<div id='" + name + "'>").addClass("tab").append($("<span>").addClass("name").text(name)).append($("<span>").addClass("icon cross2")));
    if (switchTo) {
        channels["current"] = name;
        switchToCurrent();
    }
}
