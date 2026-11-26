// Browsers may open a local development server using either loopback hostname.
export function allowedOrigin(origin, configured, host, development) {
  if (!origin) return false;
  if (origin === configured) return true;
  if (!development) return false;
  try {
    const actual = new URL(origin);
    const expected = new URL(configured);
    const loopback = ["localhost", "127.0.0.1", "[::1]"];
    return (
      actual.origin === origin &&
      actual.host === host &&
      loopback.includes(actual.hostname) &&
      loopback.includes(expected.hostname) &&
      actual.protocol === expected.protocol &&
      actual.port === expected.port
    );
  } catch {
    return false;
  }
}
