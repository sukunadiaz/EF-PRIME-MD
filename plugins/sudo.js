/frank inc🖥️


import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sudoFilePath = path.join(__dirname, '..', 'database', 'sudo.json');

const initSudoFile = async () => {
    try {
        await fs.access(sudoFilePath);
    } catch (error) {
        const dbDir = path.dirname(sudoFilePath);
        try {
            await fs.access(dbDir);
        } catch {
            await fs.mkdir(dbDir, { recursive: true });
        }
        
        await fs.writeFile(sudoFilePath, JSON.stringify({ 
            users: [],
            sudoMode: true
        }, null, 2));
    }
};

const getSudoData = async () => {
    await initSudoFile();
    const data = await fs.readFile(sudoFilePath, 'utf8');
    return JSON.parse(data);
};

const saveSudoData = async (data) => {
    await fs.writeFile(sudoFilePath, JSON.stringify(data, null, 2));
};

const isSudoModeEnabled = async () => {
    const data = await getSudoData();
    return data.sudoMode;
};

const isSudo = async (userId) => {
    const data = await getSudoData();
    return data.users.includes(userId);
};

const toggleSudoMode = async (mode) => {
    const data = await getSudoData();
    data.sudoMode = mode;
    await saveSudoData(data);
    return mode;
};

const handleSudoCommands = async (m, sock) => {
    const prefix = config.PREFIX || '/';
    
    if (!m.body.startsWith(`${prefix}sudo`)) return false;
    
    const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    
    const isOwner = m.sender === ownerNumber;
    const isBot = m.sender === botNumber;
    const isAuthorized = isOwner || isBot;
    
    if (!isAuthorized) {
        await sock.sendMessage(m.from, { text: '❌ Only the owner can manage sudo settings!' }, { quoted: m });
        return true;
    }
    
    const args = m.body.split(/\s+/);
    const action = args[1]?.toLowerCase();
    
    if (action === 'on') {
        await toggleSudoMode(true);
        await sock.sendMessage(m.from, { text: '✅ Sudo mode enabled! Bot will only respond to owner and sudo users.' }, { quoted: m });
        return true;
    }
    
    if (action === 'off') {
        await toggleSudoMode(false);
        await sock.sendMessage(m.from, { text: '✅ Sudo mode disabled! Bot will respond to everyone.' }, { quoted: m });
        return true;
    }
    
    if (action === 'add' || action === 'remove') {
        let targetUser = null;
        
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetUser = m.mentionedJid[0];
        } 
        else if (args[2]) {
            const number = args[2].replace(/[^0-9]/g, '');
            if (number) {
                targetUser = `${number}@s.whatsapp.net`;
            }
        }
        
        if (!targetUser) {
            await sock.sendMessage(m.from, { 
                text: `❌ Please provide a valid user to ${action}!\nUse: ${prefix}sudo ${action} @user or ${prefix}sudo ${action} number` 
            }, { quoted: m });
            return true;
        }
        
        const data = await getSudoData();
        
        if (action === 'add') {
            if (data.users.includes(targetUser)) {
                await sock.sendMessage(m.from, { text: '❌ This user is already in the sudo list!' }, { quoted: m });
            } else {
                data.users.push(targetUser);
                await saveSudoData(data);
                await sock.sendMessage(m.from, { text: `✅ Added ${targetUser.split('@')[0]} to sudo users!` }, { quoted: m });
            }
        } else if (action === 'remove') {
            if (!data.users.includes(targetUser)) {
                await sock.sendMessage(m.from, { text: '❌ This user is not in the sudo list!' }, { quoted: m });
            } else {
                data.users = data.users.filter(user => user !== targetUser);
                await saveSudoData(data);
                await sock.sendMessage(m.from, { text: `✅ Removed ${targetUser.split('@')[0]} from sudo users!` }, { quoted: m });
            }
        }
        
        return true;
    }
    
    if (action === 'list') {
        const data = await getSudoData();
        const sudoMode = data.sudoMode ? 'ON' : 'OFF';
        
        if (data.users.length === 0) {
            await sock.sendMessage(m.from, { 
                text: `📝 *SUDO SETTINGS*\n\n• Sudo Mode: ${sudoMode}\n• No sudo users in the list.` 
            }, { quoted: m });
        } else {
            const userList = data.users.map((user, i) => `${i + 1}. ${user.split('@')[0]}`).join('\n');
            await sock.sendMessage(m.from, { 
                text: `📝 *SUDO SETTINGS*\n\n• Sudo Mode: ${sudoMode}\n\n*SUDO USERS LIST*\n${userList}` 
            }, { quoted: m });
        }
        
        return true;
    }
    
    await sock.sendMessage(m.from, { 
        text: `*SUDO COMMANDS*\n\n${prefix}sudo on - Enable sudo mode (only sudo users can use bot)\n${prefix}sudo off - Disable sudo mode (everyone can use bot)\n${prefix}sudo add @user - Add tagged user to sudo list\n${prefix}sudo remove @user - Remove tagged user from sudo list\n${prefix}sudo list - Show all sudo users and mode status` 
    }, { quoted: m });
    
    return true;
};
