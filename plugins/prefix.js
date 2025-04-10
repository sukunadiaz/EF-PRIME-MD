

import config from '../config.cjs';

const prefixCommand = async (m, Matrix) => {
   
    if (m.body.toLowerCase() === 'prefix') {
        const currentPrefix = config.PREFIX;
        await Matrix.sendMessage(
            m.from,
            { 
                text: `🤖 Current prefix is: *${currentPrefix}*`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363419090892208@newsletter',
                        newsletterName: "EF-PRIME",
                        serverMessageId: 143
                    }
                }
            },
            { quoted: m }
        );
    }
};

export default prefixCommand; 