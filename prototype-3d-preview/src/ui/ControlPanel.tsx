import { useState } from 'react';
import type { DesignerState, PieceSpec } from '../types';
import { TEST_PIECES } from '../geometry/pieces';
import { MaterialPicker } from './MaterialPicker';
import './ControlPanel.css';

interface ControlPanelProps {
  piece: PieceSpec;
  state: DesignerState;
  onStateChange: (next: DesignerState) => void;
  pieceId: string;
  onPieceChange: (id: string) => void;
}

export default function ControlPanel({
  piece,
  state,
  onStateChange,
  pieceId,
  onPieceChange,
}: ControlPanelProps) {
  const [openSection, setOpenSection] = useState<string | null>('text');

  const update = (patch: Partial<DesignerState>) => onStateChange({ ...state, ...patch });

  const setLayerMaterial = (layerKey: string, materialId: string) => {
    update({ layerMaterials: { ...state.layerMaterials, [layerKey]: materialId } });
  };

  const setCustomText = (layerId: string, text: string) => {
    update({ customText: { ...state.customText, [layerId]: text } });
  };

  const orderedLayerKeys = ['base', ...piece.layers.map((l) => l.id)];
  const layerLabel: Record<string, string> = {
    base: 'Base layer',
  };
  for (const l of piece.layers) {
    layerLabel[l.id] = labelForLayer(l.kind, l.id);
  }
  const textLayers = piece.layers.filter((l) => l.content.type === 'text');

  return (
    <aside className="panel">
      <header className="panel__head">
        <span className="panel__eyebrow">Designer</span>
        <h2 className="panel__title">{piece.displayName}</h2>
        <p className="panel__sub">
          Width ≈ {piece.approxWidthCm} cm · {orderedLayerKeys.length} layers · border{' '}
          {state.borderThicknessMm} mm
        </p>
      </header>

      {textLayers.length > 0 && (
        <Section
          id="text"
          title="Your text"
          meta={textLayers.length === 1 ? '1 line' : `${textLayers.length} lines`}
          open={openSection === 'text'}
          onToggle={(id) => setOpenSection(openSection === id ? null : id)}
        >
          <div className="text-stack">
            {textLayers.map((layer) => {
              const placeholder =
                layer.content.type === 'text' ? layer.content.text : '';
              const value = state.customText[layer.id] ?? placeholder;
              return (
                <div className="control-row" key={layer.id}>
                  <label className="control-label" htmlFor={`text-${layer.id}`}>
                    {layerLabel[layer.id]}
                    <span className="control-label__value">
                      {value.length} chars
                    </span>
                  </label>
                  <input
                    id={`text-${layer.id}`}
                    className="text-input"
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    spellCheck={false}
                    autoComplete="off"
                    maxLength={32}
                    onChange={(e) => setCustomText(layer.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <Section
        id="piece"
        title="Composition"
        meta="Template"
        open={openSection === 'piece'}
        onToggle={(id) => setOpenSection(openSection === id ? null : id)}
      >
        <div className="piece-list">
          {TEST_PIECES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`piece-list__item ${p.id === pieceId ? 'is-active' : ''}`}
              onClick={() => onPieceChange(p.id)}
            >
              <span className="piece-list__index">
                {String(TEST_PIECES.indexOf(p) + 1).padStart(2, '0')}
              </span>
              <span className="piece-list__name">{p.displayName}</span>
              <span className="piece-list__meta">{p.approxWidthCm} cm</span>
            </button>
          ))}
        </div>
      </Section>

      <Section
        id="materials"
        title="Materials"
        meta={`${orderedLayerKeys.length} layers`}
        open={openSection === 'materials'}
        onToggle={(id) => setOpenSection(openSection === id ? null : id)}
      >
        <div className="material-stack">
          {orderedLayerKeys.map((key) => (
            <MaterialPicker
              key={key}
              layerKey={key}
              layerLabel={layerLabel[key]}
              selectedId={state.layerMaterials[key] ?? piece.defaults.layerMaterials[key]}
              onSelect={(id) => setLayerMaterial(key, id)}
            />
          ))}
        </div>
      </Section>

      <Section
        id="dimensions"
        title="Dimensions"
        meta={`${state.borderThicknessMm} mm border`}
        open={openSection === 'dimensions'}
        onToggle={(id) => setOpenSection(openSection === id ? null : id)}
      >
        <div className="control-row">
          <label className="control-label" htmlFor="border-thickness">
            Border thickness
            <span className="control-label__value">{state.borderThicknessMm} mm</span>
          </label>
          <input
            id="border-thickness"
            type="range"
            min={2}
            max={15}
            step={0.5}
            value={state.borderThicknessMm}
            onChange={(e) => update({ borderThicknessMm: Number(e.target.value) })}
          />
          <div className="control-range-marks">
            <span>2</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
          </div>
        </div>
      </Section>

      <Section
        id="view"
        title="Preview"
        meta={state.viewMode.toUpperCase()}
        open={openSection === 'view'}
        onToggle={(id) => setOpenSection(openSection === id ? null : id)}
      >
        <div className="toggle-row">
          <ToggleGroup
            value={state.viewMode}
            onChange={(v) => update({ viewMode: v })}
            options={[
              { value: '2d', label: '2D' },
              { value: '3d', label: '3D' },
            ]}
          />
        </div>

        <div className="toggle-row">
          <SwitchRow
            label="Auto-rotate"
            checked={state.autoRotate}
            onChange={(v) => update({ autoRotate: v })}
          />
        </div>

        <div className="toggle-row">
          <SwitchRow
            label="Glow night mode"
            checked={state.glowMode === 'night'}
            onChange={(v) => update({ glowMode: v ? 'night' : 'day' })}
          />
        </div>

        <div className="toggle-row">
          <SwitchRow
            label="Show fps stats"
            checked={state.showStats}
            onChange={(v) => update({ showStats: v })}
          />
        </div>
      </Section>

      <footer className="panel__foot">
        <span>Prototype · acrylic IOR 1.49</span>
      </footer>
    </aside>
  );
}

function labelForLayer(kind: string, id: string): string {
  const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
  return `${cap} (${id})`;
}

interface SectionProps {
  id: string;
  title: string;
  meta?: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

function Section({ id, title, meta, open, onToggle, children }: SectionProps) {
  return (
    <section className={`section ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="section__header"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="section__title">{title}</span>
        {meta && <span className="section__meta">{meta}</span>}
        <span className={`section__chevron ${open ? 'is-open' : ''}`} aria-hidden>
          ↓
        </span>
      </button>
      {open && <div className="section__body">{children}</div>}
    </section>
  );
}

interface ToggleGroupProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}

function ToggleGroup<T extends string>({ value, onChange, options }: ToggleGroupProps<T>) {
  return (
    <div className="toggle-group" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          className={`toggle-group__btn ${opt.value === value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="switch-row">
      <span className="switch-row__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`switch ${checked ? 'is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </label>
  );
}
