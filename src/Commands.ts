import { Command } from "./Command";
import { SetChannel } from "./commands/SetChannel";
import { PutBucket } from "./commands/PutBucket";
import { AngerApprove } from "./commands/Approve";

export const Commands: Command[] = [SetChannel, PutBucket, AngerApprove];