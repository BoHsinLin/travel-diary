import type { ReactNode } from 'react';
import './objects.css';

export function Avatar({ label, more = false }: { label: string; more?: boolean }) {
  return <span className={`avatar ${more ? 'avatar--more' : ''}`} aria-label={more ? `另有 ${label} 位旅伴` : label}>{more ? `+${label}` : label.slice(0, 1)}</span>;
}

export function AvatarGroup({ names, extra = 0 }: { names: string[]; extra?: number }) {
  return <div className="avatar-group" aria-label="同行旅伴">{names.map((name) => <Avatar key={name} label={name} />)}{extra > 0 && <Avatar label={String(extra)} more />}</div>;
}

export function PaceChip({ pace, selected = false }: { pace: string; selected?: boolean }) {
  return <span className={`pace-chip ${selected ? 'pace-chip--selected' : ''}`}>{pace}</span>;
}

export function StatusNotice({ type, title, children }: { type: 'info' | 'success' | 'warning' | 'conflict'; title: string; children: ReactNode }) {
  return <div className={`status-notice status-notice--${type}`} role={type === 'conflict' ? 'alert' : 'status'}><strong>{title}</strong><span>{children}</span></div>;
}
