var HOSTNAME = "http://127.0.0.1:5000";

var current_frame = 1;
var L_R = 1;
var pins_remaining = 10;
var current_total = 0;

function test_api(){
    $.get(HOSTNAME + "/test", function(data){
        console.log(data);
    });
}

function knock_pins(num_pins){
    pins_remaining -= num_pins;
}

function update_pins(){
    $.each($(".pin_button"), function(){
        var pin = ($(this).attr("data-num"));
        if (pin > pins_remaining) {
            $(this).addClass("hidden");
        }
    });
}

function reset_pins(){
    pins_remaining = 10;
    $.each($(".pin_button"), function(){
        $(this).removeClass("hidden");
    });
}


function compute_score(){
    var roll1 = $("#frame_" + current_frame + "_1").text();
    var roll2 = $("#frame_" + current_frame + "_2").text();
    $.get(
        HOSTNAME + "/calc_score",
        {
            roll1: roll1,
            roll2: roll2,
            current_total: current_total
        },
        function(data){
            $("#frame_" + current_frame + "_total").text(data);
            current_total = parseInt(data, 10);
            current_frame++;
            L_R = 1;
        }
    );
}

$(document).ready(function(){
    $("#pin_0").click(function(){
        test_api();
    });


    $(".pin_button").click(function(){
        var num_pins = ($(this).text());
        $("#frame_" + current_frame + "_" + L_R).text(num_pins);
        if (L_R == 1){
            knock_pins(num_pins);
            update_pins();
            L_R++
        } else if (current_frame == 10 && L_R == 2){
            L_R++;
        } else {
            knock_pins(num_pins);
            compute_score();
            reset_pins();
        }

    });

});





