import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_PUBLISHABLE_KEY
const password = process.env.SUPABASE_SMOKE_PASSWORD

if (!url || !key || !password) {
  throw new Error('Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SMOKE_PASSWORD')
}

const ids = {
  owner: '90000000-0000-0000-0000-000000000001',
  outsider: '90000000-0000-0000-0000-000000000002',
  editor: '90000000-0000-0000-0000-000000000003',
  viewer: '90000000-0000-0000-0000-000000000004',
  trip: '90000000-0000-0000-0000-000000000100',
  day1: '90000000-0000-0000-0000-000000000201',
  day2: '90000000-0000-0000-0000-000000000202',
  place1: '90000000-0000-0000-0000-000000000301',
  place2: '90000000-0000-0000-0000-000000000302',
  item1: '90000000-0000-0000-0000-000000000401',
  item2: '90000000-0000-0000-0000-000000000402',
  item3: '90000000-0000-0000-0000-000000000403',
}

const emails = {
  owner: 'backend-owner@travelplanner.test',
  outsider: 'backend-outsider@travelplanner.test',
  editor: 'backend-editor@travelplanner.test',
  viewer: 'backend-viewer@travelplanner.test',
}

const results = []
const record = (name, ok, detail) => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${JSON.stringify(detail)}`)
  if (!ok) throw new Error(name)
}

const auth = async (name) => {
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.auth.signInWithPassword({ email: emails[name], password })
  record(`auth.${name}`, !error && data.user?.id === ids[name], { user_id: data.user?.id, code: error?.code })
  return { client, token: data.session.access_token }
}

const headers = (token, prefer) => ({
  apikey: key,
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  ...(prefer ? { Prefer: prefer } : {}),
})

const request = async (token, path, init = {}) => {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(token, init.prefer), ...init.headers },
  })
  const text = await response.text()
  let body = text
  try { body = text ? JSON.parse(text) : null } catch {}
  return { status: response.status, body, code: body?.code, hint: body?.hint }
}

const expectStatus = (name, response, statuses) => {
  record(name, statuses.includes(response.status), {
    http: response.status,
    code: response.code,
    hint: response.hint,
    message: response.body?.message,
    rows: Array.isArray(response.body) ? response.body.length : undefined,
  })
}

const digest = (value) => createHash('sha256').update(value).digest('hex')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const owner = await auth('owner')
const outsider = await auth('outsider')
const editor = await auth('editor')
const viewer = await auth('viewer')

// A prior interrupted run may leave the deterministic trip. Its owner can remove it safely.
const cleanup = await request(owner.token, `trips?id=eq.${ids.trip}`, { method: 'DELETE' })
expectStatus('cleanup.prior_trip', cleanup, [204])

let response = await request(owner.token, 'trips', {
  method: 'POST', prefer: 'return=minimal',
  body: JSON.stringify({ id: ids.trip, owner_id: ids.owner, title: 'Final integration smoke', destination: 'Seoul', timezone: 'Asia/Seoul', start_date: '2026-09-01', end_date: '2026-09-02', currency: 'KRW' }),
})
expectStatus('rest.owner.create_trip', response, [201])

response = await request(owner.token, 'trip_members', {
  method: 'POST', prefer: 'return=minimal',
  body: JSON.stringify({ trip_id: ids.trip, user_id: ids.owner, display_name: 'Backend Owner', role: 'owner' }),
})
expectStatus('rest.owner.create_self_membership', response, [201])

response = await request(owner.token, 'trip_members', {
  method: 'POST', prefer: 'return=representation',
  body: JSON.stringify([
    { trip_id: ids.trip, user_id: ids.editor, display_name: 'Backend Editor', role: 'editor' },
    { trip_id: ids.trip, user_id: ids.viewer, display_name: 'Backend Viewer', role: 'viewer' },
  ]),
})
expectStatus('rest.owner.create_members', response, [201])

response = await request(owner.token, 'trip_days', {
  method: 'POST', prefer: 'return=representation',
  body: JSON.stringify([
    { id: ids.day1, trip_id: ids.trip, date: '2026-09-01', title: 'Day 1', sort_key: 'a0' },
    { id: ids.day2, trip_id: ids.trip, date: '2026-09-02', title: 'Day 2', sort_key: 'b0' },
  ]),
})
expectStatus('rest.owner.create_days', response, [201])

response = await request(editor.token, 'places', {
  method: 'POST', prefer: 'return=representation',
  body: JSON.stringify([
    { id: ids.place1, trip_id: ids.trip, name: 'Smoke Place 1', category: 'heritage', region: 'Seoul', suggested_duration_minutes: 60 },
    { id: ids.place2, trip_id: ids.trip, name: 'Smoke Place 2', category: 'food', region: 'Seoul', suggested_duration_minutes: 60 },
  ]),
})
expectStatus('rest.editor.create_places', response, [201])

for (const [role, session, expected] of [
  ['owner', owner, 1], ['viewer', viewer, 1], ['non_member', outsider, 0],
]) {
  for (const [table, filter] of [
    ['trips', `id=eq.${ids.trip}`], ['trip_days', `trip_id=eq.${ids.trip}`],
    ['trip_members', `trip_id=eq.${ids.trip}`], ['places', `trip_id=eq.${ids.trip}`],
  ]) {
    response = await request(session.token, `${table}?${filter}`)
    const count = Array.isArray(response.body) ? response.body.length : -1
    record(`rest.${role}.read_${table}`, response.status === 200 && (expected ? count > 0 : count === 0), { http: response.status, rows: count })
  }
}

for (const [role, session] of [['viewer', viewer], ['non_member', outsider]]) {
  response = await request(session.token, 'places', {
    method: 'POST', prefer: 'return=representation',
    body: JSON.stringify({ trip_id: ids.trip, name: `${role} denied`, category: 'generic', region: 'Seoul', suggested_duration_minutes: 30 }),
  })
  expectStatus(`rest.${role}.write_denied`, response, [401, 403])
}

const events = []
const channel = viewer.client.channel(`smoke-${Date.now()}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trip_events', filter: `trip_id=eq.${ids.trip}` }, (payload) => events.push(payload))
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Realtime subscribe timeout')), 12000)
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') { clearTimeout(timer); resolve() }
  })
})
await sleep(750)

response = await request(editor.token, 'itinerary_items', {
  method: 'POST', prefer: 'return=representation',
  body: JSON.stringify([
    { id: ids.item1, trip_day_id: ids.day1, place_id: ids.place1, starts_at: '2026-09-01T01:00:00Z', duration_minutes: 60, title: 'Realtime item 1', sort_key: 'a0' },
    { id: ids.item2, trip_day_id: ids.day1, place_id: ids.place2, starts_at: '2026-09-01T02:00:00Z', duration_minutes: 60, title: 'Realtime item 2', sort_key: 'b0' },
  ]),
})
expectStatus('realtime.editor.insert', response, [201])
await sleep(1000)

response = await request(editor.token, `itinerary_items?id=eq.${ids.item1}`, {
  method: 'PATCH', prefer: 'return=representation', body: JSON.stringify({ title: 'Realtime updated' }),
})
expectStatus('realtime.editor.update', response, [200])
await sleep(1000)

response = await request(editor.token, `rpc/update_itinerary_item_with_version`, {
  method: 'POST', body: JSON.stringify({ target_item_id: ids.item1, expected_version: 2, patch: { trip_day_id: ids.day2, sort_key: 'c0' } }),
})
expectStatus('realtime.editor.reorder', response, [200])
await sleep(1500)
const itineraryEvents = events.map((event) => event.new).filter((event) => event?.entity_table === 'itinerary_items')
record('realtime.viewer.receives_insert_update_reorder', itineraryEvents.some((event) => event.event_type === 'insert') && itineraryEvents.filter((event) => event.event_type === 'update').length >= 2, { entity_events: itineraryEvents.map((event) => event.event_type) })

response = await request(viewer.token, `itinerary_items?id=eq.${ids.item1}`, { method: 'PATCH', prefer: 'return=representation', body: JSON.stringify({ title: 'Viewer remote write' }) })
record('realtime.viewer.remote_update_denied', response.status === 200 && Array.isArray(response.body) && response.body.length === 0, { http: response.status, rows: response.body?.length })

response = await request(owner.token, 'rpc/update_trip_with_version', { method: 'POST', body: JSON.stringify({ target_trip_id: ids.trip, expected_version: 1, patch: { title: 'Versioned trip' } }) })
expectStatus('rpc.trip.success', response, [200])
response = await request(owner.token, 'rpc/update_trip_with_version', { method: 'POST', body: JSON.stringify({ target_trip_id: ids.trip, expected_version: 1, patch: { title: 'Stale trip' } }) })
expectStatus('rpc.trip.stale', response, [409])
record('rpc.trip.stale_hint', response.hint === 'VERSION_CONFLICT', { code: response.code, hint: response.hint })

response = await request(editor.token, 'rpc/update_trip_day_with_version', { method: 'POST', body: JSON.stringify({ target_day_id: ids.day1, expected_version: 1, patch: { title: 'Versioned day' } }) })
expectStatus('rpc.day.success', response, [200])
response = await request(editor.token, 'rpc/update_trip_day_with_version', { method: 'POST', body: JSON.stringify({ target_day_id: ids.day1, expected_version: 1, patch: { title: 'Stale day' } }) })
expectStatus('rpc.day.stale', response, [409])
record('rpc.day.stale_hint', response.hint === 'VERSION_CONFLICT', { code: response.code, hint: response.hint })

response = await request(editor.token, 'itinerary_items', { method: 'POST', prefer: 'return=representation', body: JSON.stringify({ id: ids.item3, trip_day_id: ids.day2, starts_at: '2026-09-02T03:00:00Z', duration_minutes: 30, title: 'Collision target', sort_key: 'd0' }) })
expectStatus('rpc.item.collision_fixture', response, [201])
response = await request(editor.token, 'rpc/update_itinerary_item_with_version', { method: 'POST', body: JSON.stringify({ target_item_id: ids.item1, expected_version: 3, patch: { sort_key: 'd0' } }) })
expectStatus('rpc.item.sort_collision', response, [409])
record('rpc.item.sort_hint', response.hint === 'SORT_KEY_CONFLICT', { code: response.code, hint: response.hint })

for (const [rpc, payload] of [
  ['update_trip_with_version', { target_trip_id: ids.trip, expected_version: 2, patch: { title: 'Denied' } }],
  ['update_trip_day_with_version', { target_day_id: ids.day1, expected_version: 2, patch: { title: 'Denied' } }],
  ['update_itinerary_item_with_version', { target_item_id: ids.item1, expected_version: 3, patch: { title: 'Denied' } }],
]) {
  response = await request(viewer.token, `rpc/${rpc}`, { method: 'POST', body: JSON.stringify(payload) })
  expectStatus(`rpc.viewer.${rpc}_denied`, response, [409])
}

const invites = [
  ['valid-lower-role', emails.editor, 'viewer', 'pending', '2099-01-01T00:00:00Z'],
  ['expired', emails.viewer, 'viewer', 'pending', '2020-01-01T00:00:00Z'],
  ['revoked', emails.owner, 'viewer', 'revoked', '2099-01-01T00:00:00Z'],
  ['mismatch', emails.outsider, 'viewer', 'pending', '2099-01-01T00:00:00Z'],
]
response = await request(owner.token, 'invitations', {
  method: 'POST', prefer: 'return=minimal',
  body: JSON.stringify(invites.map(([token, email, role, status, expires_at], index) => ({ id: `90000000-0000-0000-0000-00000000050${index + 1}`, trip_id: ids.trip, email, role, status, expires_at, token_hash: digest(token), created_by: ids.owner }))),
})
expectStatus('invitation.create_fixtures', response, [201])

for (const [name, session, token, statuses] of [
  ['email_mismatch', viewer, 'mismatch', [403]],
  ['expired', viewer, 'expired', [400]],
  ['revoked', owner, 'revoked', [400]],
  ['invalid', owner, 'invalid-token', [400]],
]) {
  response = await request(session.token, 'rpc/accept_trip_invitation', { method: 'POST', body: JSON.stringify({ invitation_token: token }) })
  expectStatus(`invitation.${name}`, response, statuses)
}

response = await request(editor.token, 'rpc/accept_trip_invitation', { method: 'POST', body: JSON.stringify({ invitation_token: 'valid-lower-role' }) })
expectStatus('invitation.valid', response, [200])
response = await request(editor.token, 'rpc/accept_trip_invitation', { method: 'POST', body: JSON.stringify({ invitation_token: 'valid-lower-role' }) })
expectStatus('invitation.retry', response, [200])
response = await request(owner.token, `trip_members?trip_id=eq.${ids.trip}&user_id=eq.${ids.editor}&select=role`)
record('invitation.no_role_downgrade', response.body?.[0]?.role === 'editor', { role: response.body?.[0]?.role })

response = await request(key, 'rpc/accept_trip_invitation', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: JSON.stringify({ invitation_token: 'valid-lower-role' }) })
expectStatus('invitation.anonymous_no_execute', response, [401])

response = await request(owner.token, `trip_events?trip_id=eq.${ids.trip}&entity_table=eq.invitations&select=payload`)
const serializedEvents = JSON.stringify(response.body)
record('realtime.invitation_payload_redacted', response.status === 200 && !serializedEvents.includes('token_hash') && !serializedEvents.includes('@travelplanner.test'), { http: response.status, rows: response.body?.length })

await viewer.client.removeChannel(channel)
console.log(`SUMMARY ${results.length}/${results.length} checks passed`)
console.log(`CLEANUP_DATA trip=${ids.trip} cascades days, items, memberships, invitations, events; places=${ids.place1},${ids.place2}`)
console.log(`CLEANUP_AUTH ${Object.values(ids).slice(0, 4).join(',')}`)
process.exit(0)
