import { NavLink, useParams } from 'react-router-dom';
import './navigation.css';
import { Icon, type IconName } from '../icons/Icon';

export function BottomNavigation() {
  const { tripId } = useParams();
  const items:{label:string;icon:IconName;to:string}[] = [{ label: '今日', icon: 'today', to: `/trips/${tripId}/today` }, { label: '行程', icon: 'plan', to: `/trips/${tripId}/plan` }, { label: '探索', icon: 'location', to: `/trips/${tripId}/places` }, { label: '旅伴', icon: 'people', to: `/trips/${tripId}/people` }];
  return <nav className="bottom-nav" aria-label="旅程主要導覽">{items.map((item) => <NavLink key={item.label} to={item.to} className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}><span className="bottom-nav__icon"><Icon name={item.icon} size={20}/></span>{item.label}</NavLink>)}</nav>;
}
