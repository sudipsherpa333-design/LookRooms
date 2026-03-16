import { FeeRule } from '../models/FeeRule.js';

export const calculateServiceFee = async (propertyType: string): Promise<number> => {
  const type = propertyType.toLowerCase();
  
  if (type.includes('single room')) return 500;
  if (type.includes('double room') || type.includes('triple room') || type.includes('flat') || type.includes('apartment')) return 1000;
  if (type.includes('1bhk')) return 1000;
  if (type.includes('2bhk') || type.includes('3bhk')) return 1500;
  if (type.includes('studio') || type.includes('office') || type.includes('commercial') || type.includes('whole house')) return 2000;
  
  return 500; // Default
};
