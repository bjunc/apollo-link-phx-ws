# apollo-link-phx-ws
Phoenix websocket link for Apollo 2.0

### Caveats / Privisos

* This is early experimental / prototype phase.  That said, it works with query and mutations in both browser and server (Node.js) environments.
* PubSub (subscriptions) not yet supported.  Personally, I don't yet have a use-case for this, so it might be a while before I tackle it (if at all).
* The PhoenixSocket only works in the browsers (references `window`).  For SSR, override `opts.transport` with a [W3CWebSocket](https://www.npmjs.com/package/websocket).
* This lib requires Absinthe on the server side.  The deps I have successfully tested with are:

```elixir
{:absinthe, "~> 1.4.0-rc.3", override: true},
{:absinthe_plug, "~> 1.4.0-rc.1"},
{:absinthe_ecto, "~> 0.1.2"},
{:absinthe_phoenix, github: "absinthe-graphql/absinthe_phoenix"},
```

**2017-11-18 Update: The Absinthe suite was updated on Nov 13th. My current deps are:**

```elixir
{:absinthe, "~> 1.4.0"},
{:absinthe_plug, "~> 1.4.0"},
{:absinthe_ecto, "~> 0.1.3"},
{:absinthe_phoenix, "~> 1.4.0"}

```


### Example

```javascript
import { ApolloClient } from 'apollo-client'
import PhoenixWebSocketLink from 'apollo-link-phx-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'

// socket options
let options = {
  uri: 'ws://localhost:4000/socket',
  params: { token: 'ABC123' }
}

// socket link
const link = new PhoenixWebSocketLink(options)

// apollo client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})
```

> Note: in the example, any `options.params` will be sent to the socket connect function.  You can use this opportunity to use `Guardian.decode_verify`, as well as assign the loaded user to GraphQL resolve context.
