import { z } from "zod";
export * from "./schema";
import { insertUserSchema, insertVehicleSchema, insertBookingSchema, users, vehicles, bookings } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

// Custom schemas based on API spec
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    role: z.string(),
  }),
});

// Helper for standard API response wrapper
const apiResponse = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  message: z.string(),
  data: dataSchema.optional(),
});

export const api = {
  auth: {
    signup: {
      method: "POST" as const,
      path: "/api/v1/auth/signup",
      input: insertUserSchema,
      responses: {
        201: apiResponse(z.custom<typeof users.$inferSelect>()),
        400: errorSchemas.validation,
      },
    },
    signin: {
      method: "POST" as const,
      path: "/api/v1/auth/signin",
      input: loginSchema,
      responses: {
        200: apiResponse(authResponseSchema),
        401: errorSchemas.unauthorized,
      },
    },
  },
  vehicles: {
    list: {
      method: "GET" as const,
      path: "/api/v1/vehicles",
      responses: {
        200: apiResponse(z.array(z.custom<typeof vehicles.$inferSelect>())),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/v1/vehicles/:vehicleId",
      responses: {
        200: apiResponse(z.custom<typeof vehicles.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/v1/vehicles",
      input: insertVehicleSchema,
      responses: {
        201: apiResponse(z.custom<typeof vehicles.$inferSelect>()),
        403: errorSchemas.forbidden,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/v1/vehicles/:vehicleId",
      input: insertVehicleSchema.partial(),
      responses: {
        200: apiResponse(z.custom<typeof vehicles.$inferSelect>()),
        403: errorSchemas.forbidden,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/v1/vehicles/:vehicleId",
      responses: {
        200: apiResponse(z.object({})),
        403: errorSchemas.forbidden,
      },
    },
  },
  users: {
      list: {
          method: "GET" as const,
          path: "/api/v1/users",
          responses: {
              200: apiResponse(z.array(z.custom<typeof users.$inferSelect>())),
              403: errorSchemas.forbidden
          }
      },
      update: {
          method: "PUT" as const,
          path: "/api/v1/users/:userId",
          input: insertUserSchema.partial(),
           responses: {
              200: apiResponse(z.custom<typeof users.$inferSelect>()),
              403: errorSchemas.forbidden
          }
      },
       delete: {
          method: "DELETE" as const,
          path: "/api/v1/users/:userId",
           responses: {
              200: apiResponse(z.object({})),
              403: errorSchemas.forbidden
          }
      }
  },
  bookings: {
    create: {
      method: "POST" as const,
      path: "/api/v1/bookings",
      input: insertBookingSchema.pick({ vehicleId: true, rentStartDate: true, rentEndDate: true }).extend({
          customerId: z.number().optional()
      }),
      responses: {
        201: apiResponse(z.custom<typeof bookings.$inferSelect>()),
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/v1/bookings",
      responses: {
        200: apiResponse(z.array(z.custom<typeof bookings.$inferSelect>())),
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/v1/bookings/:bookingId",
      input: z.object({ status: z.enum(["active", "cancelled", "returned"]) }),
      responses: {
        200: apiResponse(z.custom<typeof bookings.$inferSelect>()),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
