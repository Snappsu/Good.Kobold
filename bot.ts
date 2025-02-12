
// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Emoji, Client, Collection, Events, GatewayIntentBits ,ActivityType } = require('discord.js');
require('dotenv').config()
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function setBotPresence(arguments){
  
  var activityData;
  switch (arguments["type"]){
    case "playing": 
      activityData = { 
        name: arguments["text"], 
        type: ActivityType.Playing,
        url: arguments["url"]
      }
      break;
    case "listening":
      activityData = { 
        name: arguments["text"], 
        type: ActivityType.Listening,
        url: arguments["url"]
      }
      break;
    case "watching": 
      activityData = { 
        name: arguments["text"], 
        type: ActivityType.Watching,
        url: arguments["url"]
    }
      break;
    case "competing": 
      activityData = { 
        name: arguments["text"], 
        type: ActivityType.Competing,
        url: arguments["url"]
      }
      break;
    case "streaming": 
      activityData = { 
        name: arguments["text"], 
        type: ActivityType.Streaming,
        url: arguments["url"]
      }
      break;
    case "custom": 
      activityData = { 
        name: arguments["text"],
        type: ActivityType.Custom,
        url: arguments["url"]
      }
      break;
    default:
      activityData = { 
        name: arguments["text"], 
        type: ActivityType.Playing,
        url: arguments["url"]
      }
      break;
  } 

  client.user.setPresence({ 
      activities: [activityData], 
      status: arguments["status"] 
  });
}

var motd = ["Please refrain from touching the service kobold."]

function cycleMOTD(){
  console.log("cycling motd")
  var message;
  message = motd.pop()
  motd.unshift(message)
  setBotPresence({type:"custom",text:message,url:"https://snapps.dev", status:"online"})
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  cycleMOTD();
  setInterval(cycleMOTD, 15000); 
  console.log()
  
});


//Load client commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//When the client recieves a command
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
  const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

