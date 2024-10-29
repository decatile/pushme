export function mapper(obj: any) {
  return {
    method: obj.method,
    url: obj.path as string,
    params: obj.query,
    headers: {},
  };
}
