import { ACCESS_FLAGS } from '../abis';

interface ValidationData {
  title: string;
  reference: string;
  priceStrk: string;
  priceUsdMicros: string;
  accessFlags: number;
}

export const validateComponentData = (data: ValidationData): string[] => {
  const errors: string[] = [];
  
  // Title validation (felt252 limit)
  if (!data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.length > 31) {
    errors.push('Title must be 31 characters or less (felt252 limit)');
  }
  
  // Reference validation (felt252 limit)  
  if (!data.reference.trim()) {
    errors.push('Reference is required');
  } else if (data.reference.length > 31) {
    errors.push('Reference must be 31 characters or less (felt252 limit)');
  }
  
  // Access flags validation
  if (data.accessFlags === 0) {
    errors.push('At least one access method must be selected');
  }
  
  // FREE component validation
  if (data.accessFlags & ACCESS_FLAGS.FREE) {
    if (data.accessFlags !== ACCESS_FLAGS.FREE) {
      errors.push('FREE components cannot have other access methods');
    }
    if (data.priceStrk || data.priceUsdMicros) {
      errors.push('FREE components must have zero price');
    }
  }
  
  // Price validation for paid components
  if ((data.accessFlags & ACCESS_FLAGS.BUY) || 
      (data.accessFlags & ACCESS_FLAGS.DEV_SUB) || 
      (data.accessFlags & ACCESS_FLAGS.MKT_SUB)) {
    if (!data.priceStrk && !data.priceUsdMicros) {
      errors.push('Paid components must have a price');
    }
    if (data.priceStrk && data.priceUsdMicros) {
      errors.push('Choose either STRK or USD pricing, not both');
    }
  }
  
  // Price format validation
  if (data.priceStrk) {
    try {
      const price = parseFloat(data.priceStrk);
      if (price < 0) {
        errors.push('STRK price cannot be negative');
      }
    } catch {
      errors.push('Invalid STRK price format');
    }
  }
  
  if (data.priceUsdMicros) {
    try {
      const price = parseFloat(data.priceUsdMicros);
      if (price < 0) {
        errors.push('USD price cannot be negative');
      }
    } catch {
      errors.push('Invalid USD price format');
    }
  }
  
  return errors;
}; 