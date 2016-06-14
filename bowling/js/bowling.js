var HOSTNAME = "http://127.0.0.1:5000";

var current_frame = 1;
var roll_num = 1;
var pins_remaining = 10;
var current_total = 0;

function test_api(){
    $.get(HOSTNAME + "/test", function(data){
        console.log(data);
    });
}


/**
 * Reduces possible number of pins to knock down by removing the
 * corresponding buttons from the input display.
 * Adds a "hidden" class to the appropriate buttons.
 */
function update_pins(){
    $.each($(".pin_button"), function(){
        var pin = ($(this).attr("data-num"));
        if (pin > pins_remaining) {
            $(this).addClass("hidden");
        }
    });
}

/**
 * Returns all input buttons to view by removing "hidden" class.
 */
function reset_pins(){
    pins_remaining = 10;
    $.each($(".pin_button"), function(){
        $(this).removeClass("hidden");
    });
}

/**
 * Updates the display to reflect the number of pins knocked down
 * for each roll
 * @param frame: Frame for current roll
 * @param roll:  Current roll number
 * @param val:   Number of pins knocked down
 */
function set_pins_for_roll(frame, roll, val){
    $("#frame_" + frame + "_" + roll).text(val);
    pins_remaining -= roll;
}

/**
 * Updates the display to reflect the score for the current frame
 * @param frame: Current frame number
 * @param val:   Score for frame
 */
function set_frame_total(frame, val){
    $("#frame_" + frame + "_total").text(val);
}


/**
 * Retrieves score for an open frame from the bowling API.
 * Upon completion, updates score display with response data,
 * then reset pin input buttons.
 */
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
            set_frame_total(current_frame, data);
            current_total = parseInt(data, 10);
            current_frame++;
            roll_num = 1;
            reset_pins();
        }
    );
}

$(document).ready(function(){
    /**
     * When input buttons are clicked, determine appropriate scoring
     * algorithm
     */
    $(".pin_button").click(function(){
        var num_pins = ($(this).text());

        // Roll is a strike
        if (num_pins == 10 && roll_num == 1){
            set_pins_for_roll(current_frame, 1, "");
            set_pins_for_roll(current_frame, 2, "X");
        }
        // Roll is a spare
        else if (num_pins == pins_remaining && roll_num == 2){

        }
        // Roll is an empty frame
        else {
            set_pins_for_roll(current_frame, roll_num, num_pins);
            if (roll_num == 1){
                update_pins();
                roll_num++
            } else {
                compute_score();
            }
        }
    });

});





