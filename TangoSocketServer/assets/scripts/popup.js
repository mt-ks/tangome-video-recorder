//var socket = io.connect('http://192.168.3.3:3131');

async function play_stream(url) {
  var video = document.getElementById('video');
  var m3u8Url = decodeURIComponent(url);

  if (Hls.isSupported()) {
    var hls = new Hls();
    await hls.loadSource(m3u8Url);
    await hls.attachMedia(video);
    await hls.on(Hls.Events.MANIFEST_PARSED, function (data, type) {
      console.log(data);
      console.log(type);
      setTimeout(() => {
        video.play();
      }, 1000);
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

$(function () {
  play_stream(
    'http://192.168.3.3:5500/assets/videos/-Tb3AU7I_g8bbEmQGqEQNA/player.m3u8'
  );
  $('button#refresh').on('click', function () {
    chrome.runtime.sendMessage('kuztrinken');
  });
});
