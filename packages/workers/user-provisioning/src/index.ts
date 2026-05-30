export async function handleRequest(request: Request): Promise<Response> {
  const payload = await request.json();
  console.log('Clerk webhook received', payload);
  return Response.json({ received: true });
}
