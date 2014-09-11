function setupGradients() {
    $("#sides").css("height", ul.outerHeight());
    $("#more-down").css("margin-top", parseInt(ul.css("max-height")) - 10);
}

function addClients() {
//    storager.delete("clients");
    var $clients = $("#clients");
    $clients.children("li").remove();
    $.each(storager.get("clients"), function(id, client) {
        console.log(id,client);
        var li = $("<li>").addClass("client").attr("id", client.clientId)
            .append($("<span>").text(client.nickname))
            .append($("<span>").text("Send Msg").addClass("send-msg"));
        $clients.append(li);
    });
}

$(function() {
    setup({move: true, close: true, minimize: true, svg: true});
    
    addClients();
    // Click to send message
    $("body").on("click", ".send-msg", function(e) {
        // Add to queue
        storager.addToQueue("chat", "new_tab", this.parentNode.id);
        openWindow("chat");
    });
    ul = $("ul#clients");
    mores = $("[id^=more-]");
    mores.css("width", ul.outerWidth());
    if (ul.outerHeight() <= parseInt(ul.css("max-height")))
        mores.hide();
    setupGradients();
    $("#more-up").hide();
    ul.scroll(function() {
        ul = $("ul#channels").get(0);
        if (ul.scrollTop === 0) {
            $("#more-up").fadeOut(200);
            $("#more-down").fadeIn(200);
        } else if (ul.offsetHeight + ul.scrollTop >= ul.scrollHeight) {
            $("#more-down").fadeOut(200);
            $("#more-up").fadeIn(200);
        } else {
            $("#more-up").fadeIn(200);
            $("#more-down").fadeIn(200);
        }
    });
});
