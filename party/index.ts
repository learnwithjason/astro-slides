import type * as Party from 'partykit/server';

export default class Server implements Party.Server {
	slide = 0;

	// team unlock
	unlockers = new Set();

	constructor(readonly room: Party.Room) {}

	onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		// A websocket just connected!
		console.log(
			`Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
		);

		// let's send a message to the connection
		conn.send(
			JSON.stringify({
				type: 'initialize',
				value: this.slide,
			}),
		);
	}

	onMessage(data: string, sender: Party.Connection) {
		const message = JSON.parse(data);

		switch (message.type) {
			case 'team-unlock-hold':
				this.unlockers.add(sender.id);
				this.room.broadcast(
					JSON.stringify({
						type: 'team-unlock-update',
						value: this.unlockers.size,
					}),
				);
				break;

			case 'team-unlock-release':
				this.unlockers.delete(sender.id);
				this.room.broadcast(
					JSON.stringify({
						type: 'team-unlock-update',
						value: this.unlockers.size,
					}),
				);
				break;

			default:
				this.room.broadcast(JSON.stringify(message));
		}
	}
}

Server satisfies Party.Worker;
