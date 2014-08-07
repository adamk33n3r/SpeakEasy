function setupGradients() {
    $("#sides").css("height", ul.outerHeight());
    $("#more-down").css("margin-top", parseInt(ul.css("max-height")) - 10);
}

function addClients() {
    var $clients = $("#clients");
    $clients.children("li").remove();
    $.each(vars.clients, function(id, client) {
        console.log(id,client);
        var li = $("<li>").addClass("client").attr("id", client.clientId).text(client.nickname);
        $clients.append(li);
    });
}

$(function() {
    initVars();
    setVar("newMessageQueue", []);
    setup(false, {move: true, close: true, minimize: true, svg: true});
    
    addClients();
    $("body").on("click", ".client", function(e) {
        //alert("Clicked on it! "+ e.target.innerHTML);
        var queue = getVar("newMessageQueue");
        console.log(queue);
        queue.push(this.id);
        openWindow("chat", function() {
            console.log("in CALLBACKKK");
            setVar("newMessageQueue", queue); 
        });
    });
    ul = $("ul#clients")
    mores = $("[id^=more-]")
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
