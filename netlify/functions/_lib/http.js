export function json(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body: JSON.stringify(data)
  };
}

export function methodNotAllowed() {
  return json(405, { message: 'Method not allowed' });
}
