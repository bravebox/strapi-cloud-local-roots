// Strapi v5: custom controller can be a plain default export with actions.
// Koa ctx is still in use under the hood.
export default {
  async batchReverse(ctx) {
    try {
      const body = ctx.request.body;
      if (!body || !Array.isArray(body.points) || body.points.length === 0) {
        return ctx.badRequest('points[] required');
      }
      if (body.points.length > 50) {
        return ctx.badRequest('Too many points (max 50)');
      }

      const sanitized = body.points
        .map((p) => ({
          lat: typeof p.lat === 'number' ? p.lat : null,
          lng: typeof p.lng === 'number' ? p.lng : null,
        }))
        .filter((p) => p.lat !== null && p.lng !== null);

      const result = await strapi
        .service('api::geocode.geocode')
        .batchReverse(sanitized);

      ctx.body = result;
    } catch (err) {
      strapi.log.error('Error in /api/geocode', err);
      ctx.internalServerError('Internal error');
    }
  },
};
