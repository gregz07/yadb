module.exports = function(channel, text) {
  let txtMessage = messages[text] || text;
  channel.send(txtMessage);
}

const messages = {
  "STORY_STARTING": "Lets listen..",
  "STORY_ENDED": "Hope you liked it..",
  "ERR_NOT_IN_VOICE_CHANNEL": "You must be in a voice channel to listen to lotr-story-teller!",
  "ERR_STORY_UNDERWAY": "Shhhh.. Finish your story."
}