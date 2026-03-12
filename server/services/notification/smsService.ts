import axios from 'axios';

export const smsService = {
  async sendSMS({ to, text }: { to: string, text: string }) {
    if (!/^9[78]\d{8}$/.test(to)) {
      throw new Error('Invalid Nepal phone number');
    }
    
    const response = await axios.post('https://api.sparrowsms.com/v2/sms/', {
      token: process.env.SPARROW_TOKEN,
      from: 'LookRooms',
      to,
      text: text.substring(0, 160)
    });
    
    return { success: true, messageId: response.data.message_id };
  }
};
