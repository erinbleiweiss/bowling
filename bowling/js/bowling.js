var HOSTNAME = "http://127.0.0.1:5000";

var current_frame = 1;
var roll = 1;
var pins_remaining = 10;
var current_total = 0;

var score_types = {
    OPEN: "open",
    STRIKE: "strike",
    SPARE: "spare"
};
var score_type = score_types.OPEN;

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

    console.log(score_type);

    var url = "/calc_score";
    if (score_type == score_types.STRIKE){
        url = "/calc_score_strike"
    }

    $.get(
        HOSTNAME + url,
        {
            roll1: roll1,
            roll2: roll2,
            current_total: current_total
        },
        function(data){
            switch(score_type){
                case score_types.STRIKE:
                    current_total = parseInt(data["current"], 10);
                    var prev_total = parseInt(data["prev"], 10);
                    set_frame_total(current_frame-1, prev_total);
                    set_frame_total(current_frame, current_total);
                    break;
                case score_types.OPEN:
                    current_total = parseInt(data, 10);
                    set_frame_total(current_frame, current_total);
                    break;
            }
            current_frame++;
            roll = 1;
            reset_pins();
            score_type = score_types.OPEN;
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
        if (num_pins == 10 && roll == 1){
            score_type = score_types.STRIKE;
            set_pins_for_roll(current_frame, 1, "");
            set_pins_for_roll(current_frame, 2, "X");
            current_frame++;
            roll = 1;
        }
        // Roll is a spare
        else if (num_pins == pins_remaining && roll == 2){
            score_type = score_types.SPARE;
        }
        // Roll is an empty frame
        else {
            set_pins_for_roll(current_frame, roll, num_pins);
            if (roll == 1){
                update_pins();
                roll++
            } else {
                compute_score();
            }
        }
    });

});





