var HOSTNAME = "http://127.0.0.1:5000";

var frame = 1;
var roll = 1;
var pins_remaining = 10;
var current_total = 0;
var frames = [];
var current_frame;

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
    }
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
    frame++;
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

        fr.decrement_RNS();
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


/**
 * Retrieves score for an open frame from the bowling API.
 * Upon completion, updates score display with response data,
 * then reset pin input buttons.
 */
function compute_score(frame){
    var type = frame.frame_type;
    var url;
    var params;

    console.log("computing score for frame: " + frame);

    switch(type){
        case frame_type.STRIKE:
            url = "/calc_score_strike";
            params = {
                roll1: frames[frame.num].roll1,
                roll2: frames[frame.num].roll2,
                current_total: current_total
            };
            break;
        case frame_type.SPARE:
            url = "/calc_score_spare";
            params = {
                roll1: frames[frame.num].roll1,
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
            reset_pins();
        }
    );

}



$(document).ready(function(){
    // Initialize array of frames (unplayed by default)
    for (var i=1; i<=10; i++){
        frames.push(new Frame(i));
    }
    current_frame = frames[0];

    /**
     * When input buttons are clicked, determine appropriate scoring
     * algorithm
     */
    $(".pin_button").click(function(){
        var num_pins = ($(this).text());
        // Update display
        console.log("frame " + frame + ", roll " + roll + ": " + num_pins);
        set_pins_for_roll(frame, roll, num_pins);


        // Determine frame type and compute if open
        if (num_pins == 10){
            console.log("frame " + frame + ": strike");
            current_frame.set_type(frame_type.STRIKE, RNS.STRIKE);
            reset_pins();

        } else if (num_pins == pins_remaining) {
            console.log("frame " + frame + ": spare");
            current_frame.set_type(frame_type.SPARE, RNS.SPARE);
            reset_pins();

        } else if (roll == 1){
            console.log("frame " + frame + ": unplayed");
            roll++;
            update_pins();

        } else {
            console.log("frame " + frame + ": open");
            current_frame.set_type(frame_type.OPEN, RNS.OPEN);
            //console.log("computing open frame");
        }

        for (var i=0; i<frame; i++){
            console.log("");
            var fr = frames[i];
            console.log("frame " + fr.num);
            console.log("type " + fr.frame_type);
            console.log("rns " + fr.RNS);
            if (fr.RNS == 0){
                switch(fr.frame_type){
                    case frame_type.STRIKE:
                        compute_score(fr);
                        console.log("computing strike");
                        break;
                    case frame_type.SPARE:
                        compute_score(fr);
                        console.log("computing spare");
                        break;
                    case frame_type.OPEN:
                        compute_score(fr);
                        console.log("computing open");
                        break;
                }
            }
        }



    });

});





