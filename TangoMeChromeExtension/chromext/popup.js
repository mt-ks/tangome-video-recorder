function play_stream(url) {
  var video = document.getElementById('video');
  var m3u8Url = decodeURIComponent(url);

  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(m3u8Url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
    });
    hls.on(Hls.Events.BUFFER_APPENDING, function (parent, type) {
      console.log(parent);
      console.log(type);
      //chrome.runtime.sendMessage({ parent, type });
      // socket.emit('videoStream', { parent, type });
    });

    document.title = url;
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    console.log('orrrrrr');
    video.src = m3u8Url;
    video.addEventListener('loadedmetadata', function () {
      video.play();
    });
    document.title = url;
  }
}

var url = window.location.href.split('#')[1];

$(function () {
  $('button#refresh').on('click', function () {
    chrome.runtime.sendMessage('kuztrinken');
  });
});
