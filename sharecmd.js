module.exports = (client) => {
    const fs = require('fs');
    const path = require('path');
    const metadataPath = path.join(__dirname, 'metadata.json');
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      metadata = require(metadataPath);
    }
    
    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.guild) return;
    
      const args = message.content.slice(1).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
    
      if (command === 'setname') {
        if (args.length === 0) return message.reply('Please provide a name for the file.');
        const name = args.join(' ');
    
        let attachment;
        if (message.attachments.size > 0) {
          // If the command message has an attachment, use it
          attachment = message.attachments.first();
        } else if (message.reference) {
          // If the command is a reply, check the replied-to message for attachments
          const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
          if (repliedMessage.attachments.size > 0) {
            attachment = repliedMessage.attachments.first();
          }
        }
    
        if (attachment) {
          const fileName = attachment.name;
          metadata[name] = {
            url: attachment.url,
            name: fileName
          };
    
          // Save metadata to file
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
          message.reply(`File has been saved with the name "${name}".`);
        } else {
          message.reply('Please attach a file to the message or reply to a message with an attachment.');
        }
      }
    
      if (command === 'share') {
        const name = args.join(' ');
        if (!metadata[name]) return message.reply('No file found with that name.');
    
        // Fetch the URL and send the file
        const { url, name: fileName } = metadata[name];
        message.channel.send({
          content: `Here's the file you requested: ${fileName}`,
          files: [url]
        });
      }
    
      if (command === 'listfiles') {
        if (Object.keys(metadata).length === 0) {
          return message.reply('No files have been shared yet.');
        }
    
        let fileList = 'Shared files:\n';
        for (const [name, file] of Object.entries(metadata)) {
          fileList += `- ${name}: ${file.name}\n`;
        }
    
        message.channel.send(fileList);
      }
    
      if(command === 'menu') {
        return message.reply('Ini Menu nya\n\n1. !share <file name>\n2. !listfiles\n3. !setname <file name>');
      }
    });
    };