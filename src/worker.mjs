export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    return new Response("Not Found", { status: 404 });
  },
};