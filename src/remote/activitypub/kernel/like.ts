import { IRemoteUser } from '../../../models/entities/user';
import { ILike, getApId } from '../type';
import create from '../../../services/note/reaction/create';
import { fetchNote, extractEmojis } from '../models/note';

export default async (actor: IRemoteUser, activity: ILike) => {
	const targetUri = getApId(activity.object);

	const note = await fetchNote(targetUri);
	if (!note) return `skip: target note not found ${targetUri}`;

	if (actor.id === note.userId) return `skip: cannot react to my note`;

	await extractEmojis(activity.tag || [], actor.host).catch(() => null);

	await create(actor, note, activity._misskey_reaction || activity.content || activity.name).catch(e => {
		if (e.id === '51c42bb4-931a-456b-bff7-e5a8a70dd298') {
			return 'skip: already reacted';
		} else {
			throw e;
		}
	});

	return `ok`;
};
