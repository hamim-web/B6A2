import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  phone: text("phone").notNull(),
  role: text("role", { enum: ["admin", "customer"] }).notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleName: text("vehicle_name").notNull(),
  type: text("type", { enum: ["car", "bike", "van", "SUV"] }).notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  imageUrl: text("image_url"),
  dailyRentPrice: integer("daily_rent_price").notNull(),
  availabilityStatus: text("availability_status", { enum: ["available", "booked"] }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  rentStartDate: date("rent_start_date").notNull(),
  rentEndDate: date("rent_end_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status", { enum: ["active", "cancelled", "returned"] }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [bookings.vehicleId],
    references: [vehicles.id],
  }),
}));

// === ZOD SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true }).partial({ imageUrl: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, totalPrice: true, status: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
