export default async (event, context) => {
  return new Response(JSON.stringify({ 
    message: 'Hello from Netlify Functions!',
    timestamp: new Date().toISOString(),
    method: event.httpMethod,
    path: event.path
  }), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }
  });
};
