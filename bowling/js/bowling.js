var HOSTNAME = "http://127.0.0.1:5000";

var current_frame = 1;
var roll = 1;
var pins_remaining = 10;
var current_total = 0;

var score_type = {
    OPEN: "open",
    STRIKE: "strike",
    SPARE: "spare"
};
var last_frame_type = score_type.OPEN;


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
 * Reset roll to 1 and advance frame.
 */
function reset_pins(){
    pins_remaining = 10;
    roll = 1;
    current_frame++;
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
    if (val == 10) {
        $("#frame_" + frame + "_2").text("X");
    } else if (val == pins_remaining){
        $("#frame_" + frame + "_2").text("/");
    } else{
        $("#frame_" + frame + "_" + roll).text(val);
        pins_remaining -= val;
    }
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
function compute_score(type, frame){
    var url;
    var params;

    switch(type){
        case score_type.STRIKE:
            url = "/calc_score_strike";
            params = {
                roll1: $("#frame_" + (frame+1) + "_1").text(),
                roll2: $("#frame_" + (frame+1) + "_2").text(),
                current_total: current_total
            };
            break;
        case score_type.SPARE:
            url = "/calc_score_spare";
            params = {
                roll1: $("#frame_" + (frame+1) + "_1").text(),
                current_total: current_total
            };
            break;
        case score_type.OPEN:
            url = "/calc_score";
            params = {
                roll1: $("#frame_" + frame + "_1").text(),
                roll2: $("#frame_" + frame + "_2").text(),
                current_total: current_total
            };
            break;
    }

    $.get(
        HOSTNAME + url,
        params,
        function(data){
            current_total = data;
            set_frame_total(frame, data);
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
        // Update display
        console.log("frame " + current_frame + ", roll " + roll + ": " + num_pins);
        set_pins_for_roll(current_frame, roll, num_pins);

        switch(last_frame_type){
            case score_type.STRIKE:
                if (roll == 2){
                    // compute score for last frame, then compute this frame
                    console.log("computing strike");
                    compute_score(score_type.STRIKE, current_frame-1);
                }
                break;
            case score_type.SPARE:
                if (roll == 1) {
                    console.log("computing spare");
                    compute_score(score_type.SPARE, current_frame-1);
                    // compute score for last frame, then compute this frame
                }
                break;
        }

        // Determine frame type and compute if open
        if (num_pins == 10){
            last_frame_type = score_type.STRIKE;
            reset_pins();
        } else if (num_pins == pins_remaining) {
            last_frame_type = score_type.SPARE;
            reset_pins();
        } else if (roll == 1){
            roll++;
            update_pins();
        } else {
            last_frame_type = score_type.OPEN;
            console.log("computing open frame");
            compute_score(score_type.OPEN, current_frame);
            reset_pins();
        }
        console.log(last_frame_type);


    });

});





