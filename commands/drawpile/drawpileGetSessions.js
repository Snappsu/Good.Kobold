const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder } = require('discord.js');
const { Readable } = require('stream');
require('dotenv').config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawpile')
		.setDescription('Get some info about the community drawpile.'),
		
	async execute(interaction) {

		response = await initPost(interaction)
		//console.log(response)
		const collector = response.resource.message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

			collector.on('collect', async i => {
				await i.update({ content: '', ephemeral: true})
				const selection = i.values[0];
				await getSessionInfo(i,selection);
		});
		
	},
	
};

async function initPost(interaction) {
		response = await interaction.reply(
			//buildPost(interaction)
			await getDrawpileInfo(interaction)
		);
		return response;
}

async function getDrawpileInfo(interaction) {
	var sessionInfo;
	var serverInfo;
	const sessionAPIurl = 'https://drawpile.snapps.dev/admin/api/sessions';
	const serverAPIurl = 'https://drawpile.snapps.dev/admin/api/status';

	const options = {
		method: 'GET',
		headers: {
			Authorization: process.env.DRAWPILE_API_AUTH
		}
	};

	try {
		const sessionInfoResp = await fetch(sessionAPIurl, options);
		sessionInfo = await sessionInfoResp.json();
		const serverInfoResp = await fetch(serverAPIurl, options);
		serverInfo = await serverInfoResp.json();
		return buildPost(interaction,serverInfo,sessionInfo) 
	} catch (error) {
		console.log(error)
		return { content: 'Huh... I\'m having trouble reaching the drawpile server... Sorry, oomfie.', ephemeral: true }
	}

}

async function getSessionSnapshot(sessionID) {
			const url = 'http://'+process.env.SNAPPS_STORAGE_IP+'/SnappStack-Dev/Drawpile/Sessions/'+sessionID+'-1.png';
		const options = {
			method: 'GET',
			headers: {
				Authorization: process.env.SNAPPS_STORAGE_AUTH
			}
		};
		try {
		const response = await fetch(url, options);
		if (response.status == 404) return "src/drawpile/404.gif"
		const file =  Buffer.from(await response.arrayBuffer());
		return file;
		} catch (error) {
		console.error(error);
		return "src/drawpile/404.gif"
	}
}

async function getSessionInfo(interaction,sessionID) {

	var sessionInfo;
	const sessionAPIurl = 'https://drawpile.snapps.dev/admin/api/sessions/'+sessionID;

	const options = {
		method: 'GET',
		headers: {
			Authorization: process.env.DRAWPILE_API_AUTH
		}
	};

	// Get session info
	try {
		const sessionInfoResp = await fetch(sessionAPIurl, options);
		sessionInfo = await sessionInfoResp.json();
		sessionTags = []
		postFiles = []
		fileExt = ""

		// Screenshot setup
		const sessionScreenshot = new AttachmentBuilder( await getSessionSnapshot(sessionID) , { name: 'session-snapshot.png', spoiler: true });
		if(sessionScreenshot.attachment.slice(-3)=='gif') {
			sessionScreenshot.setName('session-snapshot.gif')
		}

		postFiles.push(sessionScreenshot)

		// Build the post here
		var embed = new EmbedBuilder()

		embed.setAuthor({ name: "Snapps' Drawpile Server", url: 'https://drawpile.snapps.dev/' })
		embed.setTitle(sessionInfo.title)
		embed.setURL("https://drawpile.net/invites/drawpile.snapps.dev/"+ sessionID)
		embed.setColor("#0099ff")
		embed.setThumbnail("https://drawpile.snapps.dev/logo.png")


		// Session is NSFM
		if (sessionInfo.nsfm) {
			embed.setURL("https://drawpile.net/invites/drawpile.snapps.dev/"+ sessionID+"?web&nsfm")
			sessionTags.push("`🔞 NSFM`")
		}

		// Session has password
		if (sessionInfo.hasPassword) {
			sessionTags.push("`🔒 Password`")
			postFiles = []
		}

		// Session is persistent
		if (sessionInfo.persistent) {
			sessionTags.push("`🕑 Persistent`")
		}

		// Tags Field
		embed.addFields(
			{ name: 'Tags', value: sessionTags.join(" ") }
		 )

		// Users Field
		onlineUsers = []
		contributors = []
		sessionInfo.users.forEach(user => {
			contributors.push(user.name)
			if (user.online) onlineUsers.push(user.name)
		});
		embed.addFields(
			{ name: 'Users Connected ( '+ sessionInfo.userCount + ' / '+ sessionInfo.maxUserCount +' )', value: onlineUsers.join(", ") }
		 )

		// Session Info Field

		// Contributors
		embed.addFields(
			{ name: 'Contributors', value: contributors.join(", ") }
		 )

		// Session Snapshot
		embed.setImage('attachment://'+sessionScreenshot.name);

		// Post it
		await interaction.editReply({embeds: [embed], files: postFiles }) 
	} catch (error) {
		console.log(error)
		return { content: 'Huh... I\'m having trouble reaching the drawpile server... Sorry, oomfie.', ephemeral: true }
	}

}

function buildPost(interaction,serverInfo,sessionInfo){

	// HOTFIX - 'Ensures' only I can use the command
	if (interaction.user.id=='143978133798780928'){
		// Main Embed
		var embed = new EmbedBuilder()
		embed.setTitle("Snapps' Drawpile Server")
		embed.setURL("https://drawpile.snapps.dev/")
		embed.setColor("#0099ff")
		embed.setThumbnail("https://drawpile.snapps.dev/logo.png")
		
		// Server Info
		serverInfoText = ""
		// Session Amount Info
		serverInfoText += "Sessions Online: "+serverInfo.sessions+" / "+serverInfo.maxSessions+"\n"
		// User Amount Info
		serverInfoText += "Users Connected: "+serverInfo.users+"\n"

		// Connection Info
		serverInfoText += "\nList Server Address: `drawpile.snapps.dev:27749`\n"

		serverInfoText += "\nSnapshots are updated every 5 minutes."

		// User Instruction
		serverInfoText += "\nPlease select a session from dropdown menu for more info."
		
		embed.setDescription(serverInfoText)

		// Session Select Menu
		sessionSelectMenu = new StringSelectMenuBuilder()
		sessionSelectMenu.setCustomId('session')
		sessionSelectMenu.setPlaceholder('Select a session')
		sessionInfo.forEach(session => {
			label = ""
			if (session.nsfm ) label += "🔞"
			if (session.hasPassword ) label += "🔒"
			label += " "+session.title
			sessionSelectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(label)
					.setDescription('ID: '+ (("alias" in session )? session.alias : session.id))
					.setValue(session.id)
			)
		});

		actions = new ActionRowBuilder().addComponents(sessionSelectMenu)
		return { embeds: [embed], components: [actions], withResponse:true, ephemeral: true };
	} else {
		return { content: 'Hey! This isn\'t meant for you to use! >:l', ephemeral: true }
	}
}