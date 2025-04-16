import config from '../config.cjs';
import axios from 'axios';

const dictionary = async (m, gss) => {
  const prefix = config.PREFIX;
  
  if (!m.body || !m.body.startsWith(prefix)) return;
  
  const args = m.body.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  
  if (command !== 'dict' && command !== 'dictionary') return;
  
  if (args.length < 1) {
    return await m.reply(`📚 Please provide a word to look up.\nUsage: ${prefix}dict [word]`);
  }
  
  try {
    const word = args.join(' ');
    
    await m.reply(`🔍 Looking up definition for "${word}"...`);
    
    const response = await axios.get(`https://kaiz-apis.gleeze.com/api/dictionary?word=${encodeURIComponent(word)}`);
    
    if (!response.data || !response.data.word) {
      return await m.reply(`❌ Definition for "${word}" not found. Please check spelling and try again.`);
    }
    
    const data = response.data;
    
    let message = `📖 *${data.word.toUpperCase()}* 📖\n\n`;
    
    if (data.meanings && data.meanings.length > 0) {
      data.meanings.forEach((meaning, index) => {
        const emoji = getEmojiForSpeechPart(meaning.partOfSpeech);
        
        message += `${emoji} *${capitalizeFirstLetter(meaning.partOfSpeech)}*\n`;
        
        if (meaning.definitions && meaning.definitions.length > 0) {
          meaning.definitions.forEach((def, defIndex) => {
            message += `   ${defIndex + 1}. ${def.definition}\n`;
            
            if (def.synonyms && def.synonyms.length > 0) {
              message += `      *Synonyms:* ${def.synonyms.join(', ')}\n`;
            }
            
            if (def.antonyms && def.antonyms.length > 0) {
              message += `      *Antonyms:* ${def.antonyms.join(', ')}\n`;
            }
          });
        }
        
        if (meaning.synonyms && meaning.synonyms.length > 0) {
          message += `   *Synonyms:* ${meaning.synonyms.join(', ')}\n`;
        }
        
        if (meaning.antonyms && meaning.antonyms.length > 0) {
          message += `   *Antonyms:* ${meaning.antonyms.join(', ')}\n`;
        }
        
        message += '\n';
      });
    } else {
      message += '❌ No definitions found for this word.';
    }
    
    message += `\n🔤 *PRIME Dictionary* 🔤`;
    
    await gss.sendMessage(m.from, {
      text: message,
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
    console.error('Dictionary error:', error);
    await m.reply('❌ Failed to fetch definition. Please try again later.');
  }
};

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getEmojiForSpeechPart(part) {
  const speechParts = {
    'noun': '👤',
    'verb': '🏃',
    'adjective': '🎨',
    'adverb': '⚡',
    'pronoun': '👉',
    'preposition': '🔄',
    'conjunction': '🔗',
    'interjection': '😲',
    'determiner': '👆',
    'exclamation': '❗'
  };
  
  return speechParts[part.toLowerCase()] || '📝';
}

export default dictionary;