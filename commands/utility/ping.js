const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('yip')
		.setDescription('Call to the loyal, digital kobold...'),
	async execute(interaction) {
		await interaction.reply({ content: 'Yap!', ephemeral: true });
	},
};
