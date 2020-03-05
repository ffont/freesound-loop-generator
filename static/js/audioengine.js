// audioengine.js
// Simple utility wrapper around some Web Audio API features to be able to
// quickly build applications which play sound using the Web Audio API.
// To use this functions include audioengine.js and use the AudioManager "am" 
// variable like:
//    am = initAudioManager();
//    am.playSoundFromURL("http://sound.org/example.ogg")
//    am.setMainVolume(0.5)
// If playing a sound which was already played in the future, the AudioManager
// object will keep the buffer and reuse the data.

var audioengine_verbose = false;
function log(message) {
  if (audioengine_verbose) {
    console.log(message)
  }
}


// "Private" interface (don't use these methods directly outside audioengine.js)
const recbufferLen = 4096;
var rec = undefined;

function startAudioContext() {
  context = new (window.AudioContext || window.webkitAudioContext)();
  if (!context.createGain)
    context.createGain = context.createGainNode;
  context.gainNode = context.createGain();
  if (!context.createScriptProcessor) {
    context.recNode = context.createJavaScriptNode(recbufferLen, 2, 0);
  } else {
    context.recNode = context.createScriptProcessor(recbufferLen, 2, 0);
  }
  context.gainNode.connect(context.destination);

  rec = new Recorder(context.gainNode, {  // init recorder
    bufferLen: recbufferLen
  })
}

function playBuffer(buffer, time, options) {
  const source = context.createBufferSource();
  source.buffer = buffer;

  connected = false;
  if (options !== undefined) {
    if (options.loop) {
      source.loop = options.loop;
    }
    if (options.onended) {
      source.onended = options.onended;
    }
    if (options.panHRTF) {
      const panner = context.createPanner();
      panner.panningModel = "HRTF"
      panner.distanceModel = "inverse"
      panner.setPosition(options.panHRTF.x, options.panHRTF.y, options.panHRTF.z);
      source.connect(panner);
      panner.connect(context.gainNode);
      connected = true;
    }
  }

  if (!connected) {
    // If source was not connected to master gain node because of options, connect now
    source.connect(context.gainNode);
  }
  source.start(time);
  return source;
}

function loadSounds(obj, soundMap, callback) {
  // Array-ify
  var names = [];
  var paths = [];
  for (var name in soundMap) {
    var path = soundMap[name];
    names.push(name);
    paths.push(path);
  }
  bufferLoader = new BufferLoader(context, paths, function (bufferList) {
    for (var i = 0; i < bufferList.length; i++) {
      var buffer = bufferList[i];
      var name = names[i];
      obj[name] = buffer;
    }
    if (callback) {
      callback();
    }
  });
  bufferLoader.load();
}

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function () {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function (buffer) {
        if (!buffer) {
          log('Error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function (error) {
        log('DecodeAudioData error: ' + error);
      }
    );
  }

  request.onerror = function () {
    log('BufferLoader: XHR error');
  }

  request.send();
};

BufferLoader.prototype.load = function () {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
};

// Public interface (AudioManager object)

var AudioManager = function () { };

AudioManager.prototype.loadSound = function (url, onLoadedCallback) {
  log('Loading: ' + url);
  var name = url;
  var soundMap = {}
  soundMap[name] = url
  loadSounds(this, soundMap, function () {
    onLoadedCallback(name);
  });
}

var BUFFER_NODES = [];
AudioManager.prototype.playBufferByName = function (name, time, options) {
  log('Playing: ' + name);
  if (time === undefined) { time = 0; }
  if (name in this) {
    var buffer_node = playBuffer(this[name], time, options);
    BUFFER_NODES.push({ name: name, node: buffer_node })
  } else {
    log('Error: "' + name + '" buffer not loaded!')
  }
}

AudioManager.prototype.getBufferByName = function (name) {
  if (name in this) {
    return this[name];
  } else {
    log('Error: no buffer with name "' + name + '"')
  }
}

AudioManager.prototype.getBufferList = function (value) {
  var buffers = [];
  for (var key in this) {
    if (this[key] instanceof AudioBuffer) {
      buffers.push(key);
    }
  }
  return buffers;
}

AudioManager.prototype.playSoundFromURL = function (url, time, options) {
  if (time === undefined) { time = 0; }
  if (url in this) { // If sound is already loaded, just play it
    AudioManager.prototype.playBufferByName(url, time, options);
  } else { // If sound has not been loaded, load it and play afterwards
    AudioManager.prototype.loadSound(url, function () {
      AudioManager.prototype.playBufferByName(url, time, options);
    })
  }
}

AudioManager.prototype.setMainVolume = function (value) {
  // value should be in range [0, 1]
  if (value > 1.0) {
    value = 1.0;
  } else if (value < 0) {
    value = 0.0;
  }
  context.gainNode.gain.value = value;
}

AudioManager.prototype.stopAllBufferNodes = function (disableOnEnded, hardStop, removeBuffers) {
  for (i = 0; i < BUFFER_NODES.length; i++) {
    if (disableOnEnded) {
      BUFFER_NODES[i].node.onended = undefined; // Set onended call to undefined just in case it is set  
    }
    if (hardStop) {
      BUFFER_NODES[i].node.stop();
    }
  }
  BUFFER_NODES = [];

  if (removeBuffers) {
    var bufferList = this.getBufferList();
    for (i in bufferList) {
      this[bufferList[i]] = undefined; // remove actual buffer data from audio manager  
    }
  }
}

AudioManager.prototype.stopBufferNodesForSound = function (name, disableOnEnded, hardStop, removeBuffer) {
  log('Removing buffer nodes for sound: ' + name);
  NEW_BUFFER_NODES = [];
  for (i in BUFFER_NODES) {
    if (BUFFER_NODES[i].name !== name) {
      NEW_BUFFER_NODES.push(BUFFER_NODES[i]);
    } else {
      if (disableOnEnded) {
        BUFFER_NODES[i].node.onended = undefined; // Set onended call to undefined just in case it is set    
      }
      if (hardStop) {
        BUFFER_NODES[i].node.stop();
      }
    }
  }
  BUFFER_NODES = NEW_BUFFER_NODES;

  if (removeBuffer) {
    this[name] = undefined; // remove actual buffer data from audio manager  
  }
}

AudioManager.prototype.getAllUniqueBufferNodesList = function (value) {
  var keys = [];
  for (var item in BUFFER_NODES) {
    var key = BUFFER_NODES[item].name;
    if (keys.indexOf(key) === -1) {
      keys.push(key);
    }
  }
  return keys;
}

AudioManager.prototype.startRecording = function () {
  rec.record();
}

AudioManager.prototype.stopRecording = function (downloadFilename, maxLength) {
  rec.stop();

  rec.exportWAV(function (audioBlob) {
    Recorder.forceDownload(audioBlob, downloadFilename);
    rec.clear();
  }, maxLength);
}

// Initialize things
function initAudioManager() {
  log('Initializing audio context and audio manager')
  startAudioContext();
  return new AudioManager();
}


/* Audio processing utils, copied from recorder.js */

function interleave(inputL, inputR) {
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
      inputIndex = 0;

  while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input) {
  for (var i = 0; i < input.length; i++ , offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string) {
  for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples) {
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);
  var numChannels = 2;
  var sampleRate = 44100;

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}
