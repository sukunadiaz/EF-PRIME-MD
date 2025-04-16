import axios from "axios";
import config from '../config.cjs';

const imdbCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

  if (cmd === "movie") {
    if (args.length === 0 || !args.join(" ")) {
      return m.reply("*Please provide a movie or TV show name to search.*");
    }

    const query = args.join(" ");
    
    await gss.sendMessage(m.from, { react: { text: "🔍", key: m.key } });

    try {
      const imdbApiUrl = `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(query)}`;
      const response = await axios.get(imdbApiUrl);
      
      if (!response.data || !response.data.status || !response.data.movie) {
        await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ No results found for "${query}". Please try another search.`);
      }
      
      const movie = response.data.movie;
      
      await gss.sendMessage(m.from, { react: { text: "🎬", key: m.key } });
      
      let ratingText = "";
      if (movie.ratings && movie.ratings.length > 0) {
        movie.ratings.forEach(rating => {
          ratingText += `➣ ${rating.source}: ${rating.value}\n`;
        });
      }
      
      const caption = `🎬 *${movie.title} (${movie.year})* 🎬\n\n` +
        `⟡─────────────────⟡\n` +
        `⭐ *IMDb Rating:* ${movie.imdbRating}/10 (${movie.votes} votes)\n` +
        `🎭 *Genre:* ${movie.genres}\n` +
        `⏱️ *Runtime:* ${movie.runtime}\n` +
        `🔞 *Rated:* ${movie.rated}\n` +
        `📅 *Released:* ${new Date(movie.released).toLocaleDateString()}\n` +
        `🎬 *Director:* ${movie.director}\n` +
        `✍️ *Writers:* ${movie.writer}\n` +
        `🎭 *Cast:* ${movie.actors}\n\n` +
        `📝 *Plot:* ${movie.plot}\n\n` +
        (ratingText ? `📊 *Ratings:*\n${ratingText}\n` : "") +
        `💵 *Box Office:* ${movie.boxoffice || "N/A"}\n` +
        `🏆 *Awards:* ${movie.awards || "N/A"}\n` +
        `🌐 *Link:* ${movie.imdbUrl}\n` +
        `⟡─────────────────⟡\n\n` +
        `> E F P R I M E I N C`;
      
      await gss.sendMessage(m.from, { 
        image: { url: movie.poster },
        caption: caption,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363419090892208@newsletter',
            newsletterName: "EF-PRIME IMDB",
            serverMessageId: 144,
          },
        }
      }, { quoted: m });
      
    } catch (error) {
      console.error("IMDb search error:", error);
      await gss.sendMessage(m.from, { react: { text: "❌", key: m.key } });
      m.reply("❌ An error occurred while searching for the movie. Please try again later.");
    }
  }
};

export default imdbCommand;