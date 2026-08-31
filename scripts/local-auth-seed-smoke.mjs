const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const anonKey = process.env.SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!anonKey || !serviceRoleKey) {
  throw new Error('Set SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY from `supabase status -o env`.')
}

const fixtures = new Map([
  ['owner@example.com', '00000000-0000-0000-0000-000000000101'],
  ['admin@example.com', '00000000-0000-0000-0000-000000000102'],
  ['editor@example.com', '00000000-0000-0000-0000-000000000103'],
  ['viewer@example.com', '00000000-0000-0000-0000-000000000104'],
])

const pass = (name, detail) => console.log(`PASS ${name}: ${JSON.stringify(detail)}`)
const assert = (condition, name, detail) => {
  if (!condition) throw new Error(`FAIL ${name}: ${JSON.stringify(detail)}`)
  pass(name, detail)
}

const request = async (path, key, init = {}) => {
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body = await response.json().catch(() => null)
  return { status: response.status, body }
}

const admin = await request('/auth/v1/admin/users?per_page=1000', serviceRoleKey)
const users = Array.isArray(admin.body?.users) ? admin.body.users : []
const seededUsers = users.filter((user) => fixtures.has(user.email))
assert(admin.status === 200, 'admin.list_users.http', { http: admin.status })
assert(seededUsers.length === fixtures.size, 'admin.list_users.fixtures', {
  users: seededUsers.map((user) => ({ email: user.email, id: user.id })),
})

for (const email of ['owner@example.com', 'viewer@example.com']) {
  const login = await request('/auth/v1/token?grant_type=password', anonKey, {
    method: 'POST',
    body: JSON.stringify({ email, password: 'password' }),
  })
  const expectedId = fixtures.get(email)
  assert(login.status === 200, `password_grant.${email}.http`, {
    http: login.status,
    code: login.body?.error_code,
  })
  assert(login.body?.user?.id === expectedId, `password_grant.${email}.user_id`, {
    expected: expectedId,
    actual: login.body?.user?.id,
  })

  const jwtPayload = JSON.parse(Buffer.from(login.body.access_token.split('.')[1], 'base64url').toString())
  assert(jwtPayload.sub === expectedId, `password_grant.${email}.jwt_sub`, {
    expected: expectedId,
    actual: jwtPayload.sub,
  })
}

console.log('SUMMARY 8/8 checks passed')
