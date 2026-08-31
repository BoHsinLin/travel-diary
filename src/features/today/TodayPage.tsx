import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import heroImage from '../../assets/figma/today-hero-figma.png';
import { useTripData } from '../../app/TripDataContext';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';
import { PaceChip } from '../../components/primitives/Objects';
import { NextStopPanel } from '../../components/itinerary/ItineraryObjects';
import { Icon, ItineraryCategoryIcon } from '../../components/icons/Icon';
import { useTrip, useTripDays } from '../trips/queries';
import './today.css';

export function TodayPage() {
  const { tripId } = useParams();
  const { data: trip } = useTrip(tripId);
  const { data: tripDays = [] } = useTripDays(tripId);
  const { days, loadDay } = useTripData();
  const [view, setView] = useState<'timeline' | 'map'>('timeline');

  useEffect(() => { if (trip?.currentDayId) void loadDay(trip.currentDayId); }, [trip?.currentDayId, loadDay]);
  if (!trip) return <main className="phone-shell">載入旅程中…</main>;

  const currentDay = tripDays.find(({ id }) => id === trip.currentDayId);
  const items = days[trip.currentDayId] ?? [];
  const fmt = (value: string) => new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: trip.timezone }).format(new Date(value));
  const dayDate = currentDay ? new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric', weekday: 'short', timeZone: trip.timezone }).format(new Date(`${currentDay.date}T12:00:00+09:00`)).replace('日', '日 ') : '';

  return <main className="app-shell">
    <div className="today-main">
      <section className="hero">
        <img className="hero__image" src={heroImage} alt={`${trip.destination} 5天4夜，2026年9月21日至25日，與2位旅伴同行，23°C`} />
        <button className="hero__note-hotspot" type="button" aria-label="開啟旅程筆記" />
      </section>
      <section className="today-content">
        <header className="day-header"><div><span>Day {currentDay?.sortOrder}</span><h2>{dayDate}</h2></div><div className="view-switch" role="group" aria-label="檢視方式"><button className={view === 'timeline' ? 'is-selected' : ''} onClick={() => setView('timeline')}><Icon name="list" size={16} />時間軸</button><button className={view === 'map' ? 'is-selected' : ''} onClick={() => setView('map')}><Icon name="map" size={16} />地圖</button></div></header>
        <div className="pace-line"><span>今日節奏</span><PaceChip pace="適中" selected /><p>步調剛剛好，悠閒體驗城市。</p></div>
        {view === 'timeline' ? <div className="editorial-timeline">{items.map((item, index) => <article key={item.id} className={`editorial-stop ${index === 0 ? 'is-next' : ''}`}><time>{fmt(item.startsAt)}</time><span className="stop-badge"><ItineraryCategoryIcon category={item.category} /></span><div><h3>{item.title}</h3><p>{item.meta}</p>{index === 0 && <button className="stop-navigation" type="button" aria-label={`開始導航至${item.title}`} title="開始導航"><Icon name="navigation" size={20} /><span className="stop-navigation__label">開始導航</span></button>}</div></article>)}</div> : <div className="mock-map" role="img" aria-label={`${trip.destination}今日行程地圖`}><div className="route-line" />{items.map((item, index) => <span key={item.id} className={`map-pin pin-${index === 0 ? 'one' : index === 1 ? 'two' : 'three'}`}>{index + 1}</span>)}<div className="map-card"><strong>今日路線</strong><span>{items.map(({ title }) => title).join('、')}</span></div></div>}
      </section>
      <BottomNavigation />
    </div>
    <aside className="desktop-panel"><span>Day {currentDay?.sortOrder} · 下一站</span>{items[0] && <NextStopPanel title={items[0].title} meta={items[0].meta} />}<Link to={`/trips/${tripId}/plan`}>開啟行程編排</Link></aside>
  </main>;
}
