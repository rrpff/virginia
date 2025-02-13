export function slug(input: string): string {
  return input.toLowerCase().replace(/[^\w]/g, "-");
}
