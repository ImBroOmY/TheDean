const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { autoDeployCommands, token } = require('./config.json');

console.log("⏳ Started loading the bot.");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.GuildModeration] });

//Functions
const functionsPath = path.join(__dirname, 'functions');
const functionFiles = fs.readdirSync(functionsPath).filter(file => file.endsWith('.js'));
for (const file of functionFiles) {
	const filePath = path.join(functionsPath, file);
	const functions = require(filePath);
	functions(client);
}

//Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

//Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

if (autoDeployCommands) client.deployCommands();

client.login(token);