export function butEncoded(value:string): string {
  return value.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
}
