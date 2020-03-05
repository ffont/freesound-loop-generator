
var Sampler = function() {
  loadSounds(this, {
    slot1: 'http://www.freesound.org/data/previews/77/77302_1105584-hq.mp3',
    slot2: 'http://www.freesound.org/data/previews/264/264459_4772241-hq.mp3',
    slot3: 'http://www.freesound.org/data/previews/44/44946_236326-hq.mp3'//'static/sounds/44946__sascha-burghard__hihat-cl-c3000b-10.wav'
  });
};

Sampler.prototype.playSoundByName = function(name, time) {
  if (time == undefined){
    time = 0;
  }
  playSound(this[name], time);
}

Sampler.prototype.changeVolume = function(element) {
  var volume = element.value;
  var fraction = parseInt(element.value) / parseInt(element.max);
  context.gainNode.gain.value = fraction * fraction;
};

var current16thNote = 0;
var tempo = 60;
var timeoutId;
var startTime;
var noteTime = 0.0;
var lastDrawTime = -1;
var sampler = new Sampler();
document.querySelector('button').addEventListener('click', function() {
  handlePlay();
});

var SEQUENCE = {
  'slot1': [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
  'slot2': [0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],
  'slot3': [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
}

function nextNote() {
  // Advance current note and time by a 16th note...
  var secondsPerBeat = 60.0 / tempo;  // picks up the CURRENT tempo value!
  noteTime += 0.25 * secondsPerBeat;  // Add 1/4 of quarter-note beat length to time

  current16thNote++;  // Advance the beat number, wrap to zero
  if (current16thNote == 16) {
    current16thNote = 0;
  }
}

function schedule() {
    var currentTime = context.currentTime;

    // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
        // Convert noteTime to context time.
        var contextPlayTime = noteTime + startTime;

        for (slot in SEQUENCE){
          if (SEQUENCE[slot][current16thNote]){
            sampler.playSoundByName(slot, contextPlayTime)
          }
        }
        
        // Attempt to synchronize drawing time with sound
        if (noteTime != lastDrawTime) {
            lastDrawTime = noteTime;
            drawPlayhead((current16thNote + 15) % 16);
        }

        nextNote();
    }

    timeoutId = setTimeout(schedule, 50);
}

function drawPlayhead(xindex) {
    document.getElementById("step_indicator").innerHTML = xindex;
}


function handlePlay(event) {
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    schedule();
}

