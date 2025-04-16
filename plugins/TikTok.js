import axios from "axios";
import config from '../config.cjs';

const tiktokCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

  if (cmd === "tiktok" || cmd === "tt") {
    if (args.length === 0 || !args.join(" ")) {
      return m.reply("*Please provide a TikTok video URL to download.*");
    }

    const url = args.join(" ");
    
    if (!url.match(/^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)/)) {
      return m.reply("❌ Please provide a valid TikTok URL.");
    }
    
    await gss.sendMessage(m.from, { react: { text: "🔍", key: m.key } });

    try {
      const tiktokApiUrl = `https://apis.davidcyriltech.my.id/download/tiktok?url=${encodeURIComponent(url)}`;
      const response = await axios.get(tiktokApiUrl);
      
      if (!response.data || !response.data.success || !response.data.result) {
        await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ Failed to fetch TikTok video. Please check the URL and try again.`);
      }
      
      const { result } = response.data;
      
      if (result.type !== "video" || !result.video) {
        await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ Could not find video in the TikTok post.`);
      }
      
      await gss.sendMessage(m.from, { react: { text: "✅", key: m.key } });
      
      const caption = `📱 *\`EF-PRIME TIKTOK\`* 📱\n\n` +
        `⟡─────────────────⟡\n` +
        `👤 *Author:* ${result.author.nickname}\n` +
        `❤️ *Likes:* ${result.statistics.likeCount}\n` +
        `💬 *Comments:* ${result.statistics.commentCount}\n` +
        `🔄 *Shares:* ${result.statistics.shareCount}\n` +
        `📝 *Description:* ${result.desc.substring(0, 100)}${result.desc.length > 100 ? '...' : ''}\n` +
        `⟡─────────────────⟡\n\n` +
        `> E F P R I M E I N C`;
      
      const messageOptions = {
        mimetype: "video/mp4",
        fileName: `tiktok_video.mp4`,
        caption: caption,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363419090892208@newsletter',
            newsletterName: "EF-PRIME TIKTOK",
            serverMessageId: 144,
          },
        },
      };
      
      await gss.sendMessage(m.from, { 
        video: { url: result.video },
        ...messageOptions
      }, { quoted: m });
      
      if (result.music) {
        await gss.sendMessage(m.from, {
          audio: { url: result.music },
          mimetype: 'audio/mp4',
          fileName: 'tiktok_audio.mp3',
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true
          }
        }, { quoted: m });
      }
      
    } catch (error) {
      console.error("TikTok download error:", error);
      await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
      m.reply("❌ An error occurred while downloading the TikTok video. Please try again later.");
    }
  }
};

export default tiktokCommand;