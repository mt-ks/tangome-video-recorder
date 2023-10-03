const fs = require('fs');
const m3u8filePath =
  __dirname + '/assets/videos/f5XXWGeX_BEJdlnVLc9LVQ/player.m3u8';
const m3u8FileContent = fs.readFileSync(m3u8filePath, {
  encoding: 'utf8',
});
console.log(m3u8FileContent);
const split = m3u8FileContent.split(m3u8Template());
const videos = split[1].split('\n').slice(-7);
const vcs = videos.filter((element) => {
  return element != '';
});
console.log(vcs);
vcs.push('3131.ts');
const joinn = vcs.join('\n');

console.log(m3u8Template() + joinn);

function m3u8Template() {
  return '#EXTM3U\n#EXT-X-VERSION:7\n#EXT-X-MEDIA-SEQUENCE:3975\n#EXT-X-TARGETDURATION:1\n#EXT-X-PROGRAM-DATE-TIME:2023-10-02T15:08:57.049Z\n#EXTINF:1.034,\n';
}
