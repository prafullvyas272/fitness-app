import { ZodError } from "zod";

export const validate =
  (schema) =>
  async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.length ? issue.path.join(".") : null,
          message: issue.message,
        }));

        return res.status(422).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      // fallback (non-zod error)
      return res.status(400).json({
        success: false,
        message: error.message || "Validation failed",
      });
    }
  };
