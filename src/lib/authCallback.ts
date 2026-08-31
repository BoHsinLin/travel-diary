/** Builds the Auth callback within the Vite base path for root and GitHub Pages deployments. */
export function authCallbackUrl(origin: string, basePath: string): string {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return new URL('trips', new URL(normalizedBase, origin)).toString();
}
