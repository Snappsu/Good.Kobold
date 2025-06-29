const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buildpost')
		.setDescription('Snapps\' private tool for making cool things. ')
		.addStringOption(option =>
			option.setName('desc')
				.setDescription('Mandatory. Post text.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('color')
				.setDescription('Hex color of post.'))
		.addStringOption(option =>
			option.setName('imglink')
				.setDescription('Link to media.'))
		.addStringOption(option =>
			option.setName('title')
				.setDescription('Post title.'))
		.addStringOption(option =>
			option.setName('mirrors')
				.setDescription('Link to mirrors/socials.')),
		
	async execute(interaction) {
		await interaction.reply(buildPost(interaction));
	},
};

function buildPost(interaction){
	console.log()
	console.log()
	console.log()
	console.log(interaction.options.get("mirrors"))

	if (interaction.user.id=='143978133798780928'){
		embeds = []
		// Main Embed
		postToShare = new EmbedBuilder()


		//Title
		if ( interaction.options.get("title")== null) {
		} else {
			postToShare.setTitle(interaction.options.get("title").value)
		}

		//if no color
		if ( interaction.options.get("color")== null) {
			postToShare.setColor('#9463ff')
		} else {
			postToShare.setColor(interaction.options.get("color").value)
		}
		postToShare.setAuthor({ name: '> Check out my stuff! <', url: 'https://snapps.dev' })
		postToShare.setThumbnail('https://snapps.dev/img/global/embedB.gif')
		postToShare.setDescription(interaction.options.get("desc").value)
		postToShare.setFooter({ text: 'Spreading scalie propaganda since 2020'})
		postToShare.setTimestamp(Date.now())


		postURL = "https://snapps.dev"
		postToShare.setURL(postURL)

		// Link  embed (if mirrors added)
		if ( interaction.options.get("mirrors")!= null) {
			linkEmbed = new EmbedBuilder()
			mirrorText = ""
			const mirrorRegex = /\[([\w\d)]+)\]|\((\S+)\)/gm;
			let mirrors;
			i=0
			while ((mirrors = mirrorRegex.exec(interaction.options.get("mirrors").value)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (mirrors.index === mirrorRegex.lastIndex) {
					mirrorRegex.lastIndex++;
				}
				
				// The result can be accessed through the `m`-variable.
				
				mirrors.forEach((match, groupIndex) => {
					if (match===undefined) {}
					else if(groupIndex==1) mirrorText += match + ': '
					else if(groupIndex==2) {
						mirrorText += match + '\n'
						
						if (i==0) {
							postURL=match
							postToShare.setURL(postURL)
						}
						i=i+1;
					}
				});
			}
			linkEmbed.setDescription('\\- – — < links > — – -\n' +mirrorText)
			//if no color
			if ( interaction.options.get("color")== null) {
				linkEmbed.setColor('#9463ff')
			} else {
				linkEmbed.setColor(interaction.options.get("color").value)
			}
		}

		//Image attatchments (up to 4)
		const imageRegex = /([\d\/\.\-\w\:]+\/[\d\/\.\-\w]+)/gm;
		let images;

		firstEmbedSkipped = false;
		while ((images = imageRegex.exec(interaction.options.get("imglink").value)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (images.index === imageRegex.lastIndex) {
				imageRegex.lastIndex++;
			}
			
			// The result can be accessed through the `m`-variable.
			images.forEach((match, groupIndex) => {
				if (groupIndex==1) {
					if (firstEmbedSkipped) {
						embeds.push(new EmbedBuilder().setURL(postURL).setImage(match))
					} else {
						firstEmbedSkipped = true
						postToShare.setImage(match)
						embeds.push(postToShare)
					}
					
				}
			});
		}

		if ( interaction.options.get("mirrors")!= null) {
			embeds.push(linkEmbed)
		}

		


		return { embeds: embeds};
	} else {
		return { content: 'Hey! This isn\'t meant for you to use! >:l', ephemeral: true }
	}
}