var socket = io.connect('http://localhost:3131');

chrome.runtime.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  console.log(request.message);
  if (request.message == 'streamInfo') {
    socket.emit('streamInfo', request);
  }
  if (request.message == 'streamVideo') {
    socket.emit('streamVideo', request);
  }
  if (request.message == 'userInfo') {
    socket.emit('userInfo', request);
  }
});
