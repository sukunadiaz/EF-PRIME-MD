import axios from "axios";
import config from '../config.cjs';

const couplePictureCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  if (cmd === "couplepp") {
    await gss.sendMessage(m.from, { react: { text: "💑", key: m.key } });

    try {
      const apiUrl = `https://apis.davidcyriltech.my.id/couplepp`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.success && response.data.male && response.data.female) {
        const message = {
          image: { url: response.data.male },
          caption: "Couple Picture",
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363419090892208@newsletter',
              newsletterName: "EF-PRIME COUPLE",
              serverMessageId: 146,
            },
          }
        };
        await gss.sendMessage(m.from, message, { quoted: m });

        const message2 = {
          image: { url: response.data.female },
          caption: "Couple Picture",
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363419090892208@newsletter',
              newsletterName: "EF-PRIME COUPLE",
              serverMessageId: 147,
            },
          }
        };
        await gss.sendMessage(m.from, message2, { quoted: m });

        await gss.sendMessage(m.from, { react: { text: "✅", key: m.key } });

      } else {
        console.error("Couple picture error: Invalid API response", response.data);
        await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
        m.reply("❌ An error occurred while fetching the couple picture.");
      }

    } catch (error) {
      console.error("Couple picture error:", error);
      await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
      m.reply("❌ An error occurred while fetching the couple picture. Please try again later.");
    }
  }
};

export default couplePictureCommand;