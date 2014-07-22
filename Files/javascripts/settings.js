$(function() {
    initVars();
    setup();
    $("button#mute-mic").click(function() { mute({ mic: "toggle" }); });
    $("button#mute-speakers").click(function() { mute({ speakers: "toggle" }); });
    window.setInterval(function() {
        $("button#mute-mic + span").text(JSON.stringify(vars.clientInfo.isInputMuted));
        $("button#mute-speakers + span").text(JSON.stringify(vars.clientInfo.isOutputMuted));
    }, 500);
});
