/*
 * FIXME: Organize data in a better way like a proper DB.
 */

export interface BucketVote {
    accusedId: string,
    allowedVotersIds: Array<string>,
    votedBallets: Set<string>
};

/*
 * Maps a guild id to a designated anger channel if it was set.
 */
export var AngerChannels = new Map<string, string>();

/*
 * Maps a guild id to an onging BucketVote
 */
export var OngoingVotes = new Map<string, BucketVote | null>();

/*
 * Maps a guild id to a mutex determining wether a person is currently on a bucket timeout
 */
export var BucketLocks = new Map<string, boolean>();