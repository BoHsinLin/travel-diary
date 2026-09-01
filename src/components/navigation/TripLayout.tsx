import { NavLink,Outlet,useParams } from 'react-router-dom';
import { Icon,type IconName } from '../icons/Icon';
import { ChangeNotifications } from '../../features/discovery/ChangeNotifications';
import './navigation.css';

export function TripLayout(){
  const{tripId}=useParams();
  const items:{label:string;icon:IconName;to:string}[]=[
    {label:'今日',icon:'home',to:`/trips/${tripId}/today`},{label:'行程',icon:'itinerary',to:`/trips/${tripId}/plan`},
    {label:'探索',icon:'explore',to:`/trips/${tripId}/places`},{label:'旅伴',icon:'people',to:`/trips/${tripId}/people`},
  ];
  return <div className="trip-layout"><aside className="desktop-sidebar"><NavLink className="desktop-sidebar__brand" to="/trips" aria-label="所有旅程">旅</NavLink><nav aria-label="旅程主要導覽">{items.map(item=><NavLink key={item.label} to={item.to} className={({isActive})=>isActive?'is-active':''}><Icon name={item.icon}/><span>{item.label}</span></NavLink>)}</nav></aside><div className="trip-layout__content"><Outlet/><ChangeNotifications tripId={tripId}/></div></div>;
}
