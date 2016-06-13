var HOSTNAME = "http://127.0.0.1:5000";

var current_frame = 1;
var L_R = 1;
var current_total = 0;

function test_api(){
    $.get(HOSTNAME + "/test", function(data){
        console.log(data);
    });
}

function compute_score(){
    return
}

$(document).ready(function(){
    $("#pin_0").click(function(){
        test_api();
    });


    $(".pin_button").click(function(){
        var set_text = ($(this).text());
        $("#frame_" + current_frame + "_" + L_R).text(set_text);
        if (L_R == 1){
            L_R++
        } else if (current_frame == 10 && L_R == 2){
            L_R++;
        } else {
            L_R = 1;
            compute_score();
            current_frame++;
        }

    });

});





