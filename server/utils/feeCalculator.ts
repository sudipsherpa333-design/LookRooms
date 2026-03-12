import { FeeRule } from '../models/FeeRule.js';

export const calculateServiceFee = async (roomType: string): Promise<number> => {
  const rule = await FeeRule.findOne({ roomType, isActive: true });
  return rule ? rule.serviceFee : 0;
};
