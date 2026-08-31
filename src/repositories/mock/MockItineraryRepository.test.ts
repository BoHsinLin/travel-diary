import { describe, expect, it } from 'vitest';
import { MockItineraryRepository } from './MockItineraryRepository';

describe('MockItineraryRepository vertical slice', () => {
  it('adds and reorders an itinerary item while advancing versions', async () => {
    const repository = new MockItineraryRepository();
    const before = await repository.list('day-002');
    await repository.add('day-002', { ...before[0], id: 'item-new', title: '北村韓屋村', sortKey: 'z0' });
    const reordered = await repository.reorder('day-002', ['item-new', ...before.map(({ id }) => id)]);
    expect(reordered.map(({ id }) => id)).toEqual(['item-new', ...before.map(({ id }) => id)]);
    expect(reordered[0].version).toBeGreaterThan(1);
  });
  it('rejects stale expected versions', async()=>{const repository=new MockItineraryRepository();await expect(repository.update('item-museum',99,{title:'stale'})).rejects.toThrow('VERSION_CONFLICT')});
  it('moves an editable item across days and removes it',async()=>{const repository=new MockItineraryRepository();const[item]=await repository.list('day-003');await repository.moveAcross(item,'day-002',1);expect((await repository.list('day-003')).map(({id})=>id)).not.toContain(item.id);const moved=(await repository.list('day-002')).find(({id})=>id===item.id)!;expect(moved.tripDayId).toBe('day-002');await repository.remove(moved);expect((await repository.list('day-002')).map(({id})=>id)).not.toContain(item.id)});
});
