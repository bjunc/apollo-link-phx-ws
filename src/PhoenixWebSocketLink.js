import { print } from 'graphql/language/printer'
import { Observable } from 'apollo-link-core'
import { Socket as PhoenixSocket } from 'phoenix'

export class PhoenixWebSocketLink {
  /**
   * @param {Object} opts 
   * @param {string=/graphql} opts.uri - the URI key can be either a string endpoint or default to “/graphql”
   * @param {Object=} opts.params - useful for passing an auth token, which could be parsed via Guardian in socket connect function
   * @param {PhoenixSocket=PhoenixSocket} opts.socket - a pre-instantiated socket.  defaults to a new PhoenixSocket
   * @param {W3CWebSocket=} opts.transport - useful for SSR (default PhoenixSocket transport calls window)
   */
  constructor (opts) {
    let socket = new PhoenixSocket(opts.uri, opts)
    opts.uri = opts.uri || '/graphql'

    try {
      socket.connect()
      this._joinChannel(socket)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * A link’s request is called every time execute is run on that link chain (typically every operation). 
   * The request is where the operation is given to the link to return back data of some kind.
   * @param {Object} operation
   * @param {DocumentNode} operation.query - A DocumentNode (parsed GraphQL Operation) describing the operation taking place
   * @param {Object} operation.variables - A map of variables being sent with the operation
   * @param {string} operation.operationName - A string name of the query if it is named, otherwise it is null
   * @param {Object} operation.extensions - A map to store extensions data to be sent to the server
   * @param {function} operation.getContext - A function to return the context of the request
   * @param {function} operation.setContext - A function that takes either a new context object, or a function which receives the previous context and retuns a new one. (Think of it like setState from React)
   * @param {function} operation.toKey - A function to convert the current operation into a string to be used as a unique identifier
   * @returns {Observable}
   */
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

  /**
   * @private
   */

  _joinChannel (socket) {
		const CHANNEL_TOPIC = '__absinthe__:control'
		let channel = socket.channel(CHANNEL_TOPIC, {})
		this._channel = channel
    channel.join()
      // .receive('ok', response => console.log(`Joined successfully ${CHANNEL_TOPIC}`, response))
      // .receive('error', response => { console.log(`Unable to join ${CHANNEL_TOPIC}`, response) })
  }
}
