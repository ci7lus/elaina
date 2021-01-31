export const wait = (n: number) =>
  new Promise<void>((res) => setTimeout(() => res(), n))
