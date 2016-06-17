var HOSTNAME = "http://108.84.181.177:5001";
QUnit.config.reorder = false;

QUnit.test("Setup Frames", function(assert) {
    setup_frames();
    assert.propEqual(frames[0], new Frame(1), "Frames array initialized with frame objects.");
    assert.equal(frames.length, 10, "Frame array contains 10 frames.");
    assert.equal(current_frame, 1, "Current frame is 1.");
});

QUnit.test("Frame 1: Bowl a 3/5 open frame", function(assert){
    assert.equal(current_frame, 1, "Current frame is 1.");
    play_roll(3);
    assert.equal(frames[0].roll1, 3, "First roll of frame 1 equals 3.");
    assert.equal(frames[0].frame_type, frame_type.UNPLAYED, "Type of frame 1 is unplayed (incomplete).");
    play_roll(5);
    assert.equal(frames[0].roll2, 5, "Second roll of frame 1 equals 5.");
    assert.equal(frames[0].frame_type, frame_type.OPEN, "Type of frame 1 is open.");
    assert.equal(frames[0].RNS, 0, "Frame 1 should be scored.");
});

QUnit.test("Score Frame 1 (Open) with API call", function(assert){
    assert.expect(2);
    var done = assert.async();

    $.get(
        HOSTNAME + "/calc_score",
        {
            roll1: frames[0].roll1,
            roll2: frames[0].roll2,
            current_total: current_total
        },
        function(data){
            assert.equal(data, 8, "Score for frame 1 is 8.");
            current_total = data;
            assert.equal(current_total, 8, "Current total is 8.");
            done();
        }
    );

});

QUnit.test("Frame 2: Bowl a 4/6 spare", function(assert){
    assert.equal(current_frame, 2, "Current frame is 2.");
    play_roll(4);
    assert.equal(frames[1].roll1, 4, "First roll of frame 2 equals 4.");
    play_roll(6);
    assert.equal(frames[1].roll2, 6, "Second roll of frame 2 equals 5.");
    assert.equal(frames[1].frame_type, frame_type.SPARE, "Type of frame 2 is a spare.");
    assert.equal(frames[1].RNS, 1, "Frame 2 requires one more roll to score");
});

QUnit.test("Frame 3: Bowl a strike", function(assert){
    assert.equal(current_frame, 3, "Current frame is 3.");
    play_roll(10);
    assert.equal(frames[2].roll1, 10, "First roll of frame 2 equals 10.");
    assert.equal(frames[2].frame_type, frame_type.STRIKE, "Type of frame 3 is a strike.");
    assert.equal(frames[1].RNS, 0, "Frame 2 should be scored.");
    assert.equal(frames[2].RNS, 2, "Frame 3 requires two more rolls to score.");
});

QUnit.test("Score Frame 2 (Spare) with API call", function(assert){
    assert.expect(2);
    var done = assert.async();

    $.get(
        HOSTNAME + "/calc_score_spare",
        {
            roll1: frames[2].roll1,
            current_total: current_total
        },
        function(data){
            assert.equal(data, 28, "Score for frame 2 is 28.");
            current_total = data;
            assert.equal(current_total, 28, "Current total is 28.");
            done();
        }
    );

});

QUnit.test("Frame 4: Bowl an 8/1 open frame", function(assert){
    console.log(current_frame);
    assert.equal(current_frame, 4, "Current frame is 4.");
    play_roll(8);
    assert.equal(frames[3].roll1, 8, "First roll of frame 4 equals 8.");
    assert.equal(frames[3].frame_type, frame_type.UNPLAYED, "Type of frame 4 is unplayed (incomplete).");
    play_roll(1);
    assert.equal(frames[3].roll2, 1, "Second roll of frame 4 equals 1.");
    assert.equal(frames[3].frame_type, frame_type.OPEN, "Type of frame 4 is open.");
    assert.equal(frames[2].RNS, 0, "Frame 3 should be scored.");
    assert.equal(frames[3].RNS, 0, "Frame 4 should be scored.");
});

QUnit.test("Score Frame 3 (Strike) with API call", function(assert){
    assert.expect(2);
    var done = assert.async();

    $.get(
        HOSTNAME + "/calc_score_strike",
        {
            roll1: frames[3].roll1,
            roll2: frames[3].roll2,
            current_total: current_total
        },
        function(data){
            assert.equal(data, 47, "Score for frame 3 is 47.");
            current_total = data;
            assert.equal(current_total, 47, "Current total is 47.");
            done();
        }
    );

});

QUnit.test("Score Frame 4 (Open) with API call", function(assert){
    assert.expect(2);
    var done = assert.async();

    $.get(
        HOSTNAME + "/calc_score",
        {
            roll1: frames[3].roll1,
            roll2: frames[3].roll2,
            current_total: current_total
        },
        function(data){
            assert.equal(data, 56, "Score for frame 1 is 56.");
            current_total = data;
            assert.equal(current_total, 56, "Current total is 56.");
            done();
        }
    );

});

QUnit.test("Reset Game", function(assert) {
    setup_frames();
    assert.propEqual(frames[0], new Frame(1), "Frames array initialized with frame objects.");
    assert.equal(frames.length, 10, "Frame array contains 10 frames.");
    assert.equal(current_frame, 1, "Current frame is 1.");
});