import { Item, Day, Itinerary, ValidationResult } from './aiTypes';

const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validates a single itinerary item.
 */
export function validateItem(item: any, dayIdx?: number, itemIdx?: number): { valid: boolean; errors: string[]; data?: Item } {
  const errors: string[] = [];
  const prefix = dayIdx !== undefined && itemIdx !== undefined ? `Day ${dayIdx + 1} Item ${itemIdx + 1}: ` : '';

  if (!item || typeof item !== 'object') {
    return { valid: false, errors: [`${prefix}Item must be an object`] };
  }

  if (typeof item.time !== 'string' || !TIME_REGEX.test(item.time)) {
    errors.push(`${prefix}time must be in 'HH:MM' 24-hour format (received '${item.time}')`);
  }

  if (typeof item.attractionId !== 'string' || item.attractionId.trim().length === 0) {
    errors.push(`${prefix}attractionId must be a non-empty string`);
  }

  if (typeof item.title !== 'string' || item.title.trim().length === 0) {
    errors.push(`${prefix}title must be a non-empty string`);
  }

  const cost = Number(item.estimatedCost);
  if (isNaN(cost) || cost < 0) {
    errors.push(`${prefix}estimatedCost must be a non-negative number`);
  }

  const duration = Number(item.durationMinutes);
  if (isNaN(duration) || duration <= 0) {
    errors.push(`${prefix}durationMinutes must be a positive number`);
  }

  if (typeof item.reason !== 'string' || item.reason.trim().length === 0) {
    errors.push(`${prefix}reason must be a non-empty string`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      time: item.time,
      attractionId: item.attractionId.trim(),
      title: item.title.trim(),
      estimatedCost: cost,
      durationMinutes: duration,
      reason: item.reason.trim()
    }
  };
}

/**
 * Validates a single day and its items.
 */
export function validateDay(day: any, expectedDayNum: number): { valid: boolean; errors: string[]; data?: Day } {
  const errors: string[] = [];
  const prefix = `Day ${expectedDayNum}: `;

  if (!day || typeof day !== 'object') {
    return { valid: false, errors: [`${prefix}Day must be an object`] };
  }

  if (Number(day.dayNumber) !== expectedDayNum) {
    errors.push(`${prefix}dayNumber must equal ${expectedDayNum}`);
  }

  if (typeof day.summary !== 'string' || day.summary.trim().length === 0) {
    errors.push(`${prefix}summary must be a non-empty string`);
  }

  if (!Array.isArray(day.items) || day.items.length === 0) {
    errors.push(`${prefix}items must be a non-empty array`);
    return { valid: false, errors };
  }

  const validItems: Item[] = [];
  day.items.forEach((item: any, idx: number) => {
    const itemRes = validateItem(item, expectedDayNum - 1, idx);
    if (!itemRes.valid) {
      errors.push(...itemRes.errors);
    } else if (itemRes.data) {
      validItems.push(itemRes.data);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      dayNumber: expectedDayNum,
      summary: day.summary.trim(),
      items: validItems
    }
  };
}

/**
 * Validates a complete Itinerary structure.
 * Enforces totalDays, positive budget, days array matching totalDays, and valid items.
 */
export function validateItinerary(data: any): ValidationResult<Itinerary> {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Itinerary payload must be a JSON object'] };
  }

  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('title must be a non-empty string');
  }

  if (typeof data.destination !== 'string' || data.destination.trim().length === 0) {
    errors.push('destination must be a non-empty string');
  }

  if (typeof data.destinationId !== 'string' || data.destinationId.trim().length === 0) {
    errors.push('destinationId must be a non-empty string');
  }

  const totalDays = Number(data.totalDays);
  if (!Number.isInteger(totalDays) || totalDays < 1 || totalDays > 7) {
    errors.push('totalDays must be an integer between 1 and 7');
  }

  const estimatedBudget = Number(data.estimatedBudget);
  if (isNaN(estimatedBudget) || estimatedBudget < 0) {
    errors.push('estimatedBudget must be a non-negative number');
  }

  if (!Array.isArray(data.days)) {
    errors.push('days must be an array');
    return { valid: false, errors };
  }

  if (totalDays > 0 && data.days.length !== totalDays) {
    errors.push(`days array length (${data.days.length}) must match totalDays (${totalDays})`);
  }

  const validDays: Day[] = [];
  data.days.forEach((day: any, idx: number) => {
    const dayRes = validateDay(day, idx + 1);
    if (!dayRes.valid) {
      errors.push(...dayRes.errors);
    } else if (dayRes.data) {
      validDays.push(dayRes.data);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      title: data.title.trim(),
      destination: data.destination.trim(),
      destinationId: data.destinationId.trim().toLowerCase(),
      totalDays,
      estimatedBudget,
      days: validDays
    }
  };
}
