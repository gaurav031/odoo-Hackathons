import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Vendor from './models/Vendor.js';
import RFQ from './models/RFQ.js';
import Quotation from './models/Quotation.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import Invoice from './models/Invoice.js';
import ActivityLog from './models/ActivityLog.js';

dotenv.config();

// Helper functions for random data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedMassData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Clearing old data...');

    await User.deleteMany();
    await Vendor.deleteMany();
    await RFQ.deleteMany();
    await Quotation.deleteMany();
    await PurchaseOrder.deleteMany();
    await Invoice.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Generating Core Users...');

    // Core Admin/Manager Users
    const admin = await User.create({ name: 'System Admin', email: 'admin@vendorbridge.com', password: 'password123', role: 'Admin', status: 'Approved' });
    const manager = await User.create({ name: 'Lead Manager', email: 'manager@vendorbridge.com', password: 'password123', role: 'Manager', status: 'Approved' });
    const approver = await User.create({ name: 'Finance Head', email: 'approver@vendorbridge.com', password: 'password123', role: 'Approver', status: 'Approved' });

    console.log('Generating 15 Vendors...');
    
    const vendorCompanies = [
      'AlphaTech Supplies', 'BetaLogistics', 'Gamma Goods', 'Delta IT Services', 
      'Epsilon Electronics', 'Zeta Hardware', 'Eta Construct', 'Theta Office', 
      'Iota Machines', 'Kappa Networks', 'Lambda Software', 'Mu Manufacturing',
      'Nu Dynamics', 'Xi Trading Co', 'Omicron Systems'
    ];

    const vendors = [];
    const vendorUsers = [];

    for (let i = 0; i < vendorCompanies.length; i++) {
      const vStatus = i < 12 ? 'Approved' : (i === 12 ? 'Blacklisted' : 'Pending');
      const vendor = await Vendor.create({
        companyName: vendorCompanies[i],
        contactPerson: `Contact ${i + 1}`,
        email: `contact@${vendorCompanies[i].toLowerCase().replace(/\s/g, '')}.com`,
        phone: `987654321${i % 10}`,
        address: `${100 + i} Commerce St, Business District`,
        gstNumber: `27AABCU960${i}R1ZX`,
        status: vStatus,
        rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 to 5.0
      });
      vendors.push(vendor);

      if (vStatus === 'Approved') {
        const vUser = await User.create({
          name: vendor.contactPerson,
          email: vendor.email,
          password: 'password123',
          role: 'Vendor',
          status: 'Approved',
          vendorId: vendor._id
        });
        vendorUsers.push(vUser);
      }
    }

    const approvedVendors = vendors.filter(v => v.status === 'Approved');

    console.log('Generating 30 RFQs & Workflows over 6 months...');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      // Create RFQ
      const rfqDate = randomDate(sixMonthsAgo, today);
      const isClosed = randomInt(0, 10) > 3; // 70% closed
      const numItems = randomInt(1, 5);
      const items = [];
      for (let j = 0; j < numItems; j++) {
        items.push({ name: `Procurement Item ${j+1} - Batch ${i}`, quantity: randomInt(10, 500), specs: 'Standard Specs' });
      }

      // Randomly select 3-5 vendors to invite
      const invited = approvedVendors.sort(() => 0.5 - Math.random()).slice(0, randomInt(3, 5));

      const rfq = await RFQ.create({
        rfqNumber: `RFQ-${rfqDate.toISOString().slice(0, 7).replace('-', '')}-${randomInt(1000, 9999)}`,
        title: `Bulk Procurement Req ${i + 1}`,
        description: `This is a generated request for bulk procurement to test the system charts.`,
        items,
        invitedVendors: invited.map(v => v._id),
        deadline: new Date(rfqDate.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
        status: isClosed ? 'Closed' : 'Open',
        createdBy: manager._id
      });
      
      // Force createdAt for charts
      await RFQ.findByIdAndUpdate(rfq._id, { createdAt: rfqDate, updatedAt: rfqDate });

      await ActivityLog.create({
        action: 'CREATED',
        entityType: 'RFQ',
        entityId: rfq._id,
        performedBy: manager._id,
        details: `RFQ "${rfq.title}" created.`,
        createdAt: rfqDate
      });

      if (isClosed) {
        // Generate Quotations
        const quotes = [];
        for (let v = 0; v < invited.length; v++) {
          const qDate = new Date(rfqDate.getTime() + randomInt(1, 6) * 24 * 60 * 60 * 1000);
          
          let gTotal = 0;
          const qItems = items.map(item => {
            const uPrice = randomInt(500, 5000);
            const tax = randomInt(50, 500);
            const total = (uPrice * item.quantity) + tax;
            gTotal += total;
            return { name: item.name, quantity: item.quantity, unitPrice: uPrice, tax, total };
          });

          const quote = await Quotation.create({
            rfqId: rfq._id,
            vendorId: invited[v]._id,
            items: qItems,
            grandTotal: gTotal,
            deliveryTimeline: `${randomInt(1, 4)} Weeks`,
            terms: 'Standard net 30',
            status: 'Submitted'
          });
          
          await Quotation.findByIdAndUpdate(quote._id, { createdAt: qDate });
          quotes.push(quote);
        }

        // Approve lowest quote
        quotes.sort((a, b) => a.grandTotal - b.grandTotal);
        const winningQuote = quotes[0];
        await Quotation.findByIdAndUpdate(winningQuote._id, { status: 'Approved' });
        
        // Generate PO
        const poDate = new Date(winningQuote.createdAt.getTime() + 1 * 24 * 60 * 60 * 1000);
        const po = await PurchaseOrder.create({
          poNumber: `PO-${poDate.toISOString().slice(0, 10).replace(/-/g, '')}-${randomInt(1000, 9999)}`,
          rfqId: rfq._id,
          quotationId: winningQuote._id,
          vendorId: winningQuote.vendorId,
          items: winningQuote.items,
          totalAmount: winningQuote.grandTotal,
          deliveryTimeline: winningQuote.deliveryTimeline,
          terms: winningQuote.terms,
          status: randomChoice(['Sent', 'Accepted', 'Fulfilled']),
          createdBy: manager._id
        });
        await PurchaseOrder.findByIdAndUpdate(po._id, { createdAt: poDate });

        await ActivityLog.create({
          action: 'GENERATED',
          entityType: 'PurchaseOrder',
          entityId: po._id,
          performedBy: manager._id,
          details: `PO ${po.poNumber} generated.`,
          createdAt: poDate
        });

        // Generate Invoice for most POs
        if (randomInt(0, 10) > 2) {
          const invDate = new Date(poDate.getTime() + randomInt(5, 15) * 24 * 60 * 60 * 1000);
          const subT = po.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
          const txA = po.items.reduce((acc, i) => acc + i.tax, 0);

          const invoiceStatuses = ['Pending', 'Paid', 'Overdue'];

          const inv = await Invoice.create({
            invoiceNumber: `INV-${invDate.toISOString().slice(0, 10).replace(/-/g, '')}-${randomInt(100, 999)}`,
            poId: po._id,
            vendorId: po.vendorId,
            items: po.items,
            subTotal: subT,
            taxAmount: txA,
            totalAmount: subT + txA,
            dueDate: new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            status: randomChoice(invoiceStatuses),
            notes: 'Generated test invoice.'
          });
          await Invoice.findByIdAndUpdate(inv._id, { createdAt: invDate });

          await ActivityLog.create({
            action: 'CREATED',
            entityType: 'Invoice',
            entityId: inv._id,
            performedBy: admin._id,
            details: `Invoice ${inv.invoiceNumber} submitted.`,
            createdAt: invDate
          });
        }
      }
    }

    console.log('✅ Mass Database Seeding Complete!');
    console.log('All accounts have password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding mass DB:', error);
    process.exit(1);
  }
};

seedMassData();
