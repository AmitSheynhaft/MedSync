let welcomePending = false;

export function markWelcomePending(): void {
  welcomePending = true;
}

export function consumeWelcomePending(): boolean {
  const isPending = welcomePending;
  welcomePending = false;
  return isPending;
}
