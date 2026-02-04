export const validate =
  (schema) =>
  async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }
  };
