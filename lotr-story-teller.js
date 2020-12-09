const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const analyzer = require('./utils/analyzer');
const commandParser = require('./utils/command-parser');
const print = require('./utils/print');

// Local configs
const embededToken = require('config').get('bot_token');
const prefix = require('config').get('prefix');

// private vars
const _bot = new Discord.Client();
let connection = undefined;
let storyTime = false;
dispatcher = undefined;

_bot.once('ready', () => {
	console.log('Ready!');
});

_bot.on('message', async function(message){
  let [lotr, ...args] = message.content.split(' ');
  args = args.join(' ');

  if (!lotr || lotr !== prefix) {
    return; // Ignore any command
  }
  
  let channel = message.channel;

  if (!message.member.voice.channel) {
    print(channel, "ERR_NOT_IN_VOICE_CHANNEL");
    return;
  }

  if (!connection) {
    connection = await message.member.voice.channel.join();
  }

  if (storyTime) {
    print(channel, "ERR_STORY_UNDERWAY");
    return;
  }

  try {
    let query = commandParser(args);
    // Find our story 
    let storyUrl = await analyzer(query);
    // Story time
    const dispatcher = connection.play(ytdl(storyUrl, {filter: 'audioonly'}));
    dispatcher.on('start', function() {
      print(channel, "STORY_STARTING");
      storyTime = true;
    });
    dispatcher.on('finish', function() {
      print(channel, "STORY_ENDED");
      storyTime = false;
    });
  } catch(err) {
    print(channel, err.message);
    return;
  }
});

_bot.login(fs.readFileSync(embededToken, 'utf-8'));