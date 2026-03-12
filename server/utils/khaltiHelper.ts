import axios from 'axios';

const KHALTI_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://khalti.com/api/v2' 
  : 'https://a.khalti.com/api/v2';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'live_secret_key_68791341fdd94846a146f0457ff7b455';

export const initiateKhaltiPayment = async (data: {
  return_url: string;
  website_url: string;
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
}) => {
  try {
    const response = await axios.post(`${KHALTI_BASE_URL}/epayment/initiate/`, data, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Khalti Initiate Error:', error.response?.data || error.message);
    throw error;
  }
};

export const verifyKhaltiPayment = async (pidx: string) => {
  try {
    const response = await axios.post(`${KHALTI_BASE_URL}/epayment/lookup/`, { pidx }, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Khalti Verify Error:', error.response?.data || error.message);
    throw error;
  }
};
