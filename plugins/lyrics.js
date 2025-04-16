//don't steal without credit 

import config from '../config.cjs';
import axios from 'axios';

const fetchLyrics = async (m, gss) => {
  const prefix = config.PREFIX;
  
  if (!m.body || !m.body.startsWith(prefix)) return;
  
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  
  if (command !== 'lyrics') return;
  
  if (args.length < 1) {
    return await m.reply(`❌ Please provide a song name.\nUsage: ${prefix}lyrics [song name]`);
  }
  
  try {
    const searchQuery = args.join(' ');
    
    await m.reply(`🎵 Searching for lyrics of "${searchQuery}"...`);
    
    const response = await axios.get(`https://kaiz-apis.gleeze.com/api/shazam-lyrics?title=${encodeURIComponent(searchQuery)}`);
    
    if (!response.data || !response.data.lyrics) {
      return await m.reply(`❌ Lyrics for "${searchQuery}" not found. Try another song.`);
    }
    
    const songData = response.data;
    
    const caption = `🎵 *${songData.title}*\n\n${songData.lyrics}`;
    
    if (songData.thumbnail) {
      await gss.sendMessage(m.from, {
        image: { url: songData.thumbnail },
        caption: caption,
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
    } else {
      await gss.sendMessage(m.from, {
        text: caption,
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
    }
    
  } catch (error) {
    console.error('Lyrics error:', error);
    await m.reply('❌ Failed to fetch lyrics. Please try again later.');
  }
};

export default fetchLyrics;