var down = null;
$(function() {
    initVars();
    setup(false, {move: true, close: true, minimize: true, svg: true});
    $("button#mute-mic").click(function() { mute({ mic: "toggle" }); });
    $("button#mute-speakers").mousedown(function(e) { down = e.target });
    $("button#mute-speakers").mouseup(function(e) { if (e.target === down) mute({ speakers: "toggle" }); down = null; });
    window.setInterval(function() {
        if (vars.clientInfo.isInputMuted)
            $("#mute-mic").removeClass("green").addClass("red");
        else
            $("#mute-mic").removeClass("red").addClass("green");
        if (vars.clientInfo.isOutputMuted)
            $("#mute-speakers").removeClass("green").addClass("red");
        else
            $("#mute-speakers").removeClass("red").addClass("green");
    }, 500);
});
