import type { ItineraryCategory } from './entities';

export const itineraryCategoryIconKeys = ['heritage','food','neighborhood','cafe','shopping','nature','museum','activity','hotel','airport','flight','train','subway','bus','walk','taxi','ferry','ticket','reservation','generic'] as const satisfies readonly ItineraryCategory[];
export const uiActionIconKeys = ['home','itinerary','explore','people','back','forward','more','close','add','search','filter','sort','edit','delete','share','favorite','favorite-filled','drag','navigation','location','refresh','map','list','calendar'] as const;
export const tripUtilityIconKeys = ['clock','duration','route','compass','language','currency','wallet','receipt','document','passport','luggage','camera','photo','phone','website','copy','download','upload','lock','unlock'] as const;
export const statusServiceIconKeys = ['info','success','warning','error','offline','syncing','conflict','read-only','notification','help'] as const;

export type UIActionIconKey = typeof uiActionIconKeys[number];
export type TripUtilityIconKey = typeof tripUtilityIconKeys[number];
export type StatusServiceIconKey = typeof statusServiceIconKeys[number];
export type TravelIconKey = ItineraryCategory | UIActionIconKey | TripUtilityIconKey | StatusServiceIconKey;

export const travelIconRegistry = { category: itineraryCategoryIconKeys, action: uiActionIconKeys, utility: tripUtilityIconKeys, status: statusServiceIconKeys } as const;
export const isItineraryCategory = (value: string): value is ItineraryCategory => (itineraryCategoryIconKeys as readonly string[]).includes(value);
export const normalizeItineraryCategory = (value: string | null | undefined): ItineraryCategory => value && isItineraryCategory(value) ? value : 'generic';
