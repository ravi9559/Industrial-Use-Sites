'use server';

import { describeInfrastructure } from '@/ai/flows/describe-infrastructure';

export async function getInfrastructureDescription(lat: number, lng: number) {
  try {
    const result = await describeInfrastructure({ latitude: lat, longitude: lng });
    return { success: true, description: result.description };
  } catch (error) {
    console.error('Error getting infrastructure description:', error);
    return { success: false, error: 'Failed to generate description. Please try again.' };
  }
}
