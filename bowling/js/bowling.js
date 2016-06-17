var HOSTNAME = "http://108.84.181.177:5001";

var frames = [];            // Array to hold 10 frame objects
var current_frame = 1;      // # of current frame (1-10)
var roll = 1;               // # of current roll (1-2; may be 3 for frame 10)
var pins_remaining = 10;    // # of pins remaining for a single frame (0-10)
var last_scored = 0;        // Last frame # scored (1-10). 0 Indicates that no frames have been scored.
var current_total = 0;      // Current total score of game (0-300)

/**
 *  Convenience enum used to denote type of frame, for use in
 *  frame scoring.
 *
 *  A frame may be a strike, a spare, open, or unplayed (incomplete).
 */
var frame_type = {
    OPEN: "open",
    STRIKE: "strike",
    SPARE: "spare",
    UNPLAYED: "unplayed"
};

/**
 * Rolls Needed to Score (RNS) is determined by a frame's type.
 * This is a convenience enum for enhanced readability.
 *
 * Open frames may be scored immediately (RNS = 0).
 * Spares require one additional roll before scoring (RNS = 1)
 * Strikes require two additional rolls (RNS = 2)
 * Unplayed, incomplete, or already scored frames are denoted as RNS = -1.
 */
var RNS = {
    OPEN: 0,
    STRIKE: 2,
    SPARE: 1,
    UNPLAYED: -1
};

/**
 * A complete bowling game contains 10 unique frame objects.
 *
 * Each frame contains two rolls, except frame ten which may
 * contain up to three.
 *
 * @param num: {int}              The frame number from 1-10
 * @param roll1: {int}            # of pins knocked down on roll 1
 * @param roll2: {int}            # of pins knocked down on roll 2
 * @param roll3: {int}            # of pins knocked down on roll 3
 * @param frame_type: {string}    Determines scoring type ("open", "strike", "spare", or "unplayed")
 * @param RNS: {int}              "Rolls Needed to Score"
 * @param RNS_rolls: {int array}  Subsequent roll value(s) used to score strikes and spares
 */
var Frame = function(num){
    this.num = num;
    this.roll1 = -1;
    this.roll2 = -1;
    this.roll3 = -1;
    this.frame_type= frame_type.UNPLAYED;
    this.RNS = RNS.UNPLAYED;
    this.RNS_rolls = [];
};

/**
 * Setter for Frame's roll params
 *
 * @param roll:  Roll #
 * @param n:     Value of roll (# of pins knocked down)
 */
Frame.prototype.set_roll = function(roll, n){
    switch(roll){
        case 1:
            this.roll1 = n;
            break;
        case 2:
            this.roll2 = n;
            break;
        case 3:
            this.roll3 = n;
            break;
    }

};

/***
 * Set type and RNS for Frame ("open", "strike", "spare", or "unplayed")
 * @param type:   Frame type (string)
 * @param rns:    Rolls needed to score (Initialized based on type)
 */
Frame.prototype.set_type = function(type, rns){
    this.frame_type = type;
    this.RNS = rns;
};

/**
 * Called after each roll: Decrement RNS for frame if necessary
 *
 * @returns {boolean} Returns true if RNS was decremented
 */
Frame.prototype.decrement_RNS = function(){
    if (this.RNS > 0){
        this.RNS--;
        return true;
    } return false;
};

/**
 * Add a roll value to a frame's RNS array
 * @param roll: roll value (# of pins knocked down)
 */
Frame.prototype.add_roll = function(roll){
    this.RNS_rolls.push(roll);
};


/**
 * Called in compute_score():
 *
 * Mark a frame as scored (Do not score again). Also update global last_scored.
 */
Frame.prototype.mark_as_scored = function(){
    this.RNS = -1;
    last_scored = this.num;
};


/**
 * On page load and on reset:
 *   - Clear any existing data,
 *   - Reset global variables to default values,
 *   - Initialize new array of frames (unplayed by default),
 *   - Clear existing values in display frames,
 *   - Return all pin input buttons to view
 */
function setup_frames(){
    reset_pins();
    frames = [];
    current_frame = 1;
    roll = 1;
    pins_remaining = 10;
    last_scored = 0;
    current_total = 0;

    for (var i=1; i<=10; i++){
        frames.push(new Frame(i));
    }
    $.each($("td"), function(){
        $(this).text("");
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
        if (pin == pins_remaining){
            if (roll == 2) {
                $(this).text("/");
            }
        }
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
    if (current_frame < 10){
        roll = 1;
        current_frame++;
    } else {
        roll++;
    }
    $.each($(".pin_button"), function(){
        $(this).removeClass("hidden");
        var val = $(this).attr("data-num");
        if (val != 10){
            $(this).text(val);
        } else{
            $(this).text("X");
        }
    });
}


/**
 * Called upon game completion:
 * Removes pin inputs from view.
 */
function disable_inputs(){
    $("#buttons").addClass("hidden");
    $("#reset").removeClass("hidden");
}


/**
 * Update frame array with pin count, and reduce RNS as needed
 *
 * Also updates the display to reflect the number of pins knocked down
 * for each roll
 * @param frame: Frame for current roll
 * @param roll:  Current roll number
 * @param val:   Number of pins knocked down
 */
function set_pins_for_roll(frame, roll, val){
    // Set roll values for frame object
    for (var i=1; i<=frame; i++){
        var fr = frames[i-1];
        if (i == frame){
            fr.set_roll(roll, val);
        }

        if (fr.decrement_RNS()){
            fr.add_roll(val);
        }
    }

    // Set roll values for display
    if (val == 10) {
        if (frame < 10){
            $("#frame_" + frame + "_2").text("X");
        } else {
            $("#frame_" + frame + "_" + roll).text("X");
        }
    } else if (val == pins_remaining){
        if (frame < 10){
            $("#frame_" + frame + "_2").text("/");
        } else {
            $("#frame_" + frame + "_" + roll).text("/");
        }
    } else{
        $("#frame_" + frame + "_" + roll).text(val);
        if (roll == 1){
            pins_remaining -= val;
        }
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
 * Scan all frames between last scored and current frame.  If frame is
 * eligible for scoring (no subsequent rolls required), compute score
 * for that frame using bowling API.
 *
 * Break out of loop after scoring first frame in order to avoid totals
 * being returned from API out of order.  The compute_score function will
 * call score_frames again upon completion.
 */
function score_frames(){
    for (var i=last_scored; i<current_frame; i++){
        var fr = frames[i];
        if (fr.RNS == 0){
            compute_score(fr);
            break;
        }
    }
}

/**
 * Retrieves score for an open frame from the bowling API.
 * Upon completion, updates score display with response data.
 * If frame 10, disable pin inputs on completion.
 */
function compute_score(frame){
    var type = frame.frame_type;
    var url;
    var params;

    switch(type){
        case frame_type.STRIKE:
            url = "/calc_score_strike";
            params = {
                roll1: frame.RNS_rolls[0],
                roll2: frame.RNS_rolls[1],
                current_total: current_total
            };
            break;
        case frame_type.SPARE:
            url = "/calc_score_spare";
            params = {
                roll1: frame.RNS_rolls[0],
                current_total: current_total
            };
            break;
        case frame_type.OPEN:
            url = "/calc_score";
            params = {
                roll1: frame.roll1,
                roll2: frame.roll2,
                current_total: current_total
            };
            break;
    }

    $.get(
        HOSTNAME + url,
        params,
        function(data){
            current_total = data;
            set_frame_total(frame.num, data);
            frame.mark_as_scored();

            if (frame.num == 10){
                disable_inputs();
            } else {
                score_frames();
            }
        }
    );

}

/**
 * Determine the type of the current frame (open/strike/spare/unplayed (incomplete))
 * based on the number of pins knocked down. Set the frame type property in order
 * to use the appropriate scoring algorithm.
 *
 * Update displays and inputs as needed.
 *
 * @param num_pins: Number of pins knocked down as indicated by input buttons. (0-10)
 */
function play_roll(num_pins) {
    set_pins_for_roll(current_frame, roll, num_pins); // Update display
    var fr = frames[current_frame - 1];                   // Get current frame

    // Determine frame type:
    // Strike
    if (num_pins == 10) {
        if (current_frame < 10) {
            fr.set_type(frame_type.STRIKE, RNS.STRIKE);
        } else if (roll != 3) {
            fr.set_type(frame_type.STRIKE, 3 - roll);
        }
        reset_pins();
    }
    // Spare
    else if (num_pins == pins_remaining && roll == 2) {
        fr.set_type(frame_type.SPARE, RNS.SPARE);
        reset_pins();
    }
    // Incomplete frame
    else if (
        roll == 1 ||                    // First roll of frames 1-9
        (
            current_frame == 10 &&        // First or second roll of frame 10
            roll <= 2 &&                  // if frame contains strike or spare
            fr.frame_type != frame_type.UNPLAYED
        )
    ) {
        roll++;
        update_pins();

    }
    // Open Frame
    else {
        if (current_frame < 10 || fr.frame_type == frame_type.UNPLAYED) {
            fr.set_type(frame_type.OPEN, RNS.OPEN);
        }
    }

    if (fr.frame_type == frame_type.OPEN) {
        reset_pins();
    }
}


/**
 * On page load, initialize frame array and define behavior for
 * clicking pin input buttons.
 */
$(document).ready(function(){
    // Setup frame array and get first frame
    setup_frames();

    /**
     * When input buttons are clicked, determine appropriate scoring
     * algorithm and score frames.
     */
    $(".pin_button").click(function(){
        var num_pins = ($(this).attr("data-num"));
        play_roll(num_pins);
        score_frames();
    });

    // Attach behavior to reset buttons
    $("#reset_large").click(function(){
        setup_frames();
        $("#buttons").removeClass("hidden");
        $("#reset").addClass("hidden");
    });

    $("#reset_small").click(function(){
        if (confirm("Reset all frames?") == true) {
            setup_frames();
        }
    });


});





