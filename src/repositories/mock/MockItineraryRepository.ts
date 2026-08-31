import type { ItineraryCategory, ItineraryItem } from '../../contracts/entities';
import type { ItineraryRepository } from '../interfaces/ItineraryRepository';
const makeItem = (id: string, tripDayId: string, startsAt: string, title: string, meta: string, sortKey: string, category: ItineraryCategory, fixed = false): ItineraryItem => ({ id, tripDayId, startsAt, durationMinutes: 60, title, meta, type: 'place', category, status: 'planned', sortKey, version: 1, fixed });
const seed: Record<string, ItineraryItem[]> = {
  'day-001': [makeItem('item-flight', 'day-001', '2026-09-21T08:10:00+08:00', '桃園至仁川', 'KE692 · 固定行程', 'a0', 'flight', true)],
  'day-002': [makeItem('item-museum', 'day-002', '2026-09-22T10:40:00+09:00', '國立民俗博物館', '步行 4 分 · 停留 50 分', 'a0', 'museum'), makeItem('item-lunch', 'day-002', '2026-09-22T12:20:00+09:00', '土俗村蔘雞湯', '步行 12 分 · 午餐 70 分', 'b0', 'food')],
  'day-003': [makeItem('item-market', 'day-003', '2026-09-23T11:00:00+09:00', '廣藏市場', '午餐與市場散策', 'a0', 'shopping')],
};
export class MockItineraryRepository implements ItineraryRepository {
  private days = structuredClone(seed);
  async list(id: string) { return structuredClone(this.days[id] ?? []); }
  async reorder(id: string, itemIds: string[]) { const byId = new Map((this.days[id] ?? []).map((item) => [item.id, item])); this.days[id] = itemIds.map((itemId, index) => { const item = byId.get(itemId); return item ? { ...item, sortKey: `${String.fromCharCode(97 + index)}0`, version: item.version + 1 } : null; }).filter((item): item is ItineraryItem => Boolean(item)); return this.list(id); }
  async add(id: string, item: ItineraryItem) { const current = this.days[id] ?? []; if (!current.some((entry) => entry.id === item.id)) this.days[id] = [...current, item]; return this.list(id); }
  async update(itemId:string,expectedVersion:number,patch:Partial<ItineraryItem>){for(const day of Object.values(this.days)){const index=day.findIndex(item=>item.id===itemId);if(index>=0){const current=day[index];if(current.version!==expectedVersion)throw new Error('VERSION_CONFLICT');const next={...current,...patch,version:current.version+1};day[index]=next;return structuredClone(next)}}throw new Error('NOT_FOUND')}
  async remove(item:ItineraryItem){this.days[item.tripDayId]=(this.days[item.tripDayId]??[]).filter(entry=>entry.id!==item.id)}
  async moveAcross(item:ItineraryItem,targetDayId:string,targetIndex:number){await this.remove(item);const target=this.days[targetDayId]??[];target.splice(targetIndex,0,{...item,tripDayId:targetDayId,version:item.version+1});this.days[targetDayId]=target}
  subscribe(){return()=>undefined}
}
