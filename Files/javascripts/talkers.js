
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

//    var data = e.detail.data.pop();
    console.log(data);
    if (data.state === "Talk") {
        var old_client = $("div#"+data.clientId);
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
    setup();
    storager.listenToQueue("talkers", function (e) {
        var data = e.detail.data;
        console.log(data);
        $.each(data, function (method) {
            switch (method) {
                case "changed":
                    var data = storager.dequeue("talkers", method);
                    handle_talking(data);
                    break;
                case "set_opaque":
                    var flag = storager.dequeue("talkers", method);
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
});
