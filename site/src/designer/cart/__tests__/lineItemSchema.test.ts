import { describe, it, expect } from 'vitest';
import { designLineItemMetadataSchema } from '../lineItemSchema';

describe('designLineItemMetadataSchema', () => {
  it('accepts a complete metadata payload', () => {
    const payload = {
      templateId: 'alex',
      customText: { foreground: 'Sophia' },
      materials: [
        {
          layerId: 'base',
          materialId: 'gold-mirror',
          materialName: 'Gold Mirror',
          finish: 'mirror' as const,
          color: '#d6b769',
          thicknessMm: 5,
        },
        {
          layerId: 'foreground',
          materialId: 'black-matte',
          materialName: 'Black Matte',
          finish: 'matte' as const,
          color: '#1a1b1f',
          thicknessMm: 5,
        },
      ],
      fonts: [
        {
          layerId: 'foreground',
          fontFamily: 'Anton',
          fontUrl: '/fonts/Anton-Regular.ttf',
        },
      ],
      dimensions: { widthCm: 32, heightCm: 9, totalDepthMm: 10 },
      borderThicknessMm: 6,
      layerCount: 2,
    };
    expect(designLineItemMetadataSchema.parse(payload)).toEqual(payload);
  });

  it('rejects unknown finish values', () => {
    const result = designLineItemMetadataSchema.safeParse({
      templateId: 'x',
      customText: {},
      materials: [
        {
          layerId: 'base',
          materialId: 'x',
          materialName: 'x',
          finish: 'velvet',
          color: '#000',
          thicknessMm: 5,
        },
      ],
      fonts: [],
      dimensions: { widthCm: 10, heightCm: 10, totalDepthMm: 5 },
      borderThicknessMm: 5,
      layerCount: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative dimensions', () => {
    const result = designLineItemMetadataSchema.safeParse({
      templateId: 'x',
      customText: {},
      materials: [
        {
          layerId: 'base',
          materialId: 'x',
          materialName: 'x',
          finish: 'matte',
          color: '#000',
          thicknessMm: -1,
        },
      ],
      fonts: [],
      dimensions: { widthCm: -10, heightCm: 10, totalDepthMm: 5 },
      borderThicknessMm: 5,
      layerCount: 1,
    });
    expect(result.success).toBe(false);
  });
});
