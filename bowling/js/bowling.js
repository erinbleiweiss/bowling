var HOSTNAME = "http://127.0.0.1:5000";

var current_frame = 1;
var roll = 1;
var pins_remaining = 10;
var current_total = 0;
var frames = [];

var last_scored = 0;

var frame_type = {
    OPEN: "open",
    STRIKE: "strike",
    SPARE: "spare",
    UNPLAYED: "unplayed"
};
var RNS = {
    OPEN: 0,
    STRIKE: 2,
    SPARE: 1,
    UNPLAYED: -1
};


var Frame = function(num){
    this.num = num;
    this.roll1 = -1;
    this.roll2= -1;
    this.frame_type= frame_type.UNPLAYED;
    this.RNS = RNS.UNPLAYED;
    this.RNS_rolls = [];
};

Frame.prototype.set_roll1 = function(n){
    this.roll1 = n;
};
Frame.prototype.set_roll2 = function(n){
    this.roll2 = n;
};
Frame.prototype.set_type = function(type, rns){
    this.frame_type = type;
    this.RNS = rns;
};
Frame.prototype.decrement_RNS = function(){
    if (this.RNS > 0){
        this.RNS--;
        return true;
    } return false;
};
Frame.prototype.add_roll = function(roll){
    this.RNS_rolls.push(roll);
};
Frame.prototype.mark_as_scored = function(){
    this.RNS = -1;
};


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
 * Update frame array with pin count, and reduce RNS as needed
 *
 * Also updates the display to reflect the number of pins knocked down
 * for each roll
 * @param frame: Frame for current roll
 * @param roll:  Current roll number
 * @param val:   Number of pins knocked down
 */
function set_pins_for_roll(frame, roll, val){
    for (var i=1; i<=frame; i++){
        var fr = frames[i-1];
        if (i == frame && roll == 1){
            fr.set_roll1(val);
        } else if (i == frame && roll == 2) {
            fr.set_roll2(val);
        }

        if (fr.decrement_RNS()){
            fr.add_roll(val);
        }
    }


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


function score_frames(){
    for (var i=last_scored; i<current_frame; i++){
        console.log("");
        var fr = frames[i];
        console.log("frame " + fr.num);
        console.log("type " + fr.frame_type);
        console.log("rns " + fr.RNS);
        if (fr.RNS == 0){
            compute_score(fr);
            console.log("computing " + fr.frame_type);
            break;
        }
    }
}

/**
 * Retrieves score for an open frame from the bowling API.
 * Upon completion, updates score display with response data,
 * then reset pin input buttons.
 */
function compute_score(frame){
    var type = frame.frame_type;
    var url;
    var params;

    console.log("computing score for frame: " + frame.num);

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
            if (type == frame_type.OPEN){
                reset_pins();
            }
            score_frames();
        }
    );

}



$(document).ready(function(){
    // Initialize array of frames (unplayed by default)
    for (var i=1; i<=10; i++){
        frames.push(new Frame(i));
    }
    var fr = frames[0];

    /**
     * When input buttons are clicked, determine appropriate scoring
     * algorithm
     */
    $(".pin_button").click(function(){
        console.log("");
        console.log("");
        var num_pins = ($(this).text());
        // Update display
        console.log("frame " + current_frame + ", roll " + roll + ": " + num_pins);
        set_pins_for_roll(current_frame, roll, num_pins);

        fr = frames[current_frame - 1];

        // Determine current_frame type and compute if open
        if (num_pins == 10){
            console.log("frame " + current_frame + ": strike");
            fr.set_type(frame_type.STRIKE, RNS.STRIKE);
            reset_pins();

        } else if (num_pins == pins_remaining && roll == 2) {
            console.log("frame " + current_frame + ": spare");
            fr.set_type(frame_type.SPARE, RNS.SPARE);
            reset_pins();

        } else if (roll == 1){
            console.log("frame " + current_frame + ": unplayed");
            roll++;
            update_pins();

        } else {
            console.log("frame " + current_frame + ": open");
            fr.set_type(frame_type.OPEN, RNS.OPEN);
            //console.log("computing open current_frame");
        }

        score_frames();


    });

});





