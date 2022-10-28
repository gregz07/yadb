const { Client } = require('youtubei');
const config = require('config');

const youtube = new Client({
  initialCookie: 'CONSENT=YES+PT.pt+201908; APISID=67YEf6cwh9qP6WaK/Ai5GcBK4rkZwB3fxP; SAPISID=uOEoY3BnW86Lw_PM/AFvFcrkhhKTXZfif_; __Secure-1PAPISID=uOEoY3BnW86Lw_PM/AFvFcrkhhKTXZfif_; __Secure-3PAPISID=uOEoY3BnW86Lw_PM/AFvFcrkhhKTXZfif_; SID=PQjTfMtldzMSZc8IViXN1i0zudvNQZOlTArnsLraPsCeOlrs75E_AnhWb9_Ei6HdXMu1sQ.; PREF=tz=Europe.Lisbon&f5=30000; SIDCC=AIKkIs3IgIr6LucmT-YmdQayZgZZ_Xcli4YIOI-2g4HqS-OeJM7AIrse83LNpIVKBKxlN5ShkYk'
});

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

  console.log("Searching with key: " + key);
  console.log("Current db:");
  console.log(data.length);

  let results = data.filter(v => v.title.toLowerCase().includes(key.toLowerCase()));

  return results.map(v => mapVideo(v));
}

async function loadVideoLibrary() {
  dataStatus = statuses.buffering;
  const availableChannels = config.get('story-teller').channels;
  
  let channels = await Promise.allSettled(
    availableChannels.map(ch => youtube.findOne(ch, { type: 'channel' }))
  );

  for (let i = 0; i < channels.length; ++i) {
    if (channels[i].status === "fulfilled") {
      const channelInfo = channels[i].value;
      try {
        await channelInfo.videos.next();
        await channelInfo.videos.next();
        await channelInfo.videos.next();
        await channelInfo.videos.next();
        await channelInfo.videos.next();
        data.push(...channelInfo.videos.items);
      } catch(err) {
        console.error(err);
        console.log(channelInfo);
        console.log(channelInfo.videos);
      }
    } else {
      console.log(channels[i].reason)
    }
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