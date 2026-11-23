/**
 * Students can answer their pre-training questions from 1 hour before the
 * session (when the reminder goes out) until it ends. Must match
 * CHECK_IN_OPENS_BEFORE in sct-api/app/services/pretraining_rules.py.
 */
export const CHECK_IN_OPENS_MINUTES_BEFORE = 60;
export const CHECK_IN_OPENS_MS = CHECK_IN_OPENS_MINUTES_BEFORE * 60 * 1000;
