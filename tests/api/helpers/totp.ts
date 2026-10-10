import { generateSync } from 'otplib';

/** TOTP defaults used by the server (otplib v13): SHA-1, 6 digits, 30 s step, no drift window. */
const STEP_SECONDS = 30;

/** Codes generated this close to the end of a step may expire before the server verifies them. */
const SAFETY_MARGIN_SECONDS = 4;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function secondsUntilNextStep() {
  return STEP_SECONDS - (Math.floor(Date.now() / 1000) % STEP_SECONDS);
}

/**
 * Returns a TOTP code for `secret` (the Base32 `manualKey` from setup/initiate)
 * that is safe to submit immediately. Every accepted code is single-use for
 * 90 s, so pass the previously accepted code as `lastCode` to wait for a new
 * time step when necessary.
 */
export async function nextCode(secret: string, lastCode?: string) {
  for (;;) {
    const remaining = secondsUntilNextStep();

    if (remaining <= SAFETY_MARGIN_SECONDS) {
      await sleep(remaining * 1000 + 250);
      continue;
    }

    const code = generateSync({ secret });

    if (code !== lastCode) {
      return code;
    }

    await sleep(remaining * 1000 + 250);
  }
}

/** A 6-digit code that is guaranteed not to be the one currently valid for `secret`. */
export function wrongCode(secret: string) {
  const current = generateSync({ secret });

  return current === '000000' ? '111111' : '000000';
}
