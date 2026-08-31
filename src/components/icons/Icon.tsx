import type { SVGProps } from 'react';
import { AlertCircle, AlertTriangle, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpFromLine, Banknote, BedDouble, Bell, Building2, Bus, CalendarDays, Camera, CheckCircle2, CircleHelp, Info, CirclePlus, CircleX, Clock3, Coffee, Compass, Copy, CreditCard, FileText, Footprints, GripVertical, Heart, House, Image, Languages, List, Lock, Luggage, Map, MapPin, Menu, MessageCircleMore, Navigation, NotebookTabs, PackageSearch, Palmtree, Pencil, Phone, Plane, ReceiptText, RefreshCw, Route, Search, Share2, Ship, ShoppingBag, SlidersHorizontal, Sparkles, Store, Ticket, TrainFront, Trash2, TriangleAlert, Unlock, UserRoundCheck, Users, Utensils, WalletCards, Waypoints, WifiOff, X, type LucideIcon } from 'lucide-react';
import type { ItineraryCategory } from '../../contracts/entities';
import type { TravelIconKey } from '../../contracts/icons';
import './icon.css';

/** Figma nodes 91:62, 99:74, 100:62 and 101:32 map stable keys to package assets. */
export type IconName = TravelIconKey | 'today' | 'plan' | 'trash';
const icons: Partial<Record<IconName, LucideIcon>> = {
  home:House,today:House,itinerary:NotebookTabs,plan:NotebookTabs,explore:Compass,people:Users,back:ArrowLeft,forward:ArrowRight,more:MessageCircleMore,close:X,add:CirclePlus,search:Search,filter:SlidersHorizontal,sort:Menu,edit:Pencil,delete:Trash2,trash:Trash2,share:Share2,favorite:Heart,'favorite-filled':Heart,drag:GripVertical,navigation:Navigation,location:MapPin,refresh:RefreshCw,map:Map,list:List,calendar:CalendarDays,
  clock:Clock3,duration:Clock3,route:Route,compass:Compass,language:Languages,currency:Banknote,wallet:WalletCards,receipt:ReceiptText,document:FileText,passport:CreditCard,luggage:Luggage,camera:Camera,photo:Image,phone:Phone,website:Waypoints,copy:Copy,download:ArrowDownToLine,upload:ArrowUpFromLine,lock:Lock,unlock:Unlock,
  info:Info,success:CheckCircle2,warning:AlertTriangle,error:CircleX,offline:WifiOff,syncing:RefreshCw,conflict:TriangleAlert,'read-only':Lock,notification:Bell,help:CircleHelp,
  heritage:Building2,food:Utensils,neighborhood:Store,cafe:Coffee,shopping:ShoppingBag,nature:Palmtree,museum:Building2,activity:Sparkles,hotel:BedDouble,airport:Plane,flight:Plane,train:TrainFront,subway:TrainFront,bus:Bus,walk:Footprints,taxi:Navigation,ferry:Ship,ticket:Ticket,reservation:UserRoundCheck,generic:PackageSearch,
};
export function Icon({name,size=24,className='',...props}:SVGProps<SVGSVGElement>&{name:IconName;size?:16|20|24}){const Asset=icons[name]??AlertCircle;return <Asset className={`icon ${className}`} size={size} aria-hidden focusable={false} data-icon-key={name} {...props}/>}
export function ItineraryCategoryIcon({category,size=24}:{category?:ItineraryCategory;size?:16|20|24}){return <Icon name={category??'generic'} size={size}/>}
