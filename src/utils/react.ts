import type { Message } from "discord.js";

export default async (message: Message, reactions: any) => {
  if (reactions.length > 1) {
    for (let reaction of reactions) {
      await message.react(reaction);
    }
  } else {
    await message.react(reactions[0]);
  }
};
