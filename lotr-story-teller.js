const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const embededToken = require('config').get('bot_token');

client.once('ready', () => {
	console.log('Ready!');
});

client.login(fs.readFileSync(embededToken, 'utf-8'));