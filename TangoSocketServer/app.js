var fs = require('fs');
require('dotenv').config();
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const https = require('https');

var streamsx = {};

app.get('/', async (req, res) => {
  return res.send({ streams: streamsx });
});

io.on('connection', (socket) => {
  console.log('a client connected');
  videoProcessController();

  socket.on('streamInfo', (data) => {
    const details = data.data.body.details;
    const streamDetails = data.data.body.details.stream;
    const streamId = streamDetails.id;
    const encrpytedAccountId = streamDetails.encryptedAccountId;
    const thumbnail = streamDetails.thumbnail;
    const source = details.source;
    const tags = details.tags;
    const title = streamDetails.title;

    if (streamsx[streamId] != null) {
      return;
    }

    const createdAt = Math.floor(Date.now() / 1000);
    const updatedAt = Math.floor(Date.now() / 1000);
    const stream = {
      streamId,
      encrpytedAccountId,
      thumbnail,
      source,
      title,
      tags,
      streamerInfo: {},
      createdAt,
      updatedAt,
    };
    streamsx[streamId] = stream;
  });

  socket.on('streamVideo', async (data) => {
    const streamLink = data.data.streamLink;
    const streamId = streamLink.replace(
      'https://tango.me/stream/',
      ''
    );
    if (!streamLink.includes('tango.me')) {
      return;
    }
    const videoUrl = data.data.url;
    console.log(videoUrl);
    if (!videoUrl.includes('.ts')) {
      return;
    }
    const regex = /(.*)\/(.*).ts/is;
    const parseFileName = videoUrl.match(regex);

    const fileName = parseFileName[2] + '.ts';
    const downloadDir = process.env.SAVE_DIR + `${streamId}/`;
    const downloadFullPath = downloadDir + fileName;
    const m3u8filePath = downloadDir + 'player.m3u8';

    if (!fs.existsSync(m3u8filePath)) {
      const m3u8FileStream = fs.createWriteStream(m3u8filePath);
      m3u8FileStream.write(m3u8Template());
      m3u8FileStream.close();
    }

    const dirExists = fs.existsSync(downloadDir);
    if (!dirExists) {
      fs.mkdirSync(downloadDir);
    }

    var videoFile = fs.createWriteStream(downloadFullPath);

    https.get(videoUrl, function (response) {
      response.pipe(videoFile);
      videoFile.on('finish', function () {
        appendVideoToM3U8(streamId, m3u8filePath, fileName);
        videoFile.close();
      });
    });

    if (
      streamsx[streamId] != null &&
      streamsx[streamId] != undefined
    ) {
      const updatedAt = Math.floor(Date.now() / 1000);
      streamsx[streamId].updatedAt = updatedAt;
    }
  });

  // Store streamer info.
  socket.on('userInfo', (data) => {
    const streamerId = data.data.body?.encryptedAccountId;
    if (streamerId == null) {
      return;
    }
    Object.entries(streamsx).forEach((element) => {
      const encId = element[1].encrpytedAccountId;
      console.log(`${streamerId} -> ${encId}`);
      if (encId == streamerId) {
        console.log('settt');
        const basicProfile = data.data.body.basicProfile;
        const profileDetails = data.data.body.profileDetails;
        streamsx[element[1].streamId].streamerInfo = {
          name: basicProfile.firstName,
          profilePictureUrl: basicProfile.profilePictureUrl,
          country: profileDetails.iso2CountryCode,
          birthday: profileDetails.birthday,
          status: profileDetails.status,
        };
      }
    });
  });

  function videoProcessController() {
    setInterval(() => {
      Object.entries(streamsx).forEach((element) => {
        const lastUpdate = element[1].updatedAt;
        const currentDate = Math.floor(Date.now() / 1000);

        if (currentDate - lastUpdate > 6) {
          delete streamsx[element[1].streamId];
        }
      });
    }, 3000);
  }
});

function appendVideoToM3U8(streamId, m3u8filePath, videoName) {
  console.log(streamId, m3u8filePath, videoName);

  const m3u8FileContent = fs.readFileSync(m3u8filePath, {
    encoding: 'utf8',
  });
  if (m3u8FileContent == null || m3u8FileContent == '') {
    return;
  }
  const split = m3u8FileContent.split(m3u8Template());
  console.log(m3u8FileContent);
  const allVideos = split[1].split('\n').filter((url) => {
    return url != '';
  });

  allVideos.push(videoName);

  const fileContent = m3u8Template() + allVideos.join('\n');
  var file = fs.createWriteStream(m3u8filePath);
  file.write(fileContent);
  file.close();
}

function getVideoFilePath(streamId, videoName) {
  return process.env.SAVE_DIR + streamId + '/' + videoName;
}

function m3u8Template() {
  return '#EXTM3U\n#EXT-X-VERSION:7\n#EXT-X-MEDIA-SEQUENCE:3975\n#EXT-X-TARGETDURATION:1\n#EXT-X-PROGRAM-DATE-TIME:2023-10-02T15:08:57.049Z\n#EXTINF:1.034,\n';
}

server.listen(3131);
