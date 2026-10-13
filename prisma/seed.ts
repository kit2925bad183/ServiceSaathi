import { PrismaClient, Role, PricingType, BookingSource, BookingStatus, JobStatus, QuotationStatus, LineItemType, InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ServiceSaathi development seed...");

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users
  const userRajesh = await prisma.user.upsert({
    where: { email: "rajesh@coolbreeze.in" },
    update: {},
    create: {
      name: "Rajesh Kumar",
      email: "rajesh@coolbreeze.in",
      phone: "+91 98400 11223",
      passwordHash: defaultPasswordHash,
      isPlatformAdmin: true,
    },
  });

  const userPriya = await prisma.user.upsert({
    where: { email: "priya@coolbreeze.in" },
    update: {},
    create: {
      name: "Priya Sundaram",
      email: "priya@coolbreeze.in",
      phone: "+91 98400 22334",
      passwordHash: defaultPasswordHash,
    },
  });

  const userMurugan = await prisma.user.upsert({
    where: { email: "murugan@coolbreeze.in" },
    update: {},
    create: {
      name: "Murugan Selvam",
      email: "murugan@coolbreeze.in",
      phone: "+91 98400 33445",
      passwordHash: defaultPasswordHash,
    },
  });

  const userKarthik = await prisma.user.upsert({
    where: { email: "karthik@apexcare.in" },
    update: {},
    create: {
      name: "Karthik Natarajan",
      email: "karthik@apexcare.in",
      phone: "+91 98940 11223",
      passwordHash: defaultPasswordHash,
    },
  });

  const userVignesh = await prisma.user.upsert({
    where: { email: "vignesh@apexcare.in" },
    update: {},
    create: {
      name: "Vignesh P",
      email: "vignesh@apexcare.in",
      phone: "+91 98940 33445",
      passwordHash: defaultPasswordHash,
    },
  });

  // 2. Business 1: CoolBreeze Climate Solutions (Chennai)
  const coolBreeze = await prisma.business.upsert({
    where: { slug: "coolbreeze" },
    update: {},
    create: {
      name: "CoolBreeze Climate Solutions",
      slug: "coolbreeze",
      legalName: "CoolBreeze Climate Solutions LLP",
      phone: "+91 44 2812 3456",
      email: "support@coolbreeze.in",
      address: "42, Anna Salai, T. Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600017",
      taxRegistrationNumber: "33AAACG1234A1Z5",
      defaultTaxRateBasisPoints: 1800,
      categories: JSON.stringify(["AC installation and repair"]),
      serviceAreaPincodes: JSON.stringify(["600001", "600017", "600028", "600040", "600096"]),
      operatingHours: JSON.stringify({
        monday: { open: "08:30", close: "19:30" },
        tuesday: { open: "08:30", close: "19:30" },
        wednesday: { open: "08:30", close: "19:30" },
        thursday: { open: "08:30", close: "19:30" },
        friday: { open: "08:30", close: "19:30" },
        saturday: { open: "08:30", close: "20:00" },
        sunday: { open: "09:00", close: "17:00" },
      }),
      isVerified: true,
    },
  });

  // Memberships for CoolBreeze
  await prisma.membership.upsert({
    where: { userId_businessId: { userId: userRajesh.id, businessId: coolBreeze.id } },
    update: {},
    create: { userId: userRajesh.id, businessId: coolBreeze.id, role: Role.OWNER },
  });

  await prisma.membership.upsert({
    where: { userId_businessId: { userId: userPriya.id, businessId: coolBreeze.id } },
    update: {},
    create: { userId: userPriya.id, businessId: coolBreeze.id, role: Role.DISPATCHER },
  });

  await prisma.membership.upsert({
    where: { userId_businessId: { userId: userMurugan.id, businessId: coolBreeze.id } },
    update: {},
    create: { userId: userMurugan.id, businessId: coolBreeze.id, role: Role.TECHNICIAN },
  });

  // Business 2: Apex Power & Appliance Care (Coimbatore)
  const apexCare = await prisma.business.upsert({
    where: { slug: "apexcare" },
    update: {},
    create: {
      name: "Apex Power & Appliance Care",
      slug: "apexcare",
      legalName: "Apex Power Services Pvt Ltd",
      phone: "+91 422 234 5678",
      email: "contact@apexcare.in",
      address: "15, Avinashi Road, Peelamedu",
      city: "Coimbatore",
      state: "Tamil Nadu",
      postalCode: "641004",
      taxRegistrationNumber: "33AABCA9876C1Z2",
      defaultTaxRateBasisPoints: 1800,
      categories: JSON.stringify(["Home appliance repair", "Electrical services"]),
      serviceAreaPincodes: JSON.stringify(["641001", "641004", "641018", "641045"]),
      operatingHours: JSON.stringify({
        monday: { open: "09:00", close: "19:00" },
        tuesday: { open: "09:00", close: "19:00" },
        wednesday: { open: "09:00", close: "19:00" },
        thursday: { open: "09:00", close: "19:00" },
        friday: { open: "09:00", close: "19:00" },
        saturday: { open: "09:00", close: "18:00" },
        sunday: { open: "10:00", close: "14:00" },
      }),
      isVerified: true,
    },
  });

  await prisma.membership.upsert({
    where: { userId_businessId: { userId: userKarthik.id, businessId: apexCare.id } },
    update: {},
    create: { userId: userKarthik.id, businessId: apexCare.id, role: Role.OWNER },
  });

  await prisma.membership.upsert({
    where: { userId_businessId: { userId: userVignesh.id, businessId: apexCare.id } },
    update: {},
    create: { userId: userVignesh.id, businessId: apexCare.id, role: Role.TECHNICIAN },
  });

  // Services for CoolBreeze
  const acServiceInstall = await prisma.businessService.upsert({
    where: { businessId_slug: { businessId: coolBreeze.id, slug: "split-ac-installation" } },
    update: {},
    create: {
      businessId: coolBreeze.id,
      categoryId: "AC installation and repair",
      name: "Split AC Standard Installation (1 - 2 Ton)",
      slug: "split-ac-installation",
      description: "Complete mounting, indoor & outdoor unit bracket installation, vacuuming and cooling testing with 90-day installation warranty.",
      pricingType: PricingType.FIXED,
      basePricePaise: 149900, // ₹1,499
      estimatedDurationMinutes: 120,
    },
  });

  const acServiceCleaning = await prisma.businessService.upsert({
    where: { businessId_slug: { businessId: coolBreeze.id, slug: "ac-jet-cleaning" } },
    update: {},
    create: {
      businessId: coolBreeze.id,
      categoryId: "AC installation and repair",
      name: "Jet Pump Deep Cleaning & Coil Sanitization",
      slug: "ac-jet-cleaning",
      description: "High-pressure jet spray foam wash of cooling coils, filter cleaning, blower wash, and drain tray unclogging.",
      pricingType: PricingType.FIXED,
      basePricePaise: 79900, // ₹799
      estimatedDurationMinutes: 60,
    },
  });

  // Checklist for AC Cleaning
  const checklistCleaning = await prisma.checklistTemplate.create({
    data: {
      businessId: coolBreeze.id,
      serviceId: acServiceCleaning.id,
      title: "Jet Pump AC Service Standard Checklist",
      version: 1,
      isRequired: true,
      items: JSON.stringify([
        "Check initial temperature before servicing",
        "Inspect outdoor unit condenser grill condition",
        "Cover electrical PCB box with waterproof protector",
        "High pressure jet foam spray applied to indoor cooling coils",
        "Clear drain pipe blockage and verify water exit",
        "Clean blower fan cylinder and louvers",
        "Verify post-service grill temperature (target < 16°C)",
        "Customer sign-off & clean work area",
      ]),
    },
  });

  // Inventory for CoolBreeze
  await prisma.inventoryItem.createMany({
    data: [
      {
        businessId: coolBreeze.id,
        name: "Copper Pipe 1/2 inch (Heavy Gauge)",
        sku: "AC-COP-50",
        category: "Piping",
        unit: "meters",
        unitCostPaise: 38000,
        sellingPricePaise: 48000,
        stockQuantity: 45,
        minStockThreshold: 10,
      },
      {
        businessId: coolBreeze.id,
        name: "R32 Refrigerant Gas Cylinder (3kg)",
        sku: "AC-GAS-R32",
        category: "Refrigerant",
        unit: "kg",
        unitCostPaise: 85000,
        sellingPricePaise: 120000,
        stockQuantity: 12,
        minStockThreshold: 4,
      },
      {
        businessId: coolBreeze.id,
        name: "Run Capacitor 50 MFD",
        sku: "AC-CAP-50",
        category: "Electrical",
        unit: "pcs",
        unitCostPaise: 16000,
        sellingPricePaise: 35000,
        stockQuantity: 28,
        minStockThreshold: 5,
      },
    ],
    skipDuplicates: true,
  });

  // Fictional Customer for CoolBreeze
  const customerAnanya = await prisma.customer.create({
    data: {
      businessId: coolBreeze.id,
      name: "Ananya Ramesh",
      phone: "+91 98401 23456",
      email: "ananya.ramesh@gmail.com",
      notes: "Preferred visit time after 10 AM. Ground floor apartment.",
    },
  });

  const addressAnanya = await prisma.customerAddress.create({
    data: {
      businessId: coolBreeze.id,
      customerId: customerAnanya.id,
      line1: "Flat 2B, Green Palms Apartment",
      line2: "14, 2nd Main Road, Gandhi Nagar, Adyar",
      landmark: "Near Adyar Ananda Bhavan",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600028",
      isDefault: true,
    },
  });

  // Customer Asset
  const assetAc = await prisma.asset.create({
    data: {
      businessId: coolBreeze.id,
      customerId: customerAnanya.id,
      name: "Daikin 1.5 Ton 5-Star Inverter Split AC",
      category: "AC",
      brand: "Daikin",
      modelNumber: "FTKF50TV",
      serialNumber: "DKN2024-88910",
      installationDate: new Date("2024-04-10"),
    },
  });

  // Booking
  const booking1 = await prisma.booking.create({
    data: {
      businessId: coolBreeze.id,
      customerId: customerAnanya.id,
      customerAddressId: addressAnanya.id,
      serviceId: acServiceCleaning.id,
      bookingReference: "BK-2026-1001",
      requestedDate: new Date(),
      timeWindow: "MORNING",
      problemDescription: "Cooling is mild and foul odor coming from the blower when turned on.",
      source: BookingSource.PUBLIC_PAGE,
      status: BookingStatus.CONFIRMED,
      confirmedAt: new Date(),
    },
  });

  // Job
  const job1 = await prisma.job.create({
    data: {
      businessId: coolBreeze.id,
      bookingId: booking1.id,
      customerId: customerAnanya.id,
      serviceId: acServiceCleaning.id,
      assetId: assetAc.id,
      jobNumber: "JOB-2026-1001",
      title: "AC Jet Wash & Odor Sanitization",
      scheduledStartTime: new Date(),
      scheduledEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: JobStatus.IN_PROGRESS,
      priority: "HIGH",
    },
  });

  // Assignment
  await prisma.jobAssignment.create({
    data: {
      businessId: coolBreeze.id,
      jobId: job1.id,
      userId: userMurugan.id,
      role: "LEAD",
    },
  });

  // Quotation
  const quote1 = await prisma.quotation.create({
    data: {
      businessId: coolBreeze.id,
      customerId: customerAnanya.id,
      jobId: job1.id,
      quotationNumber: "QTN-2026-1001",
      version: 1,
      status: QuotationStatus.APPROVED,
      subtotalPaise: 114900,
      discountPaise: 0,
      taxPaise: 20682,
      totalPaise: 135582, // ₹1,355.82
      approvalToken: "appr_tok_seed_demo_coolbreeze_1001",
      approvedAt: new Date(),
      approvedBy: "Ananya Ramesh",
      approvedVersion: 1,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      terms: "90 days service guarantee on jet cleaning and condenser coil wash.",
    },
  });

  await prisma.quotationItem.createMany({
    data: [
      {
        quotationId: quote1.id,
        type: LineItemType.LABOUR,
        description: "Jet Pump Deep Cleaning & Coil Sanitization",
        quantity: 1,
        unitPricePaise: 79900,
        totalPaise: 79900,
      },
      {
        quotationId: quote1.id,
        type: LineItemType.MATERIAL,
        description: "Run Capacitor 50 MFD Replacement",
        quantity: 1,
        unitPricePaise: 35000,
        totalPaise: 35000,
      },
    ],
  });

  // Invoice
  const invoice1 = await prisma.invoice.create({
    data: {
      businessId: coolBreeze.id,
      customerId: customerAnanya.id,
      jobId: job1.id,
      quotationId: quote1.id,
      invoiceNumber: "INV-2026-1001",
      status: InvoiceStatus.PARTIALLY_PAID,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      subtotalPaise: 114900,
      discountPaise: 0,
      taxPaise: 20682,
      totalPaise: 135582,
      paidAmountPaise: 100000, // ₹1,000 paid
      balancePaise: 35582,    // ₹355.82 balance
    },
  });

  await prisma.invoiceItem.createMany({
    data: [
      {
        invoiceId: invoice1.id,
        type: LineItemType.LABOUR,
        description: "Jet Pump Deep Cleaning & Coil Sanitization",
        quantity: 1,
        unitPricePaise: 79900,
        totalPaise: 79900,
      },
      {
        invoiceId: invoice1.id,
        type: LineItemType.MATERIAL,
        description: "Run Capacitor 50 MFD Replacement",
        quantity: 1,
        unitPricePaise: 35000,
        totalPaise: 35000,
      },
    ],
  });

  // Recorded Partial Payment
  await prisma.payment.create({
    data: {
      businessId: coolBreeze.id,
      invoiceId: invoice1.id,
      customerId: customerAnanya.id,
      amountPaise: 100000,
      method: PaymentMethod.UPI,
      transactionReference: "UPI-AXIS-20260408129",
      status: PaymentStatus.SUCCESS,
      recordedByUserId: userRajesh.id,
    },
  });

  // Subscription
  await prisma.subscription.create({
    data: {
      businessId: coolBreeze.id,
      plan: "GROWTH",
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.create({
    data: {
      businessId: apexCare.id,
      plan: "STARTER",
      status: "TRIAL",
      billingCycle: "MONTHLY",
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Business 1: CoolBreeze Climate Solutions (AC Services)");
  console.log("Slug: coolbreeze");
  console.log("Owner login: rajesh@coolbreeze.in / Password123!");
  console.log("Technician login: murugan@coolbreeze.in / Password123!");
  console.log("-----------------------------------------");
  console.log("Business 2: Apex Power & Appliance Care (Appliances & Electrical)");
  console.log("Slug: apexcare");
  console.log("Owner login: karthik@apexcare.in / Password123!");
  console.log("Technician login: vignesh@apexcare.in / Password123!");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
