const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buildpost')
		.setDescription('Debug!')
		.addStringOption(option =>
			option.setName('color')
				.setDescription('Hex color of post.'))
		.addStringOption(option =>
			option.setName('imglink')
				.setDescription('Link to media.'))
		.addStringOption(option =>
			option.setName('desc')
				.setDescription('Post text.'))
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
		// Main Container
		postToShare = new EmbedBuilder()
		postToShare.setURL("https://snapps.dev")
		//if no color
		if ( interaction.options.get("color")== null) {
			postToShare.setColor('#9463ff')
		} else {
			postToShare.setColor(interaction.options.get("color").value)
		}
		postToShare.setAuthor({ name: 'Created by Snapps', iconURL: 'https://snapps.dev/img/global/embed.png', url: 'https://snapps.dev' })
		postToShare.setDescription(interaction.options.get("desc").value)
		//if mirrors added
		if ( interaction.options.get("mirrors")!= null) {
			mirrorText = ""
			const mirrorRegex = /\[([\w\d)]+)\]|\((\S+)\)/gm;
			let mirrors;

			while ((mirrors = mirrorRegex.exec(interaction.options.get("mirrors").value)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (mirrors.index === mirrorRegex.lastIndex) {
					mirrorRegex.lastIndex++;
				}
				
				// The result can be accessed through the `m`-variable.
				mirrors.forEach((match, groupIndex) => {
					if (match===undefined) {}
					else if(groupIndex==1) mirrorText += match + ': '
					else if(groupIndex==2) mirrorText += match + '\n'
				});
			}
			postToShare.addFields({ name: '- – — < links > — – -', value: mirrorText})
		}
		postToShare.setFooter({ text: 'Spreading scalie propaganda since 2020'})
		postToShare.setTimestamp(Date.now())

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
						embeds.push(new EmbedBuilder().setURL("https://snapps.dev").setImage(match))
					} else {
						firstEmbedSkipped = true
						postToShare.setImage(match)
						embeds.push(postToShare)


					}
					
				}
			});
		}
		

		console.log(embeds)

		return { embeds: embeds};
	} else {
		return { content: 'Hey! This isn\'t meant for you to use! >:l', ephemeral: true }
	}
}