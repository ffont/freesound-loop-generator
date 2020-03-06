var current16thNote = 0;
var timeoutId;
var startTime;
var noteTime = 0.0;
var lastDrawTime = -1;
var am = undefined; // Audio manager
var audio_preview_key = 'preview-hq-mp3';
var isRecording = false;
var startedRecording = undefined;
var shouldFinishRecording = undefined;
var sequencerStartedForRecording = false;
var recordingLengthInSamples = undefined;
var recordingFilename = undefined;
var license_filter = undefined;

function lazyInitAudioManager() {
    // Lazily initialize audio manager
    // We only init audio manager when we really need it (when a sound is to be played)
    // In this way we expect to avoid restrictions in browsers where audio
    // is only played when users have made some interactions
    if (am === undefined) {
        am = initAudioManager();
        am.setMainVolume(0.7);
    }
}


function nextNote() {
  // Advance current note and time by a 16th note...
  var secondsPerBeat = 60.0 / TEMPO;  // picks up the CURRENT tempo value!
  noteTime += 0.25 * secondsPerBeat;  // Add 1/4 of quarter-note beat length to time
  current16thNote++;  // Advance the beat number, wrap to zero
  if (current16thNote == 16) {
    current16thNote = 0;
  }
}

function schedule() {
    var currentTime = context.currentTime;

    if ((isRecording) && (currentTime >= shouldFinishRecording)){
        stop_recording();
    }

    currentTime -= startTime;
    while (noteTime < currentTime + 0.200) {
        var contextPlayTime = noteTime + startTime;
        for (slot in SEQUENCE){
          if (SEQUENCE[slot][current16thNote] == 'x'){
            play_sound(slot, contextPlayTime);
          }
        }
        if (noteTime != lastDrawTime) {
            lastDrawTime = noteTime;
            drawPlayhead((current16thNote + 15) % 16);
        }
        if (SEQUENCER_RUNNING){
            nextNote();    
        } else {
            clearTimeout(timeoutId);
            return;
        }
    }
    if (SEQUENCER_RUNNING){
        timeoutId = setTimeout(schedule, 50);
    }
}

function drawPlayhead() {
    CURRENT_SEQUENCE_POSITION = current16thNote;
    // draw cursor position
    for (var i=0; i<16; i++){
        $("#cell_wrapper_" + i.toString() + '_' + CURRENT_SEQUENCE_POSITION.toString()).addClass('current_cell');
        var previous_sequence_step = CURRENT_SEQUENCE_POSITION - 1;
        if (previous_sequence_step < 0){
            previous_sequence_step = SEQUENCE_LENGTH - 1;
        }
        $("#cell_wrapper_" + i.toString() + '_' + previous_sequence_step.toString()).removeClass('current_cell');
    }
}

function handlePlay(event) {
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    schedule();
}


/* Triggers, popovers... */

var MODE = 'mode1';
var TRIGGERS_SOUND_INFORMATION = [];
var LICENSE_NAMES = {
    'http://creativecommons.org/publicdomain/zero/1.0/': 'CC0',
    'http://creativecommons.org/licenses/by/3.0/': 'CC-BY',
    'http://creativecommons.org/licenses/by-nc/3.0/': 'CC-BY-NC',
    'http://creativecommons.org/licenses/sampling+/1.0/': 'Sampling+'
};
var KEY_MAPPING = [
    '3', '4', '5', '6',
    'W', 'E', 'R', 'T',
    'S', 'D', 'F', 'G',
    'Z', 'X', 'C', 'V'
];
var LAST_STEP_TIME = 0;

var DEFAULT_SEQUENCE = [
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 0
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 1
    ['_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x'], // 2
    ['_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x', '_', 'x'], // 3
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 4
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 5
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 6
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 7
    ['_', '_', 'x', '_', '_', '_', 'x', '_', '_', '_', 'x', '_', '_', '_', 'x', '_'], // 8
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 9
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 10
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 11
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 12
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 13
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'], // 14
    ['x', '_', '_', '_', 'x', '_', '_', '_', 'x', '_', '_', '_', 'x', '_', '_', '_']  // 15
];
var SEQUENCE = [];
var SEQUENCE_LENGTH = 16;
var CURRENT_SEQUENCE_POSITION = 0;
var SEQUENCER_RUNNING = false;
var SEQUENCER_TIMER = false;
var TEMPO = 120;
var INITIAL_SOUND_IDS = [158680,207956,183119,183101,
                        191634,26642,7825,183109,
                        181695,183106,238008,165326,
                        808,171104,218282,145775];

var TAGS_MODE_CURRENT_TAGS = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
var CURRENTLY_CHANGED_ID_BY_TAGS = -1;

var AUXILIARY_PLAYER = new Audio();


function destroy_popovers(){
    for (var i=0; i<16; i++){
        var trigger_element = $('#trigger_' + i);
        trigger_element.popover('destroy');
    }
}

function set_popover_content(element_id){

    var trigger_element = $('#' + element_id);
    trigger_element.popover('destroy');
    trigger_element.popover({
        trigger: 'manual',
        placement: 'top',
        content: render_popover_content(element_id)
    });

    trigger_element.click(
        function(event){
            $('[id^="trigger_"]').not('#' + element_id).popover('hide');
            $('#' + element_id).popover('show');
            $('#pop_' + element_id).html(render_inner_popover_content(element_id));
            $('.popover_content').click(
                function(event){
                    event.stopPropagation();
                }
            );
            event.stopPropagation();
        }
    );
}

function close_all_popovers(){
    $('[id^="trigger_"]').popover('hide');
}

function render_popover_content(element_id){
    var html = "";
    html += "<div class='popover_content' id='pop_" + element_id + "'>";
    html += render_inner_popover_content(element_id);
    html += "</div>";
    return  html;
}

function render_inner_popover_content(element_id){
    var html = "";
    var id = parseInt(element_id.split('_')[1],10);
    if (TRIGGERS_SOUND_INFORMATION.length == 0){
        if (MODE == "mode5") {
            html += '<a href="javascript:void(0);" onclick="change_sound_prompt(' + id + ');"><span class="glyphicon glyphicon-search" style="float:right"></span></a>';
            html += "No sound loaded..."
        } else {
            html += "No sound loaded..."
        }
    } else {
        var sound = TRIGGERS_SOUND_INFORMATION[id];
        if (sound !== false) {
            if (MODE == "mode5") {
                html += '<a href="javascript:void(0);" onclick="change_sound_prompt(' + id + ');"><span class="glyphicon glyphicon-search" style="float:right"></span></a>';
                html += render_basic_sound_info(sound);
            } else {
                html += render_basic_sound_info(sound);
            }
        } else {
            if (MODE == "mode5") {
                html += '<a href="javascript:void(0);" onclick="change_sound_prompt(' + id + ');"><span class="glyphicon glyphicon-search" style="float:right"></span></a>';
                html += "No sound loaded..."
            } else {
                html += "No sound loaded..."
            }
        }       
    }
    return html;
}

function render_basic_sound_info(sound){
    var html = "";
    var slice_max = 18;
    var url = "http://www.freesound.org/people/" + sound.username + "/sounds/" + sound.id;
    if (sound.name.length < slice_max){
        html += "<h4><a href='" + url + "' target='_blank'>" + sound.name + "</a></h4>";
    } else {
        html += "<h4><a href='" + url + "' target='_blank'>" + sound.name.slice(0,slice_max) + "...</a></h4>";
    }
    html += "<p><strong>" + sound.username + "</strong></p>";
    html += "<p>" + LICENSE_NAMES[sound.license] + "&nbsp;&nbsp;<span style=\"color:#bbb;\">" + sound.created.split("T")[0] + "</span></p>";
    html += "<div style=\"height:90px;overflow:scroll;\"><p>" + sound.description + "</p></div>";
    return html
}

function set_progress_bar_value(value){
    $("#progress_bar").width(value + "%");
}

function init_stuff(){
    freesound.setToken("d31c795be3f70f7f04b21aeca4c5b48a599db6e9");
    change_mode(MODE);

    for (var i=0; i<16; i++){
        set_popover_content("trigger_" + i);
    }

    set_progress_bar_value(0);

    if (MODE == "mode1"){
        $("#query_terms").val("percussion");
        load_from_freesound();
    }

    // Set key events
    $(document).keydown(function(e) {
        if (e.target.localName == "input"){
        } else {
            if (TRIGGERS_SOUND_INFORMATION.length > 0){
                var c = String.fromCharCode(e.which);
                var index = KEY_MAPPING.indexOf(c);
                if (index != -1){
                    play_sound(index);
                } else {
                    if (c == " "){
                        if (SEQUENCER_RUNNING){
                            stop_sequencer();
                        } else {
                            start_sequencer();
                        }
                    }
                }
            }
        }
    });

    //start_sequencer();
    //SEQUENCE = DEFAULT_SEQUENCE;
    randomize_sequence();
    //DEFAULT_SEQUENCE = create_random_pattern(0.1);
    $('#tempo_slider').slider().on('slide', function(ev){
        TEMPO = ev.value;
    });
    render_sequencer();

    // set bpm button
    $('#bpm_input').bind('keypress', function(e) {
        if(e.keyCode==13){
            var input_tempo = parseInt($('#bpm_input').val(), 10);
            if (!isNaN(input_tempo)){
                TEMPO = input_tempo;
                $('#bpm_input').blur ();
            } else {
                $('#bpm_input').val(TEMPO);
                $('#bpm_input').blur ();
            }
        }
    });
}

function render_controls_for_mode(){
    var html = "";
    if (MODE == "mode1"){
        html += '<div class="input-group" style="width:320px;margin-left:136px;">';
        html += '<input id="query_terms" type="text" class="form-control" placeholder="Query terms...">';
        html += '<span class="input-group-btn">';
        html += '<button class="btn btn-default" type="button" onclick="load_from_freesound();">Search!</button>';
        html += '</span>';
        html += '</div>';
    } else if (MODE == "mode2"){
        html += '<div class="input-group" style="width:320px;margin-left:136px;">';
        html += '<button class="btn btn-default" type="button" onclick="load_from_freesound();">Replace sounds randomly...</button>';
        html += '</div>';
    } else if (MODE == "mode3"){
        html += '<div class="input-group" style="width:320px;margin-left:136px;">';
        html += '<button class="btn btn-default" type="button" onclick="load_from_freesound();">Replace sounds by similarity...</button>';
        html += '</div>';
    } else if (MODE == "mode4"){
        html += '<div style="width:450px;margin-left:78px;">' +
            '<a class="btn btn-default" style="margin-top: -2px;" href="#" onclick="previous();">&larr;</a>&nbsp;&nbsp;&nbsp;&nbsp;' +
            'Month: <div style="width:50px;display:inline-block;margin-right:25px;"><input id="month" type="text" class="form-control" placeholder="Month" value="10"></div>' +
            'Year: <div style="width:70px;display:inline-block;margin-right:10px;"><input id="year" type="text" class="form-control" placeholder="Year" value="2017"></div>' +
            '&nbsp;<a class="btn btn-default" style="margin-top: -2px;" href="#" onclick="next();">&rarr;</a>' +
            '</div>';
    } else if (MODE == "mode5"){
        html += "<p style='line-height:33px;'>Click on the triggers and use the search button to find sounds... <span class='glyphicon glyphicon-search'</span></p>";
    } else {
        html += "controls " + MODE;
    }
    return html;
}

function change_mode(mode_id){
    MODE = mode_id;
    $('[id^="mode"]').removeClass('active');
    $("#" + MODE).addClass('active');
    $("#mode_controls").html(render_controls_for_mode());
    $("#progress_bar_wrapper").hide();  // never show progress bar as it is not really useful

    if (MODE == "mode4"){
        $('#year').bind('keypress', function(e) {
            if(e.keyCode==13){
                load_from_freesound_timeline();
                var input = document.getElementById ("year");
                input.blur ();
            }
        });
        $('#month').bind('keypress', function(e) {
            if(e.keyCode==13){
                load_from_freesound_timeline();
                var input = document.getElementById ("month");
                input.blur ();
            }
        });
    } else if (MODE == "mode1"){
        $('#query_terms').bind('keypress', function(e) {
            if(e.keyCode==13){
                load_from_freesound();
                var input = document.getElementById ("query_terms");
                input.blur ();
            }
        });
    } else if (MODE == "mode2"){
         //load_from_freesound();
    }

    if (MODE == "mode4"){
        //load_from_freesound_timeline();
    }

    if (MODE == "mode3"){
        //load_from_freesound_similarity();
    }

    if (MODE == "mode5"){
        $("#progress_bar_wrapper").hide();
    }
}

function load_from_freesound(){
    if (MODE == "mode1"){
        load_from_freesound_text_search();
    } else if (MODE == "mode2"){
        load_from_freesound_random();
    }else if (MODE == "mode3"){
        load_from_freesound_similarity();
    } else {
        alert('not implemented!');
    }
}

function load_from_freesound_text_search(){

    for (var i=0; i<16; i++){
        $('#trigger_' + i).addClass('my_disabled');
    }

    var NEW_TRIGGERS_SOUND_INFORMATION = [];
    set_progress_bar_value(10);

    var query = $("#query_terms").val();
    var filter = "duration:[0%20TO%201.5]";
    if (license_filter !== undefined) {
        filter += " " + license_filter;
    }
    var fields = "id,name,previews,license,username,description,created";
    var page_size = 100;

    freesound.textSearch(query, {page:1, filter:filter, fields:fields, page_size:page_size, group_by_pack:1},
        function(sounds){
            sounds.results = shuffle(sounds.results); // randomize
            for (var i in sounds.results){
                if (i < 16){
                    var sound = sounds.results[i];
                    NEW_TRIGGERS_SOUND_INFORMATION.push({'id':sound.id,
                                                     'preview': sound.previews[audio_preview_key],
                                                     'name':sound.name,
                                                     'license':sound.license,
                                                     'username':sound.username,
                                                     'description':sound.description,
                                                     'created':sound.created
                    });
                    load_sound(i, sound.previews[audio_preview_key]); 
                }
            }
            TRIGGERS_SOUND_INFORMATION = NEW_TRIGGERS_SOUND_INFORMATION;
            destroy_popovers();
            for (var i = 0; i < 16; i++) {
                set_popover_content("trigger_" + i);
            }
            set_progress_bar_value(100);

        },function(){ console.log("Error while searching...")}
    );33
}

function load_sound(index, url){
    lazyInitAudioManager();
    am.loadSound(url, function () {
        $('#trigger_' + index).attr('disabled', false);
        $('#trigger_' + index).removeClass('my_disabled');
    });
}

function load_from_freesound_random(){

    for (var i=0; i<16; i++){
        $('#trigger_' + i).addClass('my_disabled');
    }
    var NEW_TRIGGERS_SOUND_INFORMATION = [];
    set_progress_bar_value(10);

    var query = "";
    var filter = "duration:[0%20TO%201.5]";
    if (license_filter !== undefined) {
        filter += " " + license_filter;
    }
    var fields = "id,name,previews,license,username,description,created";
    var page_size = 1;

    freesound.textSearch(query, {page:1, filter:filter, fields:fields, page_size:page_size, group_by_pack:1},
        function(sounds){
            var pages = [];
            for (var i=0; i<16; i++){
                pages.push(Math.floor(Math.random() * (sounds.count - 2 + 1)) + 1);
            }
            for (j in pages){
                var page = pages[j];
                freesound.textSearch(query, {page:page, filter:filter, fields:fields, page_size:page_size, group_by_pack:1},
                function(sounds){
                    var index = NEW_TRIGGERS_SOUND_INFORMATION.length;
                    if (index < 16){
                        var sound = sounds.results[0];
                        NEW_TRIGGERS_SOUND_INFORMATION.push({'id':sound.id,
                                                         'preview': sound.previews[audio_preview_key],
                                                         'name':sound.name,
                                                         'license':sound.license,
                                                         'username':sound.username,
                                                         'description':sound.description,
                                                         'created':sound.created
                        });
                        load_sound(index, sound.previews[audio_preview_key]);
                        set_progress_bar_value(10 + (index) * (90/16));

                    }
                    if (index == 15){
                        TRIGGERS_SOUND_INFORMATION = NEW_TRIGGERS_SOUND_INFORMATION;
                        for (var i = 0; i < 16; i++) {
                            set_popover_content("trigger_" + i);
                        }
                        set_progress_bar_value(100);
                    }
                },function(){ console.log("Error while searching...")});
            }
        },function(){ console.log("Error while searching...")}
    );
}

function load_from_freesound_similarity(){

    for (var i=0; i<16; i++){
        $('#trigger_' + i).addClass('my_disabled');
    }
    set_progress_bar_value(10);

    var fields = "id,name,previews,license,username,description,created,duration";
    var descriptors_filter = "sfx.effective_duration.max:[0 TO 0.5]";

    var filter;
    if (license_filter !== undefined) {
        filter = license_filter;
    }
    
    var page_size = 15;
    var ids_positions = [];
    for (i in TRIGGERS_SOUND_INFORMATION){
        if (TRIGGERS_SOUND_INFORMATION[i] !== false){
            ids_positions.push(TRIGGERS_SOUND_INFORMATION[i].id);
        } else {
            ids_positions.push(false);
        }
    }

    for (i in TRIGGERS_SOUND_INFORMATION){

        var target_sound_id = ids_positions[i];
        if (target_sound_id === false){
            continue;
        }

        var fn = freesound.contentSearch;
        if (filter !== undefined){
            fn = freesound.combinedSearch;
        }
        
        fn({target:target_sound_id, page:1, fields:fields, filter:filter, page_size:page_size, descriptors_filter:descriptors_filter},
        function(sounds){

            // Get target sound ID from request to know to which one this async call corresponds to
            if (sounds.next !== undefined){
                var current_target_id = parseInt(sounds.next.split("&target=")[1].split("&")[0],10);
            } else {
                var current_target_id = parseInt(sounds.more.split("&target=")[1].split("&")[0],10);
            }
            
            var index = ids_positions.indexOf(current_target_id);

            var sounds_ok = [];
            for (j in sounds.results){
                if (sounds.results[j].duration < 1.5){
                    sounds_ok.push(sounds.results[j]);
                }
            }
            if (sounds_ok.length){
                var sound = sounds_ok[Math.floor(Math.random() * sounds_ok.length)];
                TRIGGERS_SOUND_INFORMATION[index] = {'id':sound.id,
                                                 'preview':sound.previews[audio_preview_key],
                                                 'name':sound.name,
                                                 'license':sound.license,
                                                 'username':sound.username,
                                                 'description':sound.description,
                                                 'created':sound.created
                };
                load_sound(index, sound.previews[audio_preview_key]);
            } else {
                TRIGGERS_SOUND_INFORMATION[index] = false;
            }

            set_popover_content("trigger_" + index);
            var count_replaced = 0;
            for (k in TRIGGERS_SOUND_INFORMATION) {
                if (TRIGGERS_SOUND_INFORMATION[k] !== false) {
                    count_replaced += 1;
                }
            }
            set_progress_bar_value(10 + (count_replaced) * (90 / 16));


        },function(xhr){ 
            console.log("Error while finding similar sounds...");
            // Get target sound ID from request to know to which one this async call corresponds to
            var current_target_id = parseInt(xhr.responseText.split("Sound with id ")[1].split(" ")[0], 10);
            var index = ids_positions.indexOf(current_target_id);
            TRIGGERS_SOUND_INFORMATION[index] = false;
            set_popover_content("trigger_" + index);
        });
    }
}

function load_from_freesound_timeline(){

    for (var i=0; i<16; i++){
        $('#trigger_' + i).addClass('my_disabled');
    }

    var NEW_TRIGGERS_SOUND_INFORMATION = [];
    set_progress_bar_value(10);

    var year = parseInt($("#year").val(),10);
    var month = parseInt($("#month").val(),10);
    var query = $("#query_terms").val();
    var filter = "duration:[0%20TO%201.5] created:[" + year + "-" + month + "-1T00:00:00Z TO " + get_next_year(year,month) + "-" + get_next_month(month) + "-01T00:00:00Z]";
    if (license_filter !== undefined) {
        filter += " " + license_filter;
    }
    var fields = "id,name,previews,license,username,description,created";
    var sort = "downloads_desc";
    var page_size = 16;

    freesound.textSearch(query, {page:1, filter:filter, fields:fields, page_size:page_size, group_by_pack:1, sort:sort},
        function(sounds){
            //sounds.results = shuffle(sounds.results); // randomize
            for (var i in sounds.results){
                if (i < 16){
                    var sound = sounds.results[i];
                    NEW_TRIGGERS_SOUND_INFORMATION.push({'id':sound.id,
                                                     'preview':sound.previews[audio_preview_key],
                                                     'name':sound.name,
                                                     'license':sound.license,
                                                     'username':sound.username,
                                                     'description':sound.description,
                                                     'created':sound.created
                    });
                    load_sound(i, sound.previews[audio_preview_key]);
                }
            }
            TRIGGERS_SOUND_INFORMATION = NEW_TRIGGERS_SOUND_INFORMATION;
            for (var i = 0; i < 16; i++) {
                set_popover_content("trigger_" + i);
            }
            set_progress_bar_value(100);

        },function(){ console.log("Error while searching...")}
    );

}


// SQUENCER

function start_sequencer(){
    lazyInitAudioManager();
    SEQUENCER_RUNNING = true;
    handlePlay();
    $("#start_stop_sequencer").html('<span class="glyphicon glyphicon-stop">');
}

function stop_sequencer(){
    SEQUENCER_RUNNING = false;
    $("#start_stop_sequencer").html('<span class="glyphicon glyphicon-play">');
}

function start_stop_sequencer(){
    if (SEQUENCER_RUNNING){
        stop_sequencer();
    } else {
        start_sequencer();
    }
}

function play_sound(trigger_id, contextPlayTime){
    if (contextPlayTime == undefined){
        contextPlayTime = 0;
    }

    lazyInitAudioManager();
    if (TRIGGERS_SOUND_INFORMATION[trigger_id] !== undefined){
        am.playBufferByName(TRIGGERS_SOUND_INFORMATION[trigger_id]['preview'], contextPlayTime);
        $("#trigger_" + trigger_id).addClass("trigger_active");
        setTimeout(function () {
            $("#trigger_" + trigger_id).removeClass("trigger_active");
        }, 200
        );
    }
}

// UTILS

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function get_next_month(month){
    if (parseInt(month,10) >= 12){
        return "1"
    }else{
        return (parseInt(month,10) + 1).toString()
    }
}

function get_next_year(year,month){
    if (parseInt(month,10) >= 12){
        return (parseInt(year,10) + 1).toString()
    }else{
        return year
    }
}

function get_previous_month(month){
    if (parseInt(month,10) <= 1){
        return "12"
    }else{
        return (parseInt(month,10) - 1).toString()
    }
}

function get_previous_year(year,month){
    if (parseInt(month,10) <= 1){
        return (parseInt(year,10) - 1).toString()
    }else{
        return year
    }
}

function next(){
    var month = document.getElementById('month').value;
    var year = document.getElementById('year').value;
    document.getElementById('month').value = get_next_month(month)
    document.getElementById('year').value = get_next_year(year,month)
    load_from_freesound_timeline();
}

function previous(){
    var month = document.getElementById('month').value;
    var year = document.getElementById('year').value;
    document.getElementById('month').value = get_previous_month(month);
    document.getElementById('year').value = get_previous_year(year,month);
    load_from_freesound_timeline();
}

function set_license_filter(){
    var value = $("#license_select").val();
    if (value == "only_0") {
        license_filter = "license:\"Creative Commons 0\""
    } else if (value == "minus_nc") {
        license_filter = "-license:\"Attribution Noncommercial\""
    } else {
        license_filter = undefined;
    }
}

function create_random_pattern(probability){
    var pattern = [];
    for (var i=0; i<16; i++){
        var line = [];
        for (var j=0; j<SEQUENCE_LENGTH; j++) {
            if (Math.random() < probability){
                line.push('x');
            } else {
                line.push('_');
            }
        }
        pattern.push(line);
    }
    return pattern;
}

function toggle_show_pad_sequencer(){

    var sequencer_wrapper = $("#sequencer_wrapper");
    var trigger_pad_wrapper = $("#trigger_pad_wrapper");
    if (sequencer_wrapper.is(':visible')){
        sequencer_wrapper.hide();
        trigger_pad_wrapper.show();
        $("#toggle_pad_sequencer").html('<span class="glyphicon glyphicon-align-justify">');
    } else {
        trigger_pad_wrapper.hide();
        sequencer_wrapper.show();
        $("#toggle_pad_sequencer").html('<span class="glyphicon glyphicon-th-large">');
    }
}

function render_sequencer(){

    var cell_classes = [
        'btn btn-disabled btn-primary seq_cell',
        'btn btn-lg btn-success seq_cell',
        'btn btn-lg btn-warning seq_cell',
        'btn btn-lg btn-danger seq_cell'
    ];
    var html = '';
    for (var i=0; i<16; i++){
        var cell_class_idx = Math.floor(i / 4);
        var html_line = '<div class="seq_row">';
        for (var j=0; j<SEQUENCE_LENGTH; j++) {
            var wrapper_class = 'cell_wrapper';
            /*if (j == CURRENT_SEQUENCE_POSITION){
                wrapper_class += ' current_cell';
            }*/

            html_line += '<div id="cell_wrapper_' + i.toString() + '_' + j.toString() + '" class="' + wrapper_class + '"><a id="seq_cell_' + i.toString() + '_' + j.toString() + '" href=javascript:void(0);" class="' + cell_classes[cell_class_idx];
            if (SEQUENCE[i][j] != 'x'){
                html_line += ' my_disabled">&nbsp;</a></div>';
            } else {
                html_line += '">&nbsp;</a></div>';
            }
        }
        html_line += '</div>';
        html += html_line;
    }
    $("#sequencer").html(html);

    for (var i=0; i<16; i++){
        for (var j=0; j<SEQUENCE_LENGTH; j++) {
            var cell = $("#seq_cell_" + i.toString() + "_" + j.toString());
            cell.click(function(event){
                var event_id_parts = event.target.id.split('_');
                var row = parseInt(event_id_parts[event_id_parts.length - 2], 10);
                var col = parseInt(event_id_parts[event_id_parts.length - 1], 10);
                toggle_sequence_element(row,col);
            });
        }
    }
}

function toggle_sequence_element(row, col){
    var cell = $("#seq_cell_" + row.toString() + "_" + col.toString());
    if (SEQUENCE[row][col] != 'x'){
        SEQUENCE[row][col] = 'x';
        cell.removeClass('my_disabled');
    } else {
        SEQUENCE[row][col] = '_';
        cell.addClass('my_disabled');
    }
}


function randomize_sequence(){
    SEQUENCE = create_random_pattern(0.15);
    render_sequencer();
}

function change_sound_prompt(id){

    bootbox.dialog({
      message: render_change_sound_html(id),
      title: "Enter some tags...",

    });
}

function change_sound(id, sid){
    var id = parseInt(id, 10);
    bootbox.hideAll();
    stop_auxiliary_player();
    $('#trigger_' + id).addClass('my_disabled');
    freesound.getSound(sid, function(sound){
        var index = CURRENTLY_CHANGED_ID_BY_TAGS;
        TRIGGERS_SOUND_INFORMATION[index] = {'id':sound.id,
                                         'preview':sound.previews[audio_preview_key],
                                         'name':sound.name,
                                         'license':sound.license,
                                         'username':sound.username,
                                         'description':sound.description,
                                         'created':sound.created
        };
        load_sound(index, sound.previews[audio_preview_key]);
        
        $('#trigger_' + index).attr('disabled', false);
        $('#trigger_' + index).removeClass('my_disabled');
        set_popover_content("trigger_" + index);
        
        CURRENTLY_CHANGED_ID_BY_TAGS = -1;
    });


}

function render_change_sound_html(id){
    var current_tags = TAGS_MODE_CURRENT_TAGS[id];
    if (!current_tags){
        current_tags = ['']
    } else {
        search_in_dialog(id, current_tags);
    }
    var html = "";
    html += '<p style="color:#aaa;text-align:center;">Separate tags using spaces. Click on sound names to select them.</p>'
    html += '<div class="input-group" style="width:320px;margin-left:136px;">';
    html += '<input id="tag_terms" type="text" value="' + current_tags.join(' ') + '" class="form-control" placeholder="tags...">';
    html += '<span class="input-group-btn">';
    html += '<button class="btn btn-default" type="button" onclick="search_in_dialog(' + id + ');">Search!</button>';
    html += '</span>';
    html += '</div><div id="dialog_results"></div>';
    return html;
}

function search_in_dialog(id, tags){
    var query = "";
    var filter = "duration:[0%20TO%201.5]";
    if (license_filter !== undefined) {
        filter += " " + license_filter;
    }

    if (!tags){
        var current_tags = $("#tag_terms").val().split(" ");
    } else {
        var current_tags = tags;
    }

    if (current_tags){
        for (j in current_tags){
            filter += " tag:" + current_tags[j];
        }
    }

    TAGS_MODE_CURRENT_TAGS[id] = current_tags;
    var fields = "id,name,previews,license,username,description,created";
    var page_size = 10;
    CURRENTLY_CHANGED_ID_BY_TAGS = id;
    freesound.textSearch(query, {page:1, filter:filter, fields:fields, page_size:page_size, group_by_pack:1},
        function(sounds){
           var html = "";
           if (sounds.results.length > 0){
               for (i in sounds.results){
                   var sound = sounds.results[i];
                   html += "<div class='result'>";
                   html += "";
                   html += '<button type="button" class="btn btn-default" onclick=play_sound_from_url(\"' + sound.previews[audio_preview_key] + '\");><span class="glyphicon glyphicon-play"></button>';
                   html += "&nbsp;&nbsp;<a href=\"javascript:void(0);\" onclick=\"change_sound(" + CURRENTLY_CHANGED_ID_BY_TAGS + "," + sound.id + ")\">" + sound.name.slice(0,25) + "</a>";
                   html += "&nbsp;&nbsp;<strong>" + sound.username + "</strong>";
                   html += "&nbsp;&nbsp;" + LICENSE_NAMES[sound.license] + "&nbsp;&nbsp;<span style=\"color:#bbb;\">" + sound.created.split("T")[0] + "</span>";
                   html += "</div>";
               }
           } else {
               html += "<div class='result' style='text-align:center;'><p>No results...</p></div>";
           }

           $("#dialog_results").html(html);
        }, function(){console.log("Errors during search...")});
}

function stop_auxiliary_player(){
    AUXILIARY_PLAYER.pause();
}

function play_sound_from_url(url) {
    AUXILIARY_PLAYER.src = url;
    AUXILIARY_PLAYER.autoplay = true;
}

function record(filename){
    lazyInitAudioManager();
    startedRecording = context.currentTime;
    var nBars = parseInt($('#bars_input').val(), 10);
    var bpm = parseInt($('#bpm_input').val(), 10);
    var recordingLengthInSeconds = nBars * 4 * 60.0 / bpm;
    shouldFinishRecording = startedRecording + recordingLengthInSeconds + 0.1;  // Add some extra time to make sure we recorded all samples, then we cut the extra when exporting
    recordingLengthInSamples = recordingLengthInSeconds * 44100;

    if (filename === undefined){
        recordingFilename = 'FLG ' + $("#query_terms").val() + ' ' + Date()  + '.wav';
    } else {
        recordingFilename = filename;
    }
    
    start_recording();
    if (!SEQUENCER_RUNNING){
        CURRENT_SEQUENCE_POSITION = 0; // Restart sequence
        start_sequencer();
        sequencerStartedForRecording = true;
    }
}

function start_recording() {
    $("#record").addClass('my_disabled');
    $("#record").attr('disabled', true);
    $("#record_controls").addClass('recording_animation');
    lazyInitAudioManager();
    isRecording = true;
    am.startRecording();
}

function stop_recording() {
    lazyInitAudioManager();
    $("#record").removeClass('my_disabled');
    $("#record").attr('disabled', false);
    $("#record_controls").removeClass('recording_animation');
    isRecording = false;
    startedRecording = undefined;
    shouldFinishRecording = undefined;
    
    if (sequencerStartedForRecording){
        stop_sequencer();
        sequencerStartedForRecording = false;
    }
    am.stopRecording(recordingFilename, recordingLengthInSamples);
    generate_attribution_file(TRIGGERS_SOUND_INFORMATION, recordingFilename + ' - attribution.txt')

    recordingFilename = undefined;
    recordingLengthInSamples = undefined;
}

function generate_attribution_file(triggers_sound_information, filename){
    var contents = "This audio file was generated using the Freesound Loop Generator\n";
    contents += "https://labs.freesound.org/freemaschine/\n\n";
    contents += "It contains the following Freesound sounds:\n";
    for (var i in triggers_sound_information){
        var sound = triggers_sound_information[i];
        if (sound !== false){
            contents += ' - "' + sound.name + '" by ' + sound.username + ' (' + LICENSE_NAMES[sound.license] + ') - https://freesound.org/s/' + sound.id + '\n';
        }
    }
    var blob = new Blob([contents], {
        type: "text/plain;charset=utf-8;",
    });
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'attribution.txt';

    link.click();
    window.URL.revokeObjectURL(url);

    // This seems to only work in safari
    //var click = document.createEvent("Event");
    //click.initEvent("click", true, true);
    //link.dispatchEvent(click);
}

function generate_new_loops_programatically(query_term, n_variations, bpm, base_filename){

    console.log("Loading sounds for " + query_term)
    $('#bpm_input').val(bpm);
    TEMPO = bpm;

    var nBars = parseInt($('#bars_input').val(), 10);
    var recordingLengthInSeconds = nBars * 4 * 60.0 / bpm;

    if (query_term == "RANDOM"){
        load_from_freesound_random();
    } else if (query_term == "SIMILARITY") {
        load_from_freesound_similarity();
    } else if (query_term === undefined) {
        // Do nothing, use the query term which is already present
    } else {
        $("#query_terms").val(query_term);
        load_from_freesound_text_search();
    }
    
    var nRecordingsDone = 0;
    var intervalTimer = setInterval(function () {
        if (base_filename === undefined) {
            var filename = 'Freesound Loop Generator - ' + query_term + ' - variation ' + (nRecordingsDone + 1) + '.wav';
        } else {
            var filename = base_filename + ' - variation ' + (nRecordingsDone + 1) +  '.wav';
        }
        var sound_ids = [];
        for (var i in TRIGGERS_SOUND_INFORMATION){
            if (TRIGGERS_SOUND_INFORMATION[i]){
                sound_ids.push(TRIGGERS_SOUND_INFORMATION[i].id);
            }
        }
       
        console.log('Generating: ' + filename)
        randomize_sequence();
        record(filename);

        nRecordingsDone += 1;
        if (nRecordingsDone == n_variations) {
            clearInterval(intervalTimer);
        }

    }, (recordingLengthInSeconds + 2) * 1000);
}


function generate_new_loops_programatically_from_list(terms_variations_bpm) {

    // e.g. generate_new_loops_programatically_from_list([["glass", 3, 120, "Glass loops 120bpm"], ["wood", 3, 100, "Wood loops 100bpm"], ["wood", 3, 80, "Wood loops 80bpm"]])
    
    var nBars = parseInt($('#bars_input').val(), 10);

    var accumulatedLengthInSeconds = 0;
    for (var i = 0; i < terms_variations_bpm.length; i++) {
        var query_term = terms_variations_bpm[i][0];
        var n_variations = terms_variations_bpm[i][1];
        var bpm = terms_variations_bpm[i][2];
        var base_filename = terms_variations_bpm[i][3];

        var estimatedLengthInSeconds = ((nBars * 4 * 60.0 / bpm) + 2) * (n_variations + 1) + (n_variations * 2);
        
        console.log("Scheduling variations for " + query_term + " in " + accumulatedLengthInSeconds + " seconds...")
        setTimeout(function (query_term, n_variations, bpm, base_filename) { 
            generate_new_loops_programatically(query_term, n_variations, bpm, base_filename);
        }, accumulatedLengthInSeconds * 1000, query_term, n_variations, bpm, base_filename);

        accumulatedLengthInSeconds += estimatedLengthInSeconds;
    }
}

function render_and_download_flattened_set(filename){

    if (TRIGGERS_SOUND_INFORMATION.length === 0){
        alert("Nothing do download as no sounds have been loaded")
        return;
    }

    if (filename === undefined){
        filename = 'FLG ' + $("#query_terms").val() + ' SET ' + Date() + '.wav';
    }

    var secondsPerSound = 2;
    var sampleRate =  44100;

    var lBuffer = new Float32Array(secondsPerSound * sampleRate * TRIGGERS_SOUND_INFORMATION.length);
    var rBuffer = new Float32Array(secondsPerSound * sampleRate * TRIGGERS_SOUND_INFORMATION.length);

    for (var i in TRIGGERS_SOUND_INFORMATION){
        var trigger = TRIGGERS_SOUND_INFORMATION[i];
        if (trigger !== undefined){
            var startSample = i * secondsPerSound * sampleRate;
            var buffer = am.getBufferByName(trigger['preview']);
            var endSample = startSample + Math.min(buffer.length, secondsPerSound * sampleRate);

            var bufferDataL = buffer.getChannelData(0);
            if (buffer.numberOfChannels > 1){
                var bufferDataR = buffer.getChannelData(1);
            } else {
                var bufferDataR = bufferDataL;
            }

            for (var j=startSample; j<endSample; j++){
                lBuffer[j] = bufferDataL[j - startSample];
                rBuffer[j] = bufferDataR[j - startSample];
            }
        }
    }

    interleaved = interleave(lBuffer, rBuffer);
    var dataview = encodeWAV(interleaved);
    var blob = new Blob([dataview], { type: 'audio/wav' });

    // Download rendered audio
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    link.click();
    window.URL.revokeObjectURL(url);

    setTimeout(function(){
        // Download attribution
        generate_attribution_file(TRIGGERS_SOUND_INFORMATION, filename + ' - attribution.txt')
    }, 100);
}


function export_midi_file(filename){
    contents = "";

    var file = new Midi.File();
    var track = new Midi.Track();
    file.addTrack(track);

    var noteNames = ["c1", "c#1", "d1", "d#1", "e1", "f1", "f#1", "g1", "g#1", "a1", "a#1", "b1", "c2", "c#2", "d2", "d#2"];
    // TODO: iterate over steps one by one, check which notes should be triggered and tigger them with Track.prototype.addChord
    for (var i in SEQUENCE){
        var trigger_sequence = SEQUENCE[i];
        for (var j in trigger_sequence){
            if (trigger_sequence[j] == 'x'){
                track.addNote(0, noteNames[i], 64, time, velocity);
            }
        }
    }

    const bytes = file.toBytes();
    const b64 = btoa(bytes);
    const url = 'data:audio/midi;base64,' + b64;
    const link=document.createElement('a');
    link.href = url;
    link.download = filename || 'sequence.mid';
    link.click();
    window.URL.revokeObjectURL(url);
}