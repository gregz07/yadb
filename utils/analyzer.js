
const storyTeller = require('config').get('story-teller');

module.exports = async function(query) {

  // let result = await yts(query.text); 

  // let possibleVideos = result.videos.filter(by(query)['channel']);

  // if (query.options.maxduration) {
  //   possibleVideos = possibleVideos.filter(by(query)['duration']);
  // }

  // if (!possibleVideos || possibleVideos.length == 0) {
  //   throw new Error('No stories were found..');
  // }

  // return possibleVideos[Math.floor(Math.random() * possibleVideos.length)].url;
}

function by(query) {
  return {
    'channel': 
      (v) => query.options.channel ? v.author.name.toLowerCase().trim() == query.options.channel.toLowerCase().trim() : storyTeller.channels.includes(v.author.name),
    'duration': 
      (v) => v.seconds <= query.options.maxduration
  } 
}