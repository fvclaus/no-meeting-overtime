
export const CLIENT_ID = process.env.CLIENT_ID!;
if (CLIENT_ID === undefined) {
  throw new Error('Missing CLIENT_ID');
}
export const CLIENT_SECRET = process.env.CLIENT_SECRET!;
if (CLIENT_SECRET == undefined) {
  throw new Error('Missing CLIENT_SECRET');
}
