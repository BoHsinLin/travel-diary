import type { ItineraryItem } from '../../contracts/entities';

export interface ItineraryRepository {
  list(tripDayId: string): Promise<ItineraryItem[]>;
  reorder(tripDayId: string, itemIds: string[]): Promise<ItineraryItem[]>;
  add(tripDayId: string, item: ItineraryItem): Promise<ItineraryItem[]>;
  update(itemId:string,expectedVersion:number,patch:Partial<Pick<ItineraryItem,'title'|'startsAt'|'durationMinutes'|'meta'|'status'>>):Promise<ItineraryItem>;
  remove(item:ItineraryItem):Promise<void>;
  moveAcross(item:ItineraryItem,targetDayId:string,targetIndex:number):Promise<void>;
  subscribe(tripDayIds:string[],onChange:()=>void):()=>void;
}
