import axios from "axios";
import config from '../config.cjs';

const aiVoiceCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  if (cmd === "aivoice") {
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (!text) {
      return m.reply(`*AI Voice Generator*\n\nConvert text to speech using AI voices.\n\n*Usage:*\n${prefix}aivoice [text] - [model]\n\n*Available Models:*\n- miku\n- nahida\n- nami\n- ana\n- optimus_prime\n- goku\n- taylor_swift\n- elon_musk\n- mickey_mouse\n- kendrick_lamar\n- angela_adkinsh\n- eminem\n\n*Example:*\n${prefix}aivoice frank, how are you today? - optimus_prime`);
    }

    let voiceText = text;
    let model = "miku";

    if (text.includes(" - ")) {
      const parts = text.split(" - ");
      voiceText = parts[0].trim();
      model = parts[1].trim().toLowerCase();

      const validModels = ["miku", "nahida", "nami", "ana", "optimus_prime", "goku",
                          "taylor_swift", "elon_musk", "mickey_mouse", "kendrick_lamar",
                          "angela_adkinsh", "eminem"];

      if (!validModels.includes(model)) {
        return m.reply(`❌ Invalid voice model "${model}".\n\n*Available models:*\n- miku\n- nahida\n- nami\n- ana\n- optimus_prime\n- goku\n- taylor_swift\n- elon_musk\n- mickey_mouse\n- kendrick_lamar\n- angela_adkinsh\n- eminem`);
      }
    }

    if (!voiceText) {
      return m.reply("❌ Please provide text to convert to speech.");
    }

    await gss.sendMessage(m.from, { react: { text: "🔊", key: m.key } });

    try {
      const apiUrl = `https://apis.davidcyriltech.my.id/voiceai?text=${encodeURIComponent(voiceText)}&model=${model}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.success && response.data.audio_url) {
        await gss.sendMessage(m.from, {
          audio: { url: response.data.audio_url },
          mimetype: 'audio/mpeg',
          fileName: `AI-Voice-${response.data.model}.mp3`,
          ptt: false,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363419090892208@newsletter',
              newsletterName: "EF-PRIME AI VOICE",
              serverMessageId: 144,
            },
          }
        }, { quoted: m });

        await gss.sendMessage(m.from, { react: { text: "✅", key: m.key } });
      } else {
        console.error("AI Voice error: Invalid API response", response.data);
        await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
        m.reply("❌ An error occurred while processing the AI voice response.");
      }

    } catch (error) {
      console.error("AI Voice error:", error);
      await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
      m.reply("❌ An error occurred while generating the AI voice. Please try again later.");
    }
  }
};

export default aiVoiceCommand;