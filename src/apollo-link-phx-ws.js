import { print } from 'graphql/language/printer'
import { Observable } from 'apollo-link-core'
import { Socket as PhoenixSocket } from 'phoenix'
import { w3cwebsocket as W3CWebSocket } from 'websocket'

export class PhxWebSocketLink {
  constructor (opts) {
    if (typeof window === 'undefined' && !opts.transport) opts.transport = W3CWebSocket
    let socket = new PhoenixSocket(opts.uri, opts)

    try {
      socket.connect()
      this._joinChannel(socket)
    } catch (err) {
      console.error(err)
    }
  }

  // Required by the NetworkInterface interface spec
  // param: { variables, extensions, operationName, query }
  request ({ operationName, query, variables }) {
    query = print(query)
		// console.log('Phoenix apollo: operationName:', operationName)
		return new Observable(observer => {
			this._channel
				.push('doc', { operationName, query, variables })
				.receive('ok', response => {
          // console.log('operation response', response)
          observer.next(response)
          observer.complete()
        })
				.receive('ignore', response => {
          observer.next(response)
          observer.complete()
        })
				.receive('error', observer.error.bind(observer))
				.receive('timeout', observer.error.bind(observer))
		})
  }

  _joinChannel (socket) {
    console.log('Joining channel')
		const CHANNEL_TOPIC = '__absinthe__:control'
		let channel = socket.channel(CHANNEL_TOPIC, {})
		this._channel = channel
    channel.join()
      .receive('ok', response => console.log(`Joined successfully ${CHANNEL_TOPIC}`, response))
      .receive('error', response => { console.log(`Unable to join ${CHANNEL_TOPIC}`, response) })
		// TODO: wrap channel join in promise for error catching/reporting
  }
}
