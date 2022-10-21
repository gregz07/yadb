const { Client } = require('youtubei');
const config = require('config');

const youtube = new Client();

let data = [];
const statuses = {
  idle: 'IDLE',
  buffering: 'BUFFERING',
  ready: 'READY'
};
let dataStatus = statuses.idle;

async function findVideos (key) {
  if (dataStatus === statuses.idle) {
    return "Call 'init' first";
  } 
  
  if (dataStatus === statuses.buffering) {
    return "Wait for initialization to finish. Call getStatus() for updates";
  }

  let results = data.filter(v => v.title.toLowerCase().includes(key.toLowerCase()));

  return results.map(v => mapVideo(v));
}

async function loadVideoLibrary() {
  dataStatus = statuses.buffering;
  const availableChannels = config.get('story-teller').channels;
  
  for (let i = 0; i < availableChannels.length; ++i) {
    const channel = availableChannels[i];
    const channelInfo = await youtube.findOne(channel, { type: 'channel' });
    await channelInfo.videos.next(0);
    data.push(...channelInfo.videos.items);
  }
}

function init() {
  loadVideoLibrary()
  .then(_ => dataStatus = statuses.ready)
  .catch(err => {
    console.error(err);
    data = [];
    dataStatus = statuses.idle;
  });
}

function getStatus() {
  return dataStatus;
}

function mapVideo(video) {
  return {
    id: video.id,
    channel: video.channel.name,
    duration: video.duration
  }
}

init();

module.exports.getStatus = getStatus;
module.exports.findVideos = findVideos;
module.exports.databaseStatus = statuses;