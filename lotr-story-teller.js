const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
const config = require('config');
const analyzer = require('./utils/analyzer');
const commandParser = require('./utils/command-parser');
const print = require('./utils/print');

// Local configs
const embededToken = path.resolve(config.get('bot_token'));
const prefix = config.get('prefix');

let bot = new Discord.Client();
let instances = [];

bot.once('ready', () => {
  console.log('Im up Im up!');
});

bot.on('message', async (message) => {
  if (!message.member.voice.channel) {
    print(channel, "ERR_NOT_IN_VOICE_CHANNEL");
    return;
  }

  let [lotr, ...args] = message.content.split(' ');
  args = args.join(' ');
  
  if (!lotr || lotr !== prefix) {
    return; // Ignore any command
  }

  // setup a new connection
  let channel = message.channel;

  if ((conn = instances.find(i => i.channelId === channel.id))) {
    // Returns null, posted an issue in discord.js waiting for feedback
    if (!conn.storyTeller.voice.speaking) {
      try {
        let query = commandParser(args);
        // Find our story 
        let storyUrl = await analyzer(query);
        // Story time
        const dispatcher = storyTeller.play(ytdl(storyUrl, {filter: 'audioonly'}));
        
        dispatcher.on('start', function() {
          print(channel, "STORY_STARTING");
        });
    
        dispatcher.on('finish', function() {
          print(channel, "STORY_ENDED");
        });
      } catch(err) {
        print(channel, err.message || err);
        return;
      }
    } else {
      print(channel, "ERR_STORY_UNDERWAY");
      return;
    }
  }
  else {
    let storyTeller = await message.member.voice.channel.join();
    
    try {
      let query = commandParser(args);
      // Find our story 
      let storyUrl = await analyzer(query);
      // Story time
      const dispatcher = storyTeller.play(ytdl(storyUrl, {filter: 'audioonly'}));
      
      dispatcher.on('start', function() {
        print(channel, "STORY_STARTING");
      });
  
      dispatcher.on('finish', function() {
        print(channel, "STORY_ENDED");
      });
    } catch(err) {
      print(channel, err.message || err);
      return;
    }

    instances.push({
      storyTeller: storyTeller,
      channelId: channel.id,
    });
  }
});

bot.on('disconnect', (evt) => console.log(`Bot disconnected`));

bot.login(fs.readFileSync(embededToken, 'utf-8'));

