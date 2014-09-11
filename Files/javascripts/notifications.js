function createNotification(data) {
    var notif = document.createElement("div");
    notif.id = data.clientId;
    notif.innerHTML = data.title + " " + data.action;
    notif.style.display = "none";
    notif.style.cursor = "pointer";
    notif.className = "notification";
    $("#container").prepend(notif);
    var $notif = $(notif);
    $notif.slideDown();
    var t_id = window.setTimeout(function() {$notif.slideUp(400, function() {$notif.remove()})}, 3000);
    $notif.click(function () {
        $notif.slideUp(400, function () {
            $notif.remove()
        });
        if (data.click)
            data.click();
    });
    if (data.hover) {
        var overlay = $("<div>");
        overlay.addClass("hover-notif");
        overlay.append($("<span>").text(data.hover));
        $notif.append(overlay);

        $notif.hover(function () {
            window.clearTimeout(t_id);
            overlay.fadeIn();
        }, function () {
            t_id = window.setTimeout(function() {$notif.slideUp(400, function() {$notif.remove()})}, 3000);
            overlay.fadeOut();
        });
    }
    return $notif;
}

function handle_notification(data, state) {
    console.log(data);
    var clients;
    if (state === "entered") {
        clients = storager.getLocal("clients");
        clients[data.clientId] = data;
        storager.setLocal("clients", clients);
    }
    createNotification({
        clientId: data.clientId,
        title: data.clientName === "*UNKNOWN*" ? storager.getLocal("clients")[data.clientId].clientName : data.clientName,
        action: state
    });
    if (state === "left" || state === "timed_out") {
        clients = storager.getLocal("clients");
        delete clients[data.clientId];
        storager.setLocal("clients", clients);
    }

}

$(function () {
    setup();
    storager.listenToQueue("notifications", function (e) {
        var data = e.detail.data;
        console.log(data);
        $.each(data, function (method) {
            switch (method) {
                case "entered":
                    var data = storager.dequeue("notifications", method);
                    handle_notification(data, method);
                    break;
                case "left":
                case "timed_out":
                    var data = storager.dequeue("notifications", method);
                    handle_notification(data, method);
                    break;
                case "set_opaque":
                    var flag = storager.dequeue("notifications", method);
                    console.log("opacity flag:", flag);
                    var loc = $("#loc");
                    if (flag) {
                        loc.finish();
                        loc.animate({opacity: 1}, 100);
                    } else
                        loc.animate({opacity: 0}, 1000);
                    break;
            }
        });
    });
    storager.listenToQueue("chat", function (e) {
        var data = e.detail.data;
        console.log("chat queue changed", e);
        if (data.new_msg && (e.detail.from === null || !e.detail.from.new_msg || e.detail.from.new_msg.length < data.new_msg.length)) {
            var msgs = data.new_msg;
            var msg = msgs[msgs.length - 1];
            console.log("NEW MSG!!!", msg);
            if (msg.fromClientId == getUserClient().clientId) return;
            var message;
            if (msg.message.length > 50)
                message = msg.message.substr(0, 50) + "...";
            else
                message = msg.message;
            var notif_data = {
                clientId: msg.fromClientId,
                title: msg.fromClientName,
                action: "says " + message,
                click: function () {
                    storager.addToQueue("chat", "switch_tab", msg.fromClientId);
                    openWindow("chat");
                },
                hover: "Click to open chat"
            };
            switch (msg.target) {
                case "Server":
                case "Channel":
                    notif_data.title = msg.target + ": " + notif_data.title;
                    break;
            }
            createNotification(notif_data);
        }
    });
});
