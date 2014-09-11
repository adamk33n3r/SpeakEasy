$(function() {
    setup({move: true, close: true, minimize: true, svg: true});

    // Talkers
    setupSliders("talk", "talkers");
    setupSliders("notif", "notifications");
});

function setupSliders(name, window_name) {
    var talk_x = $("input#"+name+"-x");
    overwolf.windows.obtainDeclaredWindow(window_name, function(result) {
        if (result.status === "success") {
            talk_x.attr("max", screen.width - result.window.width);
            talk_x.val(result.window.left);
        }
    });
    talk_x.change(function(e) {
        overwolf.windows.obtainDeclaredWindow(window_name, function(result) {
            if (result.status === "success") {
                var talkers = result.window;
                overwolf.windows.changePosition(talkers.id, parseInt($(e.target).val()), talkers.top);
            }
        });
    });
    talk_x.mousedown(function() {
        storager.addToQueue(window_name, "set_opaque", true);
    });
    talk_x.mouseup(function() {
        storager.addToQueue(window_name, "set_opaque", false);
    });

    var talk_y = $("input#"+name+"-y");
    overwolf.windows.obtainDeclaredWindow(window_name, function(result) {
        if (result.status === "success") {
            talk_y.attr("max", screen.height);
            talk_y.val(result.window.top);
        }
    });
    talk_y.change(function(e) {
        overwolf.windows.obtainDeclaredWindow(window_name, function(result) {
            if (result.status === "success") {
                var talkers = result.window;
                overwolf.windows.changePosition(talkers.id, talkers.left, parseInt($(e.target).val()));
            }
        });
    });
    talk_y.mousedown(function() {
        storager.addToQueue(window_name, "set_opaque", true);
    });
    talk_y.mouseup(function() {
        storager.addToQueue(window_name, "set_opaque", false);
    });
}
