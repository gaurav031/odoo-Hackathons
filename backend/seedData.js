import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Vendor from './models/Vendor.js';
import RFQ from './models/RFQ.js';
import Quotation from './models/Quotation.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import Invoice from './models/Invoice.js';
import ActivityLog from './models/ActivityLog.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Clearing old data...');

    // Clear all collections
    await User.deleteMany();
    await Vendor.deleteMany();
    await RFQ.deleteMany();
    await Quotation.deleteMany();
    await PurchaseOrder.deleteMany();
    await Invoice.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Old data cleared. Seeding new data...');

    // 1. Create Vendors First
    const vendor1 = await Vendor.create({
      companyName: 'TechCorp Solutions',
      contactPerson: 'Alice Smith',
      email: 'vendor1@techcorp.com',
      phone: '1234567890',
      address: '123 Tech Lane, Silicon Valley',
      gstNumber: '27AABCU9603R1ZX',
      status: 'Approved',
      rating: 4.8
    });

    const vendor2 = await Vendor.create({
      companyName: 'Office World Inc.',
      contactPerson: 'Bob Johnson',
      email: 'vendor2@officeworld.com',
      phone: '0987654321',
      address: '456 Business Blvd, NY',
      gstNumber: '27AABCU1234R1ZX',
      status: 'Approved',
      rating: 4.2
    });

    const vendor3 = await Vendor.create({
      companyName: 'Pending Supplies',
      contactPerson: 'Charlie Brown',
      email: 'vendor3@pending.com',
      phone: '1112223333',
      address: '789 New St, Chicago',
      gstNumber: '27AABCU0000R1ZX',
      status: 'Pending',
      rating: 0
    });

    // 2. Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@vendorbridge.com',
      password: 'password123',
      role: 'Admin',
      status: 'Approved'
    });

    const manager = await User.create({
      name: 'Procurement Manager',
      email: 'manager@vendorbridge.com',
      password: 'password123',
      role: 'Manager',
      status: 'Approved'
    });

    const approver = await User.create({
      name: 'Finance Approver',
      email: 'approver@vendorbridge.com',
      password: 'password123',
      role: 'Approver',
      status: 'Approved'
    });

    const pendingManager = await User.create({
      name: 'New Trainee',
      email: 'trainee@vendorbridge.com',
      password: 'password123',
      role: 'Manager',
      status: 'Pending'
    });

    const vendorUser1 = await User.create({
      name: 'Alice Smith',
      email: 'vendor1@techcorp.com',
      password: 'password123',
      role: 'Vendor',
      status: 'Approved',
      vendorId: vendor1._id
    });

    const vendorUser2 = await User.create({
      name: 'Bob Johnson',
      email: 'vendor2@officeworld.com',
      password: 'password123',
      role: 'Vendor',
      status: 'Approved',
      vendorId: vendor2._id
    });

    // 3. Create RFQs
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const rfq1 = await RFQ.create({
      rfqNumber: 'RFQ-202310-1001',
      title: 'Q4 Developer Laptops',
      description: 'Require 10 high-performance laptops for the new engineering batch.',
      items: [
        { name: 'MacBook Pro 16" M3 Max', quantity: 5, specs: '64GB RAM, 2TB SSD' },
        { name: 'Dell XPS 15', quantity: 5, specs: '32GB RAM, 1TB SSD, i9' }
      ],
      invitedVendors: [vendor1._id, vendor2._id],
      deadline: futureDate,
      status: 'Open',
      createdBy: manager._id
    });

    const rfq2 = await RFQ.create({
      rfqNumber: 'RFQ-202309-2002',
      title: 'Office Ergonomic Chairs',
      description: 'Bulk order for 50 ergonomic chairs for the new HQ.',
      items: [
        { name: 'Herman Miller Aeron', quantity: 20, specs: 'Size B, Graphite' },
        { name: 'Steelcase Gesture', quantity: 30, specs: 'Dark Gray' }
      ],
      invitedVendors: [vendor2._id],
      deadline: pastDate,
      status: 'Closed',
      createdBy: manager._id
    });

    // 4. Create Quotations
    const quote1 = await Quotation.create({
      rfqId: rfq1._id,
      vendorId: vendor1._id,
      items: [
        { name: 'MacBook Pro 16" M3 Max', quantity: 5, unitPrice: 350000, tax: 18000, total: 1768000 },
        { name: 'Dell XPS 15', quantity: 5, unitPrice: 220000, tax: 10000, total: 1110000 }
      ],
      deliveryTimeline: '2 Weeks',
      terms: '50% advance, 50% on delivery',
      grandTotal: 2878000,
      status: 'Submitted'
    });

    const quote2 = await Quotation.create({
      rfqId: rfq1._id,
      vendorId: vendor2._id,
      items: [
        { name: 'MacBook Pro 16" M3 Max', quantity: 5, unitPrice: 360000, tax: 18000, total: 1818000 },
        { name: 'Dell XPS 15', quantity: 5, unitPrice: 215000, tax: 10000, total: 1085000 }
      ],
      deliveryTimeline: '1 Week',
      terms: 'Net 30',
      grandTotal: 2903000,
      status: 'Submitted'
    });

    const quote3 = await Quotation.create({
      rfqId: rfq2._id,
      vendorId: vendor2._id,
      items: [
        { name: 'Herman Miller Aeron', quantity: 20, unitPrice: 120000, tax: 5000, total: 2500000 },
        { name: 'Steelcase Gesture', quantity: 30, unitPrice: 90000, tax: 4000, total: 2820000 }
      ],
      deliveryTimeline: '3 Days',
      terms: 'Net 15',
      grandTotal: 5320000,
      status: 'Approved' // This one won the bid
    });

    // 5. Create Purchase Order
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-202309-5001',
      rfqId: rfq2._id,
      quotationId: quote3._id,
      vendorId: vendor2._id,
      items: quote3.items,
      totalAmount: quote3.grandTotal,
      deliveryTimeline: quote3.deliveryTimeline,
      terms: quote3.terms,
      status: 'Accepted',
      createdBy: manager._id
    });

    // 6. Create Invoice
    const invoice1 = await Invoice.create({
      invoiceNumber: 'INV-OW-001',
      poId: po1._id,
      vendorId: vendor2._id,
      items: po1.items,
      subTotal: 5140000,
      taxAmount: 180000,
      totalAmount: 5320000,
      dueDate: futureDate,
      status: 'Pending',
      notes: 'Please transfer to account XXXXXX'
    });

    // 7. Activity Logs
    await ActivityLog.create({
      action: 'CREATED',
      entityType: 'RFQ',
      entityId: rfq1._id,
      performedBy: manager._id,
      details: `RFQ "${rfq1.title}" was created.`
    });

    await ActivityLog.create({
      action: 'GENERATED',
      entityType: 'PurchaseOrder',
      entityId: po1._id,
      performedBy: manager._id,
      details: `Purchase Order ${po1.poNumber} generated for ${vendor2.companyName}`
    });

    console.log('✅ Database seeded successfully with comprehensive test data!');
    
    // Because we hashed password directly, ensure they can login
    // We bypassed the User.create pre-save hook by injecting hash. Wait! 
    // User schema HAS a pre-save hook that hashes password!
    // So if I pass passwordHash to User.create, the pre-save hook will hash it AGAIN!
    // Let me update the seeded users to pass plain text 'password123' to let the hook hash it.
    
    console.log('Passwords are set to: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
