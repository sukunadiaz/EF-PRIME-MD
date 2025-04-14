import axios from 'axios';

import pkg from '@whiskeysockets/baileys';

const { downloadMediaMessage } = pkg;

import config from '../config.cjs';

const PrimeCmd = async (m, Matrix) => {

  const botNumber = Matrix.user.id.split(':')[0] + '@s.whatsapp.net';

  const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';

  const prefix = config.PREFIX;

  const isOwner = m.sender === ownerNumber;

  const isBot = m.sender === botNumber;

  const isPrefixed = m.body.startsWith(prefix);

  const cmd = isPrefixed 

    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() 

    : '';

  const primeTriggers = ['prime', 'optimus', 'transformer', 'autobot'];

  const isPrimeQuery = primeTriggers.some(trigger => 

    m.body.toLowerCase().includes(trigger)

  );

  

  // Check if this is a reply to a bot message

  const isReplyToBot = m.quoted && (m.quoted.sender === botNumber || m.quoted.sender?.endsWith('@g.us'));

  

  // Check if this is a reply to an EF-PRIME message

  const isReplyToPrime = isReplyToBot && m.quoted.text && m.quoted.text.includes('EF-PRIME');

  

  // Process if: prime command, prime keyword, or reply to EF-PRIME

  if (cmd === 'prime' || (!isPrefixed && isPrimeQuery) || isReplyToPrime) {

    try {

      await Matrix.sendPresenceUpdate('composing', m.from);

      

      let userQuery = "";

      if (isPrefixed && cmd === 'prime') {

        userQuery = m.body.slice(prefix.length + 5).trim();

      } else if (isReplyToPrime) {

        userQuery = m.body.trim();

      } else {

        userQuery = m.body.trim();

      }

      

      if (!userQuery || userQuery.trim() === '') {

        userQuery = "Tell me about yourself, Optimus Prime";

      }

      

      const fullPrompt = `Be like Optimus Prime from Transformers. your name is EF-PRIME made by frank kaumba dev from Malawi ${userQuery}`;

      

      const encodedPrompt = encodeURIComponent(fullPrompt);

      

      const response = await axios.get(`https://apis.davidcyriltech.my.id/ai/llama3?text=${encodedPrompt}`);

      

      let primeResponse = "";

      if (response.data && response.data.success && response.data.message) {

        primeResponse = response.data.message.replace(/"/g, '');

      } else {

        primeResponse = "Autobots, we seem to be experiencing communication issues.";

      }

      

      const header = "*EF-PRIME*\n\n";

      primeResponse = header + primeResponse;

      

      await Matrix.sendMessage(

        m.from,

        {

          text: primeResponse,

          contextInfo: {

            mentionedJid: [m.sender],

            forwardingScore: 999,

            isForwarded: true,

            forwardedNewsletterMessageInfo: {

              newsletterJid: '120363419090892208@newsletter',

              newsletterName: "EF-PRIME",

              serverMessageId: Math.floor(Math.random() * 1000)

            }

          }

        },

        { quoted: m }

      );

      

    } catch (error) {

      console.error('Prime Command Error:', error);

      await Matrix.sendMessage(

        m.from, 

        { text: "*EF-PRIME is currently unavailable. The Autobots will return soon.*" },

        { quoted: m }

      );

    }

  }

};

export default PrimeCmd;