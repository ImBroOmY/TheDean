const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const { openAIApiKey } = require('../config.json');

if (!openAIApiKey) {
    console.error('🚫 Missing OpenAI API key. Please set it up in the config file.');
    process.exit(1);
}

const config = new Configuration({
    apiKey: openAIApiKey,
});

const openaiApi = new OpenAIApi(config);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask a question to The Dean.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('What are you wondering?')
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const question = interaction.options.getString('question');
            let conversationLog = [{ role: 'system', content: 'You are a friendly Discord bot named The Dean.' }];

            conversationLog.push({
                role: 'user',
                content: question,
            });

            const result = await openaiApi
                .createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages: conversationLog,
                    max_tokens: 256,
                })
                .catch((error) => {
                    console.log(`❌ OpenAI error: ${error}`);
                    throw error;
                });

            const responseEmbed = new EmbedBuilder()
                .setColor('#f1ac50')
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .addFields({ name: 'Question', value: question, inline: false })
                .addFields({ name: 'Answer', value: result.data.choices[0].message.content, inline: false })
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [responseEmbed] });

        } catch (error) {
            console.error("🚫 Error at /ask");
            await interaction.editReply({ content: `🚫 Oops! Something went wrong. Please try again later.`, ephemeral: true });
        }
    }
}