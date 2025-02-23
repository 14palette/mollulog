export function bossImageUrl(boss: string): string {
  return `https://assets.mollulog.net/assets/images/boss/${boss}`;
}

export function bossBannerUrl(boss: string): string {
  return `https://assets.mollulog.net/assets/images/boss-banner/${boss}`;
}

export function studentImageUrl(studentId: string): string {
  if (studentId === "unlisted") {
    return "https://assets.mollulog.net/assets/images/students/-1";
  }
  return `https://assets.mollulog.net/images/students/${studentId}`;
}

export function itemImageUrl(item: string): string {
  return `https://assets.mollulog.net/images/items/${item}`;
}
