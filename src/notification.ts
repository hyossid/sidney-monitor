import axios from 'axios';

export const sendAlert = async (message: string): Promise<void> => {
  const TG_BOT_SECRET = process.env.TG_BOT_SECRET;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;
  if (!TG_BOT_SECRET || !TG_CHAT_ID) {
    return;
  }
  await axios.post(`https://api.telegram.org/bot${TG_BOT_SECRET}/sendMessage`, {
    chat_id: TG_CHAT_ID,
    text: message,
  });
};
