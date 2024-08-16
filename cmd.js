module.exports = (client) => {
    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.guild) return;
      if (!message.content.startsWith('!')) return;
  
      const args = message.content.slice(1).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
  
      if (command === 'play') {
        if (!message.member.voice.channel) {
          return message.reply('join voice channel dulu bangsat');
        }
  
        const res = await client.manager.search(args.join(' '), message.author);
  
        if (res.loadType === 'LOAD_FAILED') {
          return message.reply(
            `There was an error while searching: ${res.exception?.message || 'Unknown error'}`
          );
        }
  
        if (res.loadType === 'NO_MATCHES') {
          return message.reply('No matches found for the query.');
        }
  
        const player = client.manager.create({
          guild: message.guild.id,
          voiceChannel: message.member.voice.channel.id,
          textChannel: message.channel.id,
        });
  
        player.connect();
  
        if (res.loadType === 'PLAYLIST_LOADED') {
          player.queue.add(res.tracks);
          message.channel.send(
            `Enqueuing playlist ${res.playlist.name} with ${res.tracks.length} tracks.`
          );
        } else {
          const track = res.tracks[0];
          player.queue.add(track);
          message.channel.send(`Enqueuing ${track.title}.`);
  
          if (!player.playing && !player.paused && player.queue.totalSize === 1) {
            player.play().catch((error) => {
              console.error('Error when trying to play:', error);
              message.channel.send('There was an error when trying to play the track.');
            });
          }
        }
      }
  
      if (command === 'stop') {
        const player = client.manager.get(message.guild.id);
        if (!player) return message.reply('No music is playing.');
  
        player.destroy();
        return message.reply('Stopped the music!');
      }
  
      if (command === 'skip') {
        const player = client.manager.get(message.guild.id);
        if (!player) return message.reply('No music is playing.');
  
        player.stop();
        return message.reply('Skipped the current song!');
      }
  
      if (command === 'pause') {
        const player = client.manager.get(message.guild.id);
        if (!player) return message.reply('No music is playing.');
  
        player.pause(true);
        return message.reply('Paused the music!');
      }
  
      if (command === 'resume') {
        const player = client.manager.get(message.guild.id);
        if (!player) return message.reply('No music is paused.');
  
        player.pause(false);
        return message.reply('Resumed the music!');
      }
    });
  };
  