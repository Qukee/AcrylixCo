'use client';

import { useMemo } from 'react';
import { MATERIAL_CATALOG } from '../materials/catalog';
import type { FinishKind, MaterialDef } from '../types';
import './MaterialPicker.css';

interface MaterialPickerProps {
  layerKey: string;
  layerLabel: string;
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Per-layer swatch picker. Materials are grouped by finish category to mirror
 * the catalog organization. Each swatch is rendered with a CSS approximation
 * of its finish — not a substitute for the 3D preview, but a recognisable
 * affordance.
 */
export function MaterialPicker({ layerKey, layerLabel, selectedId, onSelect }: MaterialPickerProps) {
  const groups = useMemo(() => groupByFinish(MATERIAL_CATALOG), []);
  const selected = MATERIAL_CATALOG.find((m) => m.id === selectedId);

  return (
    <div className="picker">
      <header className="picker__head">
        <span className="picker__layer-label">{layerLabel}</span>
        <span className="picker__current">
          {selected?.name ?? 'None'}
          <em className="picker__finish">· {selected?.finish ?? ''}</em>
        </span>
      </header>
      <div className="picker__groups">
        {Array.from(groups.entries()).map(([finish, mats]) => (
          <div className="picker__group" key={finish}>
            <span className="picker__group-name">{titleCase(finish)}</span>
            <div className="picker__swatches">
              {mats.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  title={`${m.name} (${m.finish})`}
                  aria-label={`${layerKey}: ${m.name}`}
                  aria-pressed={m.id === selectedId}
                  className={`swatch swatch--${m.finish} ${m.id === selectedId ? 'is-selected' : ''}`}
                  onClick={() => onSelect(m.id)}
                  style={{ ['--swatch-color' as string]: m.color }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function groupByFinish(materials: MaterialDef[]): Map<FinishKind, MaterialDef[]> {
  const m = new Map<FinishKind, MaterialDef[]>();
  for (const mat of materials) {
    if (!m.has(mat.finish)) m.set(mat.finish, []);
    m.get(mat.finish)!.push(mat);
  }
  return m;
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
