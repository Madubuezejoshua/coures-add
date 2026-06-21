// Best-effort free a TCP port so a stale process can never block startup.
import killPort from 'kill-port';

export async function freePort(port) {
  try {
    await killPort(port, 'tcp');
    console.log(`[freeport] freed :${port}`);
  } catch {
    /* nothing was listening (or it couldn't be killed) — that's fine */
  }
}

// When run directly (e.g. as a `preserver` hook), free the API port.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('freeport.mjs')) {
  const port = Number(process.env.PORT) || 5050;
  await freePort(port);
}
