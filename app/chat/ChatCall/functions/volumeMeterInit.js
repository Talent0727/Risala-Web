export default function volumeMeterInit(stream, target, purpose){
  var audioContext = new AudioContext();
  var analyser = audioContext.createAnalyser();
  var microphone = audioContext.createMediaStreamSource(stream);
  var javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
  analyser.smoothingTimeConstant = 0.8;
  analyser.fftSize = 1024;

  microphone.connect(analyser);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);

  javascriptNode.onaudioprocess = function() {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var values = 0;
    var length = array.length;

    for (var i = 0; i < length; i++) {
      values += (array[i]);
    }

    var average = Math.floor(values / length);
    var value = (200 + (200 * (average / 100)))
    
    //console.log(average)
    if(purpose === "call" && target){
      target.style.cssText = `width: ${value}px; height: ${value}px;`
    } else if(purpose === "video" && target){
      if(value > 0){
        target.classList.add('audio')
      } else {
        target.classList.remove('audio')
      }
    }
  }
}