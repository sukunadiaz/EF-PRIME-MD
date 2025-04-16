import config from '../config.cjs';
import axios from 'axios';

const sendShoti = async (m, gss) => {
  const prefix = config.PREFIX;
  
  if (!m.body || !m.body.startsWith(prefix)) return;
  
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  
  if (command !== 'shoti') return;
  
  try {
    await m.reply('🔍 Searching for a shoti video...');
    
    const response = await axios.get('https://kaiz-apis.gleeze.com/api/shoti');
    
    if (response.data.status !== 'success') {
      return await m.reply('❌ Failed to fetch shoti video. Please try again later.');
    }
    
    const videoData = response.data.shoti;
    
    const caption = `*${videoData.title || 'Shoti Video'}*\n\n` +
                    `👤 ${videoData.nickname} (@${videoData.username})\n` +
                    `⏱️ Duration: ${videoData.duration}s\n` +
                    `🌍 Region: ${videoData.region || 'Unknown'}`;
    
    await gss.sendMessage(m.from, {
      video: { url: videoData.videoUrl },
      caption: caption,
      gifPlayback: videoData.duration < 10,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363419090892208@newsletter',
          newsletterName: "Frank Dev",
          serverMessageId: 1
        }
      }
    }, { quoted: m });
    
  } catch (error) {
    console.error('Shoti error:', error);
    await m.reply('❌ An error occurred while fetching the shoti video. Please try again later.');
  }
};

export default sendShoti;