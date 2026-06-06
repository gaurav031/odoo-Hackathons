import { X, Printer, Download, Mail } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';

const InvoiceViewModal = ({ invoice, onClose }) => {
  const emailMutation = useMutation({
    mutationFn: () => api.post(`/invoices/${invoice._id}/send-email`),
    onSuccess: () => alert('Invoice email sent successfully!'),
    onError: () => alert('Failed to send email.'),
  });

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-document');
    const opt = {
      margin: 0.5,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 print:hidden">
          <div className="flex space-x-3">
            <button onClick={handlePrint} className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button 
              onClick={() => emailMutation.mutate()} 
              disabled={emailMutation.isPending}
              className="flex items-center space-x-1 text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{emailMutation.isPending ? 'Sending...' : 'Email Invoice'}</span>
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8" id="invoice-document">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-indigo-900 tracking-tight">TAX INVOICE</h1>
              <p className="text-gray-500 mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">{invoice.vendorId?.companyName || 'Vendor Name'}</h2>
              <p className="text-sm text-gray-500">{invoice.vendorId?.email || 'email@vendor.com'}</p>
              <p className="text-sm text-gray-500">GSTIN: {invoice.vendorId?.gstNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-b py-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
              <p className="font-bold text-gray-800">VendorBridge Corp.</p>
              <p className="text-sm text-gray-600 mt-1">123 Business Avenue<br/>Tech City, 10001</p>
              <p className="text-sm text-gray-600">finance@vendorbridge.com</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Invoice Details</h3>
              <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-1"><span className="font-medium text-gray-800">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-1"><span className="font-medium text-gray-800">PO Ref:</span> {invoice.poId?.poNumber}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mt-6">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 text-sm border-y">
                <th className="p-3 font-bold">Description</th>
                <th className="p-3 font-bold text-center">Qty</th>
                <th className="p-3 font-bold text-right">Unit Price</th>
                <th className="p-3 font-bold text-right">Tax</th>
                <th className="p-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items?.map((item) => (
                <tr key={item._id}>
                  <td className="p-3 text-sm text-gray-800 font-medium">{item.name}</td>
                  <td className="p-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                  <td className="p-3 text-sm text-gray-600 text-right">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="p-3 text-sm text-gray-600 text-right">₹{(item.tax || 0).toFixed(2)}</td>
                  <td className="p-3 text-sm text-gray-800 font-medium text-right">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4">
            <div className="w-1/2 md:w-1/3 space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Subtotal</span>
                <span>₹{invoice.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-600 border-b pb-2">
                <span>Total Tax</span>
                <span>₹{invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-gray-800 pt-2">
                <span>Grand Total</span>
                <span>₹{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes & Instructions</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
          
          <div className="mt-8 text-center text-xs text-gray-400">
            Thank you for your business!
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewModal;
