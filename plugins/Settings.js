import config from '../config.cjs';
import fs from 'fs';
import path from 'path';

const SettingsCmd = async (m, Matrix) => {
  const botNumber = Matrix.user.id.split(':')[0] + '@s.whatsapp.net';
  const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
  const prefix = config.PREFIX;

  const isOwner = m.sender === ownerNumber;
  const isBot = m.sender === botNumber;
  const isAuthorized = isOwner || isBot;

  const args = m.body.startsWith(prefix) 
    ? m.body.slice(prefix.length).trim().split(/ +/)
    : m.body.trim().split(/ +/);
  
  const cmd = args.shift()?.toLowerCase() || '';

  if (cmd === 'settings' && args.length === 0) {
    if (!isAuthorized) return m.reply('*Only the owner or bot can view/change settings!*');

    try {
      const configInfo = {
        '🤖 PREFIX': config.PREFIX,
        '🛡️ ANTI_DELETE': config.ANTI_DELETE || false,
        '👁️ AUTO_STATUS_SEEN': config.AUTO_STATUS_SEEN || false,
        '↩️ AUTO_STATUS_REPLY': config.AUTO_STATUS_REPLY || false,
        '📝 STATUS_READ_MSG': config.STATUS_READ_MSG || 'Not configured',
        '⬇️ AUTO_DL': config.AUTO_DL || false,
        '👁️ AUTO_READ': config.AUTO_READ || false,
        '⌨️ AUTO_TYPING': config.AUTO_TYPING || false,
        '🎙️ AUTO_RECORDING': config.AUTO_RECORDING || false,
        '🟢 ALWAYS_ONLINE': config.ALWAYS_ONLINE || false,
        '👍 AUTO_REACT': config.AUTO_REACT || false,
        '🚫 AUTO_BLOCK': config.AUTO_BLOCK || false,
        '📵 REJECT_CALL': config.REJECT_CALL || false,
        '🔒 NOT_ALLOW': config.NOT_ALLOW || false,
        '👋 WELCOME': config.WELCOME || false,
        '🔘 MODE': config.MODE || 'public'
      };

      let settingsMessage = `*⚙️ EF-PRIME BOT SETTINGS ⚙️*\n\n`;
      
      for (const [key, value] of Object.entries(configInfo)) {
        const displayValue = typeof value === 'boolean' 
          ? (value ? '✅ Enabled' : '❌ Disabled') 
          : value;
          
        settingsMessage += `*${key}:* ${displayValue}\n`;
      }

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      settingsMessage += `\n*📊 SYSTEM DIAGNOSTICS*\n`;
      settingsMessage += `*🔋 Node Version:* ${process.version}\n`;
      settingsMessage += `*💻 Platform:* ${process.platform}\n`;
      settingsMessage += `*🧠 Memory Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
      settingsMessage += `*⏱️ Uptime:* ${hours}h ${minutes}m ${seconds}s\n\n`;
      
      settingsMessage += `*⚠️ HOW TO CHANGE SETTINGS:*\n`;
      settingsMessage += `Reply with the setting name followed by 'on' or 'off'\n`;
      settingsMessage += `Example: \`${prefix}autotyping on\` or \`${prefix}autoreact off\`\n`;
      settingsMessage += `For mode setting: \`${prefix}mode public\` or \`${prefix}mode private\``;

      return m.reply(settingsMessage);

    } catch (error) {
      console.error('Settings command error:', error);
      return m.reply('*Error fetching settings information!*');
    }
  }
  
  if (isAuthorized && (cmd.startsWith(prefix) || args.length > 0)) {
    const settingCmd = cmd.startsWith(prefix) ? cmd.slice(prefix.length).toLowerCase() : cmd.toLowerCase();
    const settingValue = args[0]?.toLowerCase();
    
    const settingsMap = {
      'antidelete': 'ANTI_DELETE',
      'autostatusseen': 'AUTO_STATUS_SEEN',
      'autostatusreply': 'AUTO_STATUS_REPLY',
      'autodl': 'AUTO_DL',
      'autoread': 'AUTO_READ',
      'autotyping': 'AUTO_TYPING',
      'autorecording': 'AUTO_RECORDING',
      'alwaysonline': 'ALWAYS_ONLINE',
      'autoreact': 'AUTO_REACT',
      'autoblock': 'AUTO_BLOCK',
      'rejectcall': 'REJECT_CALL',
      'notallow': 'NOT_ALLOW',
      'welcome': 'WELCOME',
      'mode': 'MODE'
    };
    
    const configKey = settingsMap[settingCmd];
    
    if (!configKey) {
      return;
    }
    
    if (configKey === 'MODE') {
      if (settingValue !== 'public' && settingValue !== 'private') {
        return m.reply('*Invalid mode value. Use "public" or "private"*');
      }
      
      try {
        updateEnvFile(configKey, settingValue);
        config[configKey] = settingValue;
        return m.reply(`*✅ Mode has been updated to: ${settingValue}*`);
      } catch (error) {
        console.error('Settings update error:', error);
        return m.reply('*Error updating settings!*');
      }
    } else {
      if (settingValue !== 'on' && settingValue !== 'off') {
        return m.reply('*Invalid value. Use "on" or "off"*');
      }
      
      const boolValue = settingValue === 'on';
      
      try {
        updateEnvFile(configKey, boolValue.toString());
        config[configKey] = boolValue;
        return m.reply(`*✅ ${configKey} has been turned ${settingValue}*`);
      } catch (error) {
        console.error('Settings update error:', error);
        return m.reply('*Error updating settings!*');
      }
    }
  }
};

const updateEnvFile = (key, value) => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    const envLines = envContent.split('\n');
    let keyExists = false;
    
    const updatedLines = envLines.map(line => {
      if (line.startsWith(`${key}=`)) {
        keyExists = true;
        return `${key}=${value}`;
      }
      return line;
    });
    
    if (!keyExists) {
      updatedLines.push(`${key}=${value}`);
    }
    
    fs.writeFileSync(envPath, updatedLines.join('\n'));
  } catch (error) {
    console.error('Error updating .env file:', error);
    throw error;
  }
};

export default SettingsCmd;