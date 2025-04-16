import config from '../config.cjs';

const takeScreenshot = async (m, gss) => {
  const prefix = config.PREFIX;
  
  if (!m.body || !m.body.startsWith(prefix)) return;
  
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  
  if (command !== 'ss' && command !== 'screenshot') return;
  
  if (args.length < 1) {
    return await m.reply(`❌ Please provide a URL to screenshot.\nUsage: ${prefix}${command} [url]`);
  }
  
  try {
    let url = args[0];
    
   
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    
    try {
      new URL(url);
    } catch (e) {
      return await m.reply('❌ Invalid URL format. Please provide a valid website URL.');
    }
    
    await m.reply(`📸 Taking screenshot of ${url}...`);
    
    
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://kaiz-apis.gleeze.com/api/screenshot?url=${encodedUrl}`;
    
    await gss.sendMessage(m.from, {
      image: { url: apiUrl },
      caption: `📷 Screenshot of ${url}`,
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
    console.error('Screenshot error:', error);
    await m.reply('❌ Failed to capture screenshot. Please check the URL and try again.');
  }
};

export default takeScreenshot;