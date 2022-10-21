const { Client, Events, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
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

// private vars
const _bot = new Client({ intents: [
    GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]});
let connection = undefined;
let storyTime = false;

_bot.once('ready', () => {
  console.log(process.ppid);
	console.log('Ready!');
});

_bot.on(Events.MessageCreate, async function(message){
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
    connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: false
    });
  }

  if (storyTime) {
    print(channel, "ERR_STORY_UNDERWAY");
    return;
  }

  try {
    let query = commandParser(args);
    // Find our story 
    let storyUrl = await analyzer(query);
    
    // Setup
    let player = createAudioPlayer();
    let resource = createAudioResource(ytdl(storyUrl, {
      filter: "audioonly",
      fmt: "mp3",
      highWaterMark: 1152921504606846976,
      dlChunkSize: 0, // disabling chunking is recommended in discord bot
      bitrate: 128,
      quality: "lowestaudio"
    }));
    player.play(resource);
    connection.subscribe(player);
    
    player.on(AudioPlayerStatus.Playing, (oldState, _) => {
      if (oldState.status === AudioPlayerStatus.Buffering) {
        print(channel, "STORY_STARTING");
        storyTime = true;
      }
    });

    player.on(AudioPlayerStatus.Idle, (oldState, _) => {
      if (oldState.status === AudioPlayerStatus.Playing) {
        print(channel, "STORY_ENDED");
        storyTime = false;
      }
    });

    player.on('stateChange', (oldState, newState) => {
      console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
      if (newState.onStreamError) {
        console.error(newState.onStreamError);
      }
    });

    player.on('error', error => {
      console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
      player.pause();
      setTimeout(player.unpause(), 5000);
      print(channel, "Trying to resume audio...");
    });

  } catch(err) {
    console.error(err);
    print(channel, err.message || err);
    return;
  }
});

_bot.on('disconnect', function(evt) {
  console.log("disconnected")
})

_bot.login(fs.readFileSync(embededToken, 'utf-8'));