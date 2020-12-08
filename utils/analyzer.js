const yts = require('yt-search')
const storyTeller = require('config').get('story-teller');

module.exports = async function(query) {
  let result = await yts(query);
  let possibleVideos = result.videos.filter(v => storyTeller.channels.includes(v.author.name));

  if (!possibleVideos || possibleVideos.length == 0) {
    throw new Error('No stories were found..');
  }

  return possibleVideos[Math.floor(Math.random() * possibleVideos.length)].url;
}

