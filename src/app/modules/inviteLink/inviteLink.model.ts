import { model, Schema } from "mongoose";
import { IInviteLink } from "./inviteLink.interface";

const inviteLinkSchema = new Schema<IInviteLink>(
  {
    link: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const InviteLinkModel = model<IInviteLink>(
  "InviteLink",
  inviteLinkSchema
);
