import assert from 'node:assert/strict'
import test from 'node:test'

let clientId = 0

async function createClient(context, responses) {
    const calls = []
    context.mock.method(globalThis, 'fetch', async (endpoint, options) => {
        calls.push({ endpoint, options })
        assert.ok(responses.length > 0, 'Unexpected extra API request')
        const { status = 200, body = {} } = responses.shift()
        return new Response(JSON.stringify(body), { status })
    })
    const { default: client } = await import(`./crowdsecLocalApi.js?test=${++clientId}`)
    return { client, calls }
}

function loginResponse(token) {
    return { body: { token, expire: new Date(Date.now() + 3600000).toISOString() } }
}

test('successful deletes reuse the cached token', async (context) => {
    const { client, calls } = await createClient(context, [
        loginResponse('cached-token'),
        { body: { nbDeleted: 1 } },
        { body: { nbDeleted: 0 } }
    ])

    assert.equal(await client.deleteDecisionsByIP('192.0.2.1'), 1)
    assert.equal(await client.deleteDecisionsByIP('192.0.2.1'), 0)
    assert.deepEqual(calls.map(call => call.options.method), ['POST', 'DELETE', 'DELETE'])
    assert.equal(calls[2].options.headers.Authorization, 'Bearer cached-token')
})

test('a 401 refreshes the token and retries the same delete once', async (context) => {
    const { client, calls } = await createClient(context, [
        loginResponse('old-token'),
        { status: 401 },
        loginResponse('new-token'),
        { body: { nbDeleted: 1 } },
        { body: { nbDeleted: 0 } }
    ])

    assert.equal(await client.deleteDecisionsByIP('192.0.2.1'), 1)
    assert.equal(await client.deleteDecisionsByIP('192.0.2.1'), 0)
    assert.deepEqual(calls.map(call => call.options.method), ['POST', 'DELETE', 'POST', 'DELETE', 'DELETE'])
    assert.equal(calls[1].options.headers.Authorization, 'Bearer old-token')
    assert.equal(calls[3].options.headers.Authorization, 'Bearer new-token')
    assert.equal(calls[3].endpoint, calls[1].endpoint)
    assert.equal(calls[4].options.headers.Authorization, 'Bearer new-token')
})

test('a repeated 401 is surfaced without further retries', async (context) => {
    const { client, calls } = await createClient(context, [
        loginResponse('old-token'),
        { status: 401 },
        loginResponse('new-token'),
        { status: 401 }
    ])

    await assert.rejects(client.deleteDecisionsByIP('192.0.2.1'), /deletedecision status: 401/)
    assert.equal(calls.length, 4)
})

test('other HTTP errors do not trigger a token refresh', async (context) => {
    const { client, calls } = await createClient(context, [
        loginResponse('cached-token'),
        { status: 403 }
    ])

    await assert.rejects(client.deleteDecisionsByIP('192.0.2.1'), /deletedecision status: 403/)
    assert.equal(calls.length, 2)
})

test('a failed refresh is surfaced without retrying the delete', async (context) => {
    const { client, calls } = await createClient(context, [
        loginResponse('old-token'),
        { status: 401 },
        { status: 401 }
    ])

    await assert.rejects(client.deleteDecisionsByIP('192.0.2.1'), /login status: 401/)
    assert.equal(calls.length, 3)
})