import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Vendor must have a company name'],
      unique: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Vendor must have a contact person'],
    },
    email: {
      type: String,
      required: [true, 'Vendor must have an email'],
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Vendor must have a phone number'],
    },
    address: {
      type: String,
      required: [true, 'Vendor must have an address'],
    },
    gstNumber: {
      type: String,
      required: [true, 'Vendor must have a GST number'],
      unique: true,
      uppercase: true,
    },
    categories: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Blacklisted'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
