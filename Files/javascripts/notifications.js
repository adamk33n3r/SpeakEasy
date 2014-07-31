
function createClient(data) {
    var client = document.createElement("div");
    client.id = data.clientId;
    client.innerHTML = data.clientName;
    client.style.display = "none";
    $("#container").append(client);
    return $(client);
}

function handle_talking(data) {
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
    setup();
    plugin().addEventListener("onTalkStatusChanged", handle_talking);
});
