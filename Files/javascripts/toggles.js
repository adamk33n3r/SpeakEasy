$(function() {
    setup({move: true, close: true, minimize: true, svg: true});
    $("button#mute-mic").click(function() { mute({ mic: "toggle" }); });
    $("button#mute-speakers").click(function() {mute({ speakers: "toggle" }); });
    window.setInterval(function() {
        if (getUserClient().isInputMuted)
            $("#mute-mic").removeClass("green").addClass("red");
        else
            $("#mute-mic").removeClass("red").addClass("green");
        if (getUserClient().isOutputMuted)
            $("#mute-speakers").removeClass("green").addClass("red");
        else
            $("#mute-speakers").removeClass("red").addClass("green");
    }, 500);
});
