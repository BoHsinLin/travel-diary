import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTripData } from '../../app/TripDataContext';
import { Icon, ItineraryCategoryIcon } from '../../components/icons/Icon';
import { usePlace, usePlaces, useTrip, useTripDays } from '../trips/queries';
import { nextAppendSortKey, toZonedIso } from './itineraryPlanning';
import './place-flow.css';

function FlowHeader({ title, subtitle, back }: { title: string; subtitle?: string; back: string }) {
  return <header className="flow-header"><Link to={back}><Icon name="back" size={20} />返回</Link><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</header>;
}

export function ExplorePage() {
  const { tripId } = useParams(); const navigate = useNavigate(); const [query, setQuery] = useState(''); const [mode, setMode] = useState<'nearby' | 'popular'>('nearby');
  const { data: places = [], isLoading, isError, refetch } = usePlaces(tripId); const filtered = places.filter(({ name, categoryLabel }) => `${name}${categoryLabel}`.includes(query));
  return <main className="phone-shell flow-page"><FlowHeader title="探索景點" back={`/trips/${tripId}/plan`} /><section className="flow-body"><div className="location-bar"><span><Icon name="location" size={16} />目前位置 · 鐘路區</span><button aria-label="重新定位"><Icon name="refresh" size={20} /></button></div><label className="search-field"><span className="sr-only">搜尋景點</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋景點、餐廳或區域" /></label><div className="filter-row"><button className={mode === 'nearby' ? 'is-selected' : ''} onClick={() => setMode('nearby')}>附近景點</button><button className={mode === 'popular' ? 'is-selected' : ''} onClick={() => setMode('popular')}>熱門景點</button><button onClick={() => setQuery('咖啡')}>咖啡</button></div>{isLoading && <p className="state-card">正在尋找景點…</p>}{isError && <p className="state-card is-error">載入失敗。<button onClick={() => void refetch()}>重試</button></p>}{!isLoading && !filtered.length && <p className="state-card">找不到符合條件的景點，試試其他關鍵字。</p>}{filtered.map((place) => <article className="place-card" key={place.id}><span><ItineraryCategoryIcon category={place.category} /><small>{place.categoryLabel}</small></span><div><Link to={`/trips/${tripId}/places/${place.id}`}><h2>{place.name}</h2></Link><p>{place.travelMinutes} 分鐘路程</p><small>{place.rating} · 今日營業</small></div><button onClick={() => navigate(`/trips/${tripId}/plan/add/${place.id}`)}>加入</button></article>)}</section></main>;
}

export function AddPlacePage() {
  const { tripId, placeId } = useParams(); const navigate = useNavigate(); const { data: place } = usePlace(tripId, placeId); const { data: days = [] } = useTripDays(tripId);
  const [dayId, setDayId] = useState(''); const [startTime, setStartTime] = useState('14:15'); const selected = dayId || days[0]?.id || '';
  return <main className="phone-shell flow-page"><FlowHeader title="加入行程" subtitle={place?.name} back={`/trips/${tripId}/places`} /><section className="flow-body"><article className="place-summary"><strong>{place?.name ?? '載入中'}</strong><span>{place?.category} · 建議停留 {place?.suggestedDurationMinutes} 分</span><small>從上一站約 {place?.travelMinutes} 分鐘</small></article><h2 className="section-label">安排日期</h2><div className="day-picker">{days.map((day) => <button key={day.id} className={selected === day.id ? 'is-selected' : ''} onClick={() => setDayId(day.id)}>Day {day.sortOrder}</button>)}</div><div className="field-grid"><label>開始時間<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label>停留時間<select defaultValue={place?.suggestedDurationMinutes}><option value="25">25 分</option><option value="70">1 小時 10 分</option><option value="90">1 小時 30 分</option></select></label></div><label className="notes-field">備註<textarea placeholder="加入旅程備註…" /></label><button className="primary-action" disabled={!selected} onClick={() => navigate(`/trips/${tripId}/plan/conflict/${placeId}?day=${selected}&time=${encodeURIComponent(startTime)}`)}>加入行程 · {startTime}</button></section></main>;
}

export function ConflictPage() {
  const { tripId, placeId } = useParams(); const [params] = useSearchParams(); const navigate = useNavigate(); const { data: place } = usePlace(tripId, placeId); const { data: trip } = useTrip(tripId); const { data: tripDays = [] } = useTripDays(tripId);
  const { addPlace, days } = useTripData(); const [choice, setChoice] = useState('shorten'); const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle'); const dayId = params.get('day') ?? ''; const startTime = params.get('time') ?? '14:15'; const tripDay = tripDays.find((day) => day.id === dayId);
  const apply = async () => {
    if (!place || !trip || !tripDay) return;
    setState('saving');
    try {
      await addPlace(dayId, { id: crypto.randomUUID(), tripDayId: dayId, placeId: place.id, startsAt: toZonedIso(tripDay.date, startTime, trip.timezone), durationMinutes: choice === 'shorten' ? 25 : place.suggestedDurationMinutes, title: place.name, meta: `${place.categoryLabel} · 停留 ${choice === 'shorten' ? 25 : place.suggestedDurationMinutes} 分`, type: 'place', category: place.category, status: 'planned', sortKey: nextAppendSortKey(days[dayId] ?? []), version: 1 });
      navigate(`/trips/${tripId}/plan?day=${dayId}&updated=1`);
    } catch { setState('error'); }
  };
  return <main className="phone-shell flow-page"><FlowHeader title="時間發生衝突" subtitle={`加入${place?.name ?? '景點'}後超出可用時間`} back={`/trips/${tripId}/plan/add/${placeId}`} /><section className="flow-body"><article className="conflict-summary"><strong>晚了 45 分鐘</strong><span>預計 15:25 結束，但下一個固定預約需在 15:00 抵達。</span></article>{state === 'error' && <p className="state-card is-error" role="alert">儲存失敗，原行程沒有變更。請再試一次。</p>}<h2 className="section-label">選擇解決方式</h2>{[['shorten', '縮短停留時間', '保留其他行程'], ['holding', '移至暫存區', '稍後再安排'], ['keep', '仍要加入並保留衝突', '顯示警告標記']].map(([value, title, meta]) => <label key={value} className={`resolution ${choice === value ? 'is-selected' : ''}`}><input type="radio" name="resolution" value={value} checked={choice === value} onChange={() => setChoice(value)} /><span><strong>{title}</strong><small>{meta}</small></span></label>)}<button className="primary-action" disabled={state === 'saving' || !tripDay || !trip} aria-busy={state === 'saving'} onClick={apply}>{state === 'saving' ? '正在儲存…' : '套用建議並加入'}</button></section></main>;
}
