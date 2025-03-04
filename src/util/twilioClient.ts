import { Twilio } from "twilio";
import config from "../config";

export const twilioClient = new Twilio(config.twilio.TWILIO_ACCOUNT_SID, config.twilio.TWILIO_AUTH_TOKEN);