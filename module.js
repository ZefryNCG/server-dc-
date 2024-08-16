const { Client, GatewayIntentBits } = require('discord.js');
const { Manager } = require('erela.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.manager = new Manager({
  nodes: [
    {
      identifier: 'AjieDev - Lavalink [SSL | UK]',
      host: 'lava-v3.ajieblogs.eu.org',
      port: 443,
      password: 'https://dsc.gg/ajidevserver', // Ganti dengan password yang benar
      secure: true,
    },
  ],
  send: (id, payload) => {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  },
});

client.manager.on('nodeConnect', (node) => {
  console.log(`Node ${node.options.identifier} connected`);
});

client.manager.on('nodeError', (node, error) => {
  console.error(`Node ${node.options.identifier} had an error:`, error);
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.manager.init(client.user.id);
});

client.on('raw', (d) => client.manager.updateVoiceState(d));

module.exports = { client };
