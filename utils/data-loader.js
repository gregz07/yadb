const ytch = require('yt-channel-info')

let loadingDone = false;
let data = [];

module.exports.finishedLoading = () => loadingDone;

module.exports.init = () => {
  raws = await Promise.all(
    [
      ytch.getChannelVideos('UCItHdUEqlpfvDlcCeyZwH6w'),
      ytch.getChannelVideos('UCW0gH2G-cMKAEjEkI4YhnPA')
    ]
  );
  
  if (raws) {
    data.push(raws.map(r => r.items));
    continuation(raws.map(r => r.continuation));
  }
}

function continuation(continuations) {
  if (!continuations || continuations.length === 0) {
    loadingDone = true;
    return;
  }

  raws = await Promise.all(
    [
      continuations.map(cid => () => ytch.getChannelVideosMore(cid)) 
    ]
  );
  
  if (raws) {
    data.push(raws.map(r => r.items));
    continuation(raws.map(r => r.continuation));
  }
}