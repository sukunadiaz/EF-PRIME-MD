import PrimeCmd from './path/plugins/PrimeCmd.js';

const registerPrimeListener = (Matrix) => {

  const originalProcess = Matrix.ev.process;

  

  Matrix.ev.process = async (...args) => {

    await originalProcess.call(Matrix.ev, ...args);

    

    const [{ messages }] = args;

    if (messages && messages.length > 0) {

      for (const message of messages) {

        if (!message.message) continue; // Skip non-message events

        

        const m = {

          from: message.key.remoteJid,

          sender: message.key.fromMe ? Matrix.user.id : message.key.participant || message.key.remoteJid,

          body: message.message?.conversation || 

                message.message?.extendedTextMessage?.text || 

                message.message?.imageMessage?.caption || 

                message.message?.videoMessage?.caption || '',

          key: message.key,

          message: message.message,

          quoted: null

        };

        

        // Check if this is a reply

        if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {

          const quotedMsg = message.message.extendedTextMessage.contextInfo;

          m.quoted = {

            sender: quotedMsg.participant || '',

            text: quotedMsg.quotedMessage.conversation || 

                  quotedMsg.quotedMessage.extendedTextMessage?.text || 

                  quotedMsg.quotedMessage.imageMessage?.caption || 

                  quotedMsg.quotedMessage.videoMessage?.caption || '',

            key: {

              id: quotedMsg.stanzaId,

              remoteJid: message.key.remoteJid

            }

          };

        }

        

        // Process message with Prime command

        await PrimeCmd(m, Matrix);

      }

    }

  };

  

  // Set up a 30-minute conversation timeout cleaner

  setInterval(() => {

    const now = Date.now();

    const thirtyMinutes = 30 * 60 * 1000;

    

    Object.keys(global.primeLastActive || {}).forEach(chatId => {

      if (now - global.primeLastActive[chatId] > thirtyMinutes) {

        delete global.primeLastActive[chatId];

      }

    });

  }, 5 * 60 * 1000); // Check every 5 minutes

  

  // Initialize tracking object if not exists

  if (!global.primeLastActive) global.primeLastActive = {};

  

  console.log('Prime command listener registered successfully');

};

export default registerPrimeListener;