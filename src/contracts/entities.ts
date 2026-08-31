export type EntityId = string;
export type ISODate = string;
export type ISODateTime = string;
export type IANATimeZone = string;
export type Role = 'owner' | 'admin' | 'editor' | 'viewer';
export type Pace = 'very_relaxed' | 'relaxed' | 'balanced' | 'full' | 'intense';
export type SyncState = 'saving' | 'synced' | 'offline' | 'failed' | 'conflict';
export type ItemStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled';
export type ItineraryCategory = 'heritage' | 'food' | 'neighborhood' | 'cafe' | 'shopping' | 'nature' | 'museum' | 'activity' | 'hotel' | 'airport' | 'flight' | 'train' | 'subway' | 'bus' | 'walk' | 'taxi' | 'ferry' | 'ticket' | 'reservation' | 'generic';
export interface Trip { id: EntityId; ownerId: EntityId; title: string; destination: string; timezone: IANATimeZone; startDate: ISODate; endDate: ISODate; defaultPace: Pace; currency: 'KRW' | 'JPY' | 'TWD'; currentDayId: EntityId; }
export interface TripMember { tripId: EntityId; userId: EntityId; displayName: string; role: Role; }
export interface TripDay { id: EntityId; tripId: EntityId; date: ISODate; title: string; paceOverride?: Pace; sortOrder: number; }
export interface Place { id: EntityId; name: string; category: ItineraryCategory; categoryLabel: string; region: string; travelMinutes: number; suggestedDurationMinutes: number; rating?: number; }
export interface Invitation { id: EntityId; tripId: EntityId; email: string; role: Exclude<Role, 'owner'>; expiresAt: ISODateTime; }
export interface ItineraryItem { id: EntityId; tripDayId: EntityId; placeId?: EntityId; startsAt: ISODateTime; durationMinutes: number; title: string; meta: string; type: 'place' | 'transit'; category: ItineraryCategory; status: ItemStatus; sortKey: string; version: number; fixed?: boolean; }
export interface AppError { code: string; message: string; retryable: boolean; field?: string; }
export interface PageResult<T> { items: T[]; nextCursor: string | null; }
