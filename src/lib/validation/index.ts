import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerBusinessSchema = z.object({
  name: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(6, "Valid 6-digit PIN code required"),
  category: z.string().min(2, "Initial category is required"),
});

export const publicBookingSchema = z.object({
  businessSlug: z.string().min(1),
  serviceId: z.string().min(1, "Please select a service"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Valid 10-digit phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  postalCode: z.string().min(6, "Valid 6-digit postal PIN code required"),
  requestedDate: z.string().min(1, "Preferred date is required"),
  timeWindow: z.enum(["MORNING", "AFTERNOON", "EVENING", "SPECIFIC"]),
  problemDescription: z.string().min(5, "Please describe the problem"),
  answers: z.record(z.any()).optional(),
});

export const jobStatusTransitionSchema = z.object({
  jobId: z.string().min(1),
  targetStatus: z.enum([
    "SCHEDULED",
    "EN_ROUTE",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
  ]),
  notes: z.string().optional(),
  checklistResponses: z.record(z.boolean()).optional(),
  materialsConsumed: z
    .array(
      z.object({
        inventoryItemId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
});

export const quotationCreateSchema = z.object({
  customerId: z.string().min(1),
  jobId: z.string().optional(),
  validityDays: z.number().int().positive().default(7),
  discountPaise: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z
    .array(
      z.object({
        type: z.enum(["LABOUR", "MATERIAL", "INSPECTION", "OTHER"]),
        description: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPricePaise: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one line item is required"),
});

export const manualPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amountPaise: z.number().int().positive("Payment amount must be greater than zero"),
  method: z.enum(["CASH", "UPI", "CARD", "NETBANKING", "RAZORPAY_SANDBOX"]),
  transactionReference: z.string().optional(),
});

export const customerCreateSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  contactPreference: z.enum(["ALL", "PHONE", "WHATSAPP", "EMAIL"]).default("ALL"),
  address: z.object({
    line1: z.string().min(3),
    line2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(6),
  }),
});

export const inventoryItemSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),
  unit: z.string().default("pcs"),
  unitCostPaise: z.number().int().nonnegative(),
  sellingPricePaise: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  minStockThreshold: z.number().int().nonnegative(),
  location: z.string().optional(),
});

export const contactRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  businessName: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email required"),
  serviceCategory: z.string().optional(),
  message: z.string().min(5, "Please enter your message"),
});
