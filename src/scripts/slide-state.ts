import PartySocket from 'partysocket';
import { createMachine, assign, createActor } from 'xstate';

export const partySocket = new PartySocket({
	host: import.meta.env.PUBLIC_PARTYKIT_URL,
	room: 'lwj',
});

export function send({ type, value }: { type: string; value: any }) {
	partySocket.send(JSON.stringify({ type, value }));
}

partySocket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);

	switch (message.type) {
		case 'initialize':
		case 'update-slide':
			countActor.send({ type: 'SET', value: message.value });
			break;

		default:
			console.log(`Unknown type "${message.type}"`);
	}
});

const countMachine = createMachine({
	context: {
		count: 0,
	} as { count: number },
	on: {
		INC: {
			actions: assign({
				count: ({ context }) => {
					const nextCount = context.count + 1;

					send({
						type: 'update-slide',
						value: nextCount,
					});

					return nextCount;
				},
			}),
		},
		DEC: {
			actions: assign({
				count: ({ context }) => {
					const nextCount = Math.max(context.count - 1, 0);

					send({
						type: 'update-slide',
						value: nextCount,
					});

					return nextCount;
				},
			}),
		},
		SET: {
			actions: assign({
				count: ({ event }) => event.value,
			}),
		},
	},
});

export const countActor = createActor(countMachine).start();
