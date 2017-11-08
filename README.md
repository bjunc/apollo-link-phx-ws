# apollo-link-phx-ws
Phoenix websocket link for Apollo 2.0

### Caveats / Privisos

* This is early experimental / prototype phase.  That said, it works with query and mutations in both browser and server (Node.js) environments.
* PubSub (subscriptions) not yet supported.  Personally, I don't yet have a use-case for this, so it might be a while before I tackle it (if at all).
* This module currently embeds a `W3CWebSocket` for Node requests that mimic browser behavior (allowing for SSR).  This potentially bloats your browser lib as it wouldn't be needed.  I'll probably remove it eventually, do a `window === undefined` check, and disable the default Phoenix default transport (which references `window`, and throws errors if run in Node).  In that case, you'll need to provide your own transport (via `opts.transport`).
* This lib requires Absinthe on the server side.  The deps I have successfully tested with are:

```elixir
{:absinthe, "~> 1.4.0-rc.3", override: true},
{:absinthe_plug, "~> 1.4.0-rc.1"},
{:absinthe_ecto, "~> 0.1.2"},
{:absinthe_phoenix, github: "absinthe-graphql/absinthe_phoenix"},
```

### Example

```javascript
import { ApolloClient } from 'apollo-client'
import { PhxWebSocketLink } from 'apollo-link-phx-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'

// socket options
let options = {
  uri: 'ws://localhost:4000/socket',
  params: { token: 'ABC123' }
}

// socket link
const link = new PhxWebSocketLink(options)

// apollo client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})
```

> Note: in the example, any `options.params` will be sent to the socket connect function.  You can use this opportunity to use `Guardian.decode_verify`, as well as assign the loaded user to GraphQL resolve context.