const { getStatus, findVideos, databaseStatus } = require('./youtubei');

module.exports = async function(query) {

  while(getStatus() !== databaseStatus.ready) {
    await sleep(2000);
  }

  let possibleVideos = await findVideos(query.text);

  if (query.options.channel) {
    possibleVideos = possibleVideos.filter(by(query.options)['channel']);
  }

  if (query.options.maxduration) {
    possibleVideos = possibleVideos.filter(by(query.options)['duration']);
  }

  if (!possibleVideos || possibleVideos.length == 0) {
    throw new Error('No stories were found..');
  }
  
  let chosenVideo = possibleVideos[Math.floor(Math.random() * possibleVideos.length)];

  return "https://www.youtube.com/watch?v=" + chosenVideo.id;
}

function by(options) {
  return {
    'channel': 
      (v) => v.channel.toLowerCase().trim() == options.channel.toLowerCase().trim(),
    'duration': 
      (v) => v.duration <= options.maxduration
  } 
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}