import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ItineraryCategory, ItineraryItem } from '../../contracts/entities';
import { normalizeItineraryCategory } from '../../contracts/icons';
import { supabase } from '../../lib/supabase';
import { mapSupabaseError } from '../../lib/supabaseError';
import type { Database, Json } from '../../../supabase/types/database.types';
import type { ItineraryRepository } from '../interfaces/ItineraryRepository';
type Row=Database['public']['Tables']['itinerary_items']['Row'];
const map=(row:Row,category:ItineraryCategory='generic'):ItineraryItem=>({id:row.id,tripDayId:row.trip_day_id,placeId:row.place_id??undefined,startsAt:row.starts_at,durationMinutes:row.duration_minutes,title:row.title,meta:row.meta,type:row.type,category:normalizeItineraryCategory(category),status:row.status,sortKey:row.sort_key,version:row.version,fixed:row.fixed});
const fail=(error:{message:string;code?:string;hint?:string|null;status?:number}|null)=>{if(error)throw mapSupabaseError(error)};
export class SupabaseItineraryRepository implements ItineraryRepository{
  private get client(){if(!supabase)throw new Error('Supabase is not configured');return supabase}
  async list(dayId:string){const{data,error}=await this.client.from('itinerary_items').select('*').eq('trip_day_id',dayId).order('sort_key');fail(error);return(data??[]).map(row=>map(row))}
  async reorder(dayId:string,itemIds:string[]){const current=await this.list(dayId);for(const[itemIndex,id]of itemIds.entries()){const item=current.find(entry=>entry.id===id);if(!item)continue;await this.update(id,item.version,{sortKey:`${String(itemIndex).padStart(4,'0')}`} as Partial<ItineraryItem>)}return this.list(dayId)}
  async add(dayId:string,item:ItineraryItem){const{error}=await this.client.from('itinerary_items').insert({id:item.id,trip_day_id:dayId,place_id:item.placeId,duration_minutes:item.durationMinutes,title:item.title,meta:item.meta,type:item.type,status:item.status,sort_key:item.sortKey,starts_at:item.startsAt,fixed:Boolean(item.fixed),version:item.version});fail(error);return this.list(dayId)}
  async update(itemId:string,expectedVersion:number,patch:Partial<ItineraryItem>){const dbPatch:Record<string,Json|undefined>={title:patch.title,starts_at:patch.startsAt,duration_minutes:patch.durationMinutes,meta:patch.meta,status:patch.status,sort_key:patch.sortKey,trip_day_id:patch.tripDayId};Object.keys(dbPatch).forEach(key=>dbPatch[key]===undefined&&delete dbPatch[key]);const{data,error}=await this.client.rpc('update_itinerary_item_with_version',{target_item_id:itemId,expected_version:expectedVersion,patch:dbPatch});fail(error);if(!data)throw mapSupabaseError({code:'PT409',hint:'VERSION_CONFLICT'});return map(data)}
  async remove(item:ItineraryItem){const{error,count}=await this.client.from('itinerary_items').delete({count:'exact'}).eq('id',item.id).eq('version',item.version);fail(error);if(count===0)throw mapSupabaseError({code:'PT409',hint:'VERSION_CONFLICT'})}
  async moveAcross(item:ItineraryItem,targetDayId:string,targetIndex:number){await this.update(item.id,item.version,{tripDayId:targetDayId,sortKey:`${String(targetIndex).padStart(4,'0')}`} as Partial<ItineraryItem>)}
  subscribe(dayIds:string[],onChange:()=>void){let channel:RealtimeChannel=this.client.channel(`itinerary:${dayIds.join(',')}`);channel=channel.on('postgres_changes',{event:'*',schema:'public',table:'itinerary_items'},payload=>{const row=(payload.new&&Object.keys(payload.new).length?payload.new:payload.old)as Partial<Row>;if(row.trip_day_id&&dayIds.includes(row.trip_day_id))onChange()}).subscribe();return()=>{void this.client.removeChannel(channel)}}
}
