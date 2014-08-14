
function createClient(data) {
    var client = document.createElement("div");
    client.id = data.clientId;
    client.innerHTML = data.clientName + "<span class='icon speaker2'></span>";
    client.style.display = "none";
    client.className = "client";
    $("#container").prepend(client);
    return $(client);
}

function handle_talking(data) {
    console.log(data);
    if (data.state === "Talk") {
        var old_client = $("div#"+data.clientId)
        if (old_client.length > 0)
            old_client.finish();
        var client = createClient(data);
        client.slideDown();
    } else {
        var client = $("div#"+data.clientId);
        client.finish();
        client.slideUp(400, function() {client.remove()});
    }
}


$(function() {
    initVars();
    setup(false, {move: true, close: true, minimize: true, svg: true});
    plugin().addEventListener("onTalkStatusChanged", handle_talking);
});
