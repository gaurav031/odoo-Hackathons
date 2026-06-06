# VendorBridge ERP

VendorBridge is a modern, full-stack Procurement & Vendor Management Enterprise Resource Planning (ERP) platform. It is designed to digitize and streamline business procurement workflows—from vendor onboarding to invoice generation.

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Secure authentication with 4 distinct roles:
    *   **Admin:** Full system access, User Management, and Global Analytics.
    *   **Manager:** Can create RFQs and generate Purchase Orders.
    *   **Approver:** Finance/Leadership role responsible for approving Quotations.
    *   **Vendor:** Restricted portal to view invited RFQs, submit Quotations, and upload Invoices.
*   **Comprehensive Dashboard & Analytics:** Real-time metrics powered by Recharts, showing Total Vendors, Active RFQs, Pending Approvals, Monthly Procurement Spend (Bar Chart), and Top Vendor Performance. Includes CSV Export functionality.
*   **Dynamic Data Tables:** Advanced search and filtering (by name, status, GSTIN, etc.) across all modules using `@tanstack/react-query`.
*   **Document Generation (PDF):** One-click high-resolution PDF generation and native printing for Purchase Orders and Invoices via `html2pdf.js`.
*   **Automated Email Notifications:** NodeMailer integration to instantly email vendors when a Purchase Order is generated, or notify Finance when an Invoice is submitted.
*   **Activity & Audit Logs:** A chronological, color-coded timeline tracking every major action (RFQ creation, Quote submission, PO generation) along with timestamps and user roles.
*   **Robust Registration Workflow:** New users are placed in a "Pending" state upon registration and must be approved by an Admin via the User Management screen before logging in.
*   **Role-Based Data Isolation:** Secure backend Mongoose queries ensure users only see data relevant to their role (e.g., Vendors only see their assigned RFQs and POs).

---

## 🔄 Core Procurement Workflow

The system enforces a strict, logical procurement lifecycle:

1.  **Vendor Onboarding:** Admins/Managers register vendors and approve their status.
2.  **Request For Quotation (RFQ):** Managers create an RFQ with specific line items, deadlines, and selectively invite approved vendors to bid.
3.  **Quotation Submission:** Invited Vendors log into the Vendor Portal, review the RFQ, and submit a Quotation detailing unit prices, taxes, and delivery timelines.
4.  **Comparison & Approval:** Approvers review all bids submitted for an RFQ side-by-side. The most competitive bid is marked as "Approved".
5.  **Purchase Order (PO) Generation:** Once a quote is approved, Managers generate a formal Purchase Order. The vendor is automatically notified via email.
6.  **Invoicing:** Upon fulfilling the PO, the Vendor logs into the portal and submits an Invoice against that specific PO. Finance is notified to process the payment.

---

## 🛠️ Technology Stack

### Frontend
*   **React 18** (Vite)
*   **TailwindCSS** (Styling, Custom Utility Classes, Responsive Design)
*   **React Router DOM** (Client-side routing)
*   **Redux Toolkit** (Global state management for Auth)
*   **TanStack Query / React Query** (Data fetching, caching, and mutations)
*   **Lucide React** (Modern iconography)
*   **Recharts** (Data visualization & dashboards)
*   **html2pdf.js** (Client-side PDF rendering)

### Backend
*   **Node.js & Express.js** (REST API framework)
*   **MongoDB & Mongoose** (NoSQL Database & Object Data Modeling)
*   **JSON Web Tokens (JWT)** (Stateless authentication)
*   **Bcrypt.js** (Password hashing)
*   **Nodemailer** (Email dispatch system)
*   **Multer** (Multipart form handling for file uploads)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB Instance (Local or Atlas)

### 1. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the environment variables below.
4. (Optional) Run the database seed script to populate the system with test data: `node seedMassData.js`
5. Start the development server: `npm run dev` (Runs on port 5000)

### 2. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev` (Runs on port 5173)

---

## ⚙️ Environment Variables (Backend `.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vendorbridge
JWT_SECRET=super_secret_jwt_key_for_development_purposes_only
JWT_EXPIRES_IN=1d
NODE_ENV=development

# Optional: Add SMTP credentials here for real email sending. 
# Defaults to Ethereal mock emails if left blank.
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
```

---

## 🧪 Test Accounts

If you ran the `seedMassData.js` script, you can log in using the following accounts. The password for all generated accounts is **`password123`**.

*   **Admin:** `admin@vendorbridge.com`
*   **Manager:** `manager@vendorbridge.com`
*   **Approver:** `approver@vendorbridge.com`
*   **Vendor:** `contact@alphatechsupplies.com` (or any generated vendor email)

*Enjoy using VendorBridge!*
