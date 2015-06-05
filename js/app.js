var audioCtx       = new (window.AudioContext || window.webkitAudioContext)(),
    request        = new XMLHttpRequest(),
    url            = 'https://random-art.herokuapp.com/',
    painting       = document.getElementsByClassName('painting')[0],
    background     = document.getElementsByClassName('background')[0],
    artTitle       = document.getElementsByClassName('art-title')[0],
    artCreator     = document.getElementsByClassName('art-creator')[0],
    artDescription = document.getElementsByClassName('art-description')[0],
    artLocation    = document.getElementsByClassName('art-location')[0],
    artImage       = document.getElementsByClassName('art-image')[0],
    artLink        = document.getElementsByClassName('art-link')[0],
    red            = [],
    green          = [],
    blue           = [],
    source         = audioCtx.createBufferSource()

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

// Stereo
var channels = 3
// Create an empty two second stereo buffer at the
// sample rate of the AudioContext
var frameCount = audioCtx.sampleRate * 2.0

function processImageData(imgData) {
  var i   = 0,
      l   = imgData.length,
      arr = []

  for (; i < l; i = i + 4) {
    arr.push(((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3 - 128) / 128)
    red.push((imgData[i] - 128) / 128)
    green.push((imgData[i + 1] - 128) / 128)
    blue.push((imgData[i + 2] - 128) / 128)
  }

  console.log(red.length)

  var myArrayBuffer = audioCtx.createBuffer(channels, red.length, 22050)
  var gainNode = audioCtx.createGain()

  for (var channel = 0; channel < channels; channel++) {
   // This gives us the actual ArrayBuffer that contains the data
   var nowBuffering = myArrayBuffer.getChannelData(channel)
   for (var i = 0; i < red.length; i++) {
    // audio needs to be in [-1.0; 1.0]
    if (!channel) { 
      nowBuffering[i] = red[i]
    } else if (channel === 1) {
      nowBuffering[i] = green[i]
    } else {
      nowBuffering[i] = blue[i]
    }
   }
  }

  // Get an AudioBufferSourceNode.
  // This is the AudioNode to use when we want to play an AudioBuffer
  var source = audioCtx.createBufferSource()
  // set the buffer in the AudioBufferSourceNode
  source.buffer = myArrayBuffer
  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  source.connect(audioCtx.destination)
  source.connect(gainNode)
  // start the source playing
  source.start()

  /*console.log(red)
  console.log(green)
  console.log(blue)*/
}

function getImageData(img) {
  var canvas    = document.createElement('canvas')
  canvas.width  = img.width
  canvas.height = img.height

  var ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)
  return ctx.getImageData(0, 0, img.width, img.height)
}

request.onreadystatechange = function() {
  if (request.readyState === 4 && request.status === 200) {
    var art = JSON.parse(request.responseText)
    
    background.style.backgroundImage = 'url(' + art.image + ')'
    painting.src = art.image
    painting.crossOrigin = 'Anonymous'

    painting.addEventListener('load', function() {
      var imgData = getImageData(painting)
      processImageData(imgData.data)
    })

    artTitle.innerHTML         = art.title
    
    if (art.date)
      artTitle.innerHTML       = artTitle.innerHTML + ' (' + art.date + ')'
    
    if (art.creator)
      artCreator.innerHTML     = '<span>Artist:</span> ' + art.creator
    
    if (art.description)
      artDescription.innerHTML = '<span>Description:</span> ' + art.description
    
    if (art.location)
      artLocation.innerHTML    = '<span>Location:</span> ' + art.location

    artImage.innerHTML         = '<span>Full image:</span> <a href="' + art.image + '" target=_blank>' + art.image + '</a>'

    artLink.innerHTML          = '<span>Source:</span> <a href="' + art.link + '" target=_blank>Google Art Project</a>'
  }
}

request.open('GET', url, true)
request.send()
