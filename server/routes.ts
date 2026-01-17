import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { verifyToken } from "./auth/auth.service"; // Import verifyToken
import { authRoutes } from "./auth/auth.routes"; // Import authRoutes
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey"; // Use JWT_SECRET from .env

// Middleware to check JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const user = verifyToken(token); // Use verifyToken from auth.service.ts
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
};

import { upload } from './upload';

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
};

async function getDirectImageUrl(pageUrl: string): Promise<string> {
    if (!pageUrl || !pageUrl.includes('ibb.co')) {
        return pageUrl;
    }

    try {
        const response = await fetch(pageUrl);
        const html = await response.text();
        const match = html.match(/<meta property="og:image" content="(.*?)">/);
        return match ? match[1] : pageUrl;
    } catch (error) {
        console.error('Error fetching direct image URL:', error);
        return pageUrl;
    }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use('/api/v1/auth', authRoutes); // Mount authentication routes

  // Auth Routes (removed existing signup and signin as they are now in authRoutes)

  app.post('/api/v1/upload', upload.single('image'), (req, res) => {
      if (!req.file) {
          return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      res.json({ success: true, message: 'File uploaded successfully', data: { filePath: `/uploads/${req.file.filename}` } });
  });

  // Vehicle Routes
  app.get(api.vehicles.list.path, async (req, res) => {
      const vehicles = await storage.getVehicles();
      res.json({ success: true, message: "Vehicles retrieved successfully", data: vehicles });
  });

  app.get(api.vehicles.get.path, async (req, res) => {
      const vehicle = await storage.getVehicle(Number(req.params.vehicleId));
      if (!vehicle) {
          return res.status(404).json({ success: false, message: "Vehicle not found" });
      }
      res.json({ success: true, message: "Vehicle retrieved successfully", data: vehicle });
  });

  app.post(api.vehicles.create.path, authenticateToken, requireAdmin, async (req, res) => {
      try {
          const input = api.vehicles.create.input.parse(req.body);
          if (input.imageUrl) {
              input.imageUrl = await getDirectImageUrl(input.imageUrl);
          }
          const vehicle = await storage.createVehicle(input);
          res.status(201).json({ success: true, message: "Vehicle created successfully", data: vehicle });
      } catch (error) {
          if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: vehicles.registrationNumber')) {
              return res.status(409).json({ success: false, message: "Vehicle with this registration number already exists" });
          }
          res.status(400).json({ success: false, message: "Invalid input" });
      }
  });

  app.put(api.vehicles.update.path, authenticateToken, requireAdmin, async (req, res) => {
      try {
          const input = api.vehicles.update.input.parse(req.body);
          if (input.imageUrl) {
              input.imageUrl = await getDirectImageUrl(input.imageUrl);
          }
          const vehicle = await storage.updateVehicle(Number(req.params.vehicleId), input);
          res.json({ success: true, message: "Vehicle updated successfully", data: vehicle });
      } catch (error) {
          res.status(400).json({ success: false, message: "Invalid input" });
      }
  });

  app.delete(api.vehicles.delete.path, authenticateToken, requireAdmin, async (req, res) => {
      await storage.deleteVehicle(Number(req.params.vehicleId));
      res.json({ success: true, message: "Vehicle deleted successfully", data: {} });
  });

  // Booking Routes
  app.post(api.bookings.create.path, authenticateToken, async (req, res) => {
      try {
          const user = (req as any).user;
          const input = api.bookings.create.input.parse(req.body);
          
          const vehicle = await storage.getVehicle(input.vehicleId);
          if (!vehicle || vehicle.availabilityStatus !== 'available') {
              return res.status(400).json({ success: false, message: "Vehicle not available" });
          }

          // Calculate total price
          const start = new Date(input.rentStartDate);
          const end = new Date(input.rentEndDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include the end date
          const totalPrice = days * vehicle.dailyRentPrice;

          const booking = await storage.createBooking({
              ...input,
              customerId: user.id,
              totalPrice,
              status: 'active'
          });

          // Update vehicle status
          await storage.updateVehicle(vehicle.id, { availabilityStatus: 'booked' });

          res.status(201).json({ success: true, message: "Booking created successfully", data: booking });
      } catch (error) {
          console.error(error);
          res.status(400).json({ success: false, message: "Invalid input" });
      }
  });

  app.get(api.bookings.list.path, authenticateToken, async (req, res) => {
      const user = (req as any).user;
      let bookings;
      if (user.role === 'admin') {
          bookings = await storage.getBookings();
      } else {
          bookings = await storage.getBookingsByCustomer(user.id);
      }
      res.json({ success: true, message: "Bookings retrieved successfully", data: bookings });
  });

  app.put(api.bookings.update.path, authenticateToken, async (req, res) => {
      const user = (req as any).user;
      const bookingId = Number(req.params.bookingId);
      const status = req.body.status;

      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

      if (user.role !== 'admin' && booking.customerId !== user.id) {
          return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (user.role !== 'admin' && status === 'cancelled') {
        const rentStartDate = new Date(booking.rentStartDate);
        const today = new Date();
        // Set hours, minutes, seconds, milliseconds to 0 for accurate date comparison
        rentStartDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (today.getTime() >= rentStartDate.getTime()) {
          return res.status(400).json({ success: false, message: "Booking can only be cancelled before the rent start date." });
        }
      }


      const updatedBooking = await storage.updateBooking(bookingId, status);

      if (status === 'returned' || status === 'cancelled') {
           await storage.updateVehicle(booking.vehicleId, { availabilityStatus: 'available' });
      }

      res.json({ success: true, message: "Booking updated successfully", data: updatedBooking });
  });
  
  // Users Routes
  app.get(api.users.list.path, authenticateToken, requireAdmin, async (req, res) => {
      const users = await storage.getUsers();
      res.json({ success: true, message: "Users retrieved successfully", data: users });
  });

    app.put(api.users.update.path, authenticateToken, async (req, res) => {
        const user = (req as any).user;
        const userId = Number(req.params.userId);
        
        if (user.role !== 'admin' && user.id !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        
        try {
            const input = api.users.update.input.parse(req.body);
            // Prevent users from changing their own role to admin if they are not admin
            if (user.role !== 'admin' && input.role && input.role === 'admin') {
                 return res.status(403).json({ success: false, message: "Cannot change role to admin" });
            }
            
            const updatedUser = await storage.updateUser(userId, input);
            res.json({ success: true, message: "User updated successfully", data: updatedUser });
        } catch (error) {
             res.status(400).json({ success: false, message: "Invalid input" });
        }
    });

    app.delete(api.users.delete.path, authenticateToken, requireAdmin, async (req, res) => {
        await storage.deleteUser(Number(req.params.userId));
        res.json({ success: true, message: "User deleted successfully", data: {} });
    });

  // Seed Data
  if ((await storage.getUsers()).length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await storage.createUser({
          name: "Admin User",
          email: "admin@example.com",
          password: hashedPassword,
          phone: "0000000000",
          role: "admin"
      });
      console.log("Seeded admin user");
      
      await storage.createVehicle({
          vehicleName: "Toyota Camry 2024",
          type: "car",
          registrationNumber: "ABC-1234",
          dailyRentPrice: 50,
          availabilityStatus: "available"
      });
       await storage.createVehicle({
          vehicleName: "Honda Civic 2023",
          type: "car",
          registrationNumber: "XYZ-5678",
          dailyRentPrice: 45,
          availabilityStatus: "available"
      });
      console.log("Seeded vehicles");
  }

  const vehicleToUpdate = await storage.getVehicle(5);
  if (vehicleToUpdate && vehicleToUpdate.imageUrl === 'https://ibb.co.com/39yy6Pr7') {
      await storage.updateVehicle(5, { imageUrl: 'https://i.ibb.co/4nZZv0m7/download.jpg' });
      console.log('Updated vehicle with ID 5 to have the correct image URL');
  }

  return httpServer;
}
