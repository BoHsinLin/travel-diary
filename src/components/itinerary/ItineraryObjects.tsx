import type { ItineraryItem } from '../../contracts/entities';
import './itinerary.css';
import { Icon } from '../icons/Icon';

export function ItineraryRow({ item }: { item: ItineraryItem }) {
  return <article className="itinerary-row"><time>{new Date(item.startsAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}</time><span className={`timeline-dot timeline-dot--${item.type}`} aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.meta}</p></div><Icon name="back" size={16} className="itinerary-row__arrow" /></article>;
}

export function FixedAnchor({ title, meta }: { title: string; meta: string }) {
  return <article className="fixed-anchor"><span>固定行程</span><h3>{title}</h3><p>{meta}</p></article>;
}

export function NextStopPanel({ title, meta }: { title: string; meta: string }) {
  return <article className="next-stop"><div><span>下一站 · 10:30</span><h2>{title}</h2><p>{meta}</p></div><button type="button" aria-label={`前往${title}`}>前往</button></article>;
}
