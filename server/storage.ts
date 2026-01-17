import { db } from "./db";
import { users, vehicles, bookings, type User, type InsertUser, type Vehicle, type InsertVehicle, type Booking, type InsertBooking } from "@shared/schema";
import { eq, and, gt, lt, or, ne } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Vehicles
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>; // Admin
  getBookingsByCustomer(customerId: number): Promise<Booking[]>;
  updateBooking(id: number, status: string): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    const activeBookings = await db.select().from(bookings).where(and(eq(bookings.customerId, id), eq(bookings.status, 'active')));
    if (activeBookings.length > 0) {
      throw new Error("Cannot delete user with active bookings.");
    }
    await db.delete(users).where(eq(users.id, id));
  }

  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: number, updates: Partial<InsertVehicle>): Promise<Vehicle> {
    const [vehicle] = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    const activeBookings = await db.select().from(bookings).where(and(eq(bookings.vehicleId, id), eq(bookings.status, 'active')));
    if (activeBookings.length > 0) {
      throw new Error("Cannot delete vehicle with active bookings.");
    }
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookings(): Promise<Booking[]> {
     return await db.query.bookings.findMany({
         with: {
             customer: true,
             vehicle: true
         }
     });
  }

  async getBookingsByCustomer(customerId: number): Promise<Booking[]> {
      return await db.query.bookings.findMany({
          where: eq(bookings.customerId, customerId),
          with: {
             vehicle: true
          }
      });
  }

  async updateBooking(id: number, status: string): Promise<Booking> {
      // @ts-ignore
    const [booking] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
      return booking;
  }
}

export const storage = new DatabaseStorage();
// I am Hamim an Web Developer. My final word is don't be like me. If the world gets destroyed just don't be like me. You have to carry so much pessure that your mind will just want die.Me same too, I also want die. There are many reason that I want die, pessure from my perents, no jobs so no money. For this reason I want die. But something is stopping me from suciding. If I sucide I will directly thrown to hell and also my crush ff3821fd8b81039ca853fccff6dbf18a(MD)