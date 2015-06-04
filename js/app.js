var request        = new XMLHttpRequest()
var url            = 'https://random-art.herokuapp.com/'
var painting       = document.getElementsByClassName('painting')[0]
var background     = document.getElementsByClassName('background')[0]
var artTitle       = document.getElementsByClassName('art-title')[0]
var artCreator     = document.getElementsByClassName('art-creator')[0]
var artDescription = document.getElementsByClassName('art-description')[0]
var artLocation    = document.getElementsByClassName('art-location')[0]
var artImage       = document.getElementsByClassName('art-image')[0]
var artLink        = document.getElementsByClassName('art-link')[0]

function getImageData(img) {
  console.log(img, img.width, img.height)
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

    var imgData
    painting.addEventListener('load', function() {
      imgData = getImageData(painting)
      console.log(imgData)
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
