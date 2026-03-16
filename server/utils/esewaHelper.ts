import crypto from 'crypto';

export const generateEsewaSignature = (totalAmount: number, transactionUuid: string, productCode: string, secretKey: string) => {
  const data = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac('sha256', secretKey).update(data).digest('base64');
};

export const verifyEsewaSignature = (data: string, signature: string, secretKey: string) => {
  const expectedSignature = crypto.createHmac('sha256', secretKey).update(data).digest('base64');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (e) {
    return false;
  }
};
