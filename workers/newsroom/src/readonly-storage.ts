/** Restrict the capability handed to the preserved read handlers.
 * The Worker's raw R2 binding still has write authority: this is defense in
 * depth inside this process, not a storage credential or isolation boundary.
 */
export type NewsroomReadStorage = Pick<R2Bucket, "get" | "list">;

export function readonlyStorage(bucket: NewsroomReadStorage): NewsroomReadStorage {
  return Object.freeze({
    get: bucket.get.bind(bucket),
    list: bucket.list.bind(bucket),
  });
}
