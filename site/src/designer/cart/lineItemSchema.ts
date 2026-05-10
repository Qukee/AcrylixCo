import { z } from 'zod';

const layerMaterialSummary = z.object({
  layerId: z.string(),
  materialId: z.string(),
  materialName: z.string(),
  finish: z.enum(['mirror', 'matte', 'frosted', 'gloss', 'glitter', 'neon', 'clear', 'glow']),
  color: z.string(),
  thicknessMm: z.number().positive(),
});

const layerFontSummary = z.object({
  layerId: z.string(),
  fontFamily: z.string(),
  fontUrl: z.string(),
});

export const designLineItemMetadataSchema = z.object({
  // Which template the design started from.
  templateId: z.string(),
  // Customer text, per text layer (Unicode preserved).
  customText: z.record(z.string(), z.string()),
  // Per-layer materials.
  materials: z.array(layerMaterialSummary).min(1),
  // Per-text-layer fonts.
  fonts: z.array(layerFontSummary),
  // Overall piece dimensions.
  dimensions: z.object({
    widthCm: z.number().positive(),
    heightCm: z.number().positive(),
    totalDepthMm: z.number().positive(),
  }),
  // Border thickness (offset) in millimetres.
  borderThicknessMm: z.number().positive(),
  // Convenience field — number of layers including base.
  layerCount: z.number().int().positive(),
  // URL of the rendered preview snapshot (S3 / Railway storage). Optional
  // until Phase 3 wires up storage.
  previewImageUrl: z.string().url().optional(),
});

export type DesignLineItemMetadata = z.infer<typeof designLineItemMetadataSchema>;
