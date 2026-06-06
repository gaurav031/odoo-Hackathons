import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../../api/axios';

const generateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(2, 'Invoice Number is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

const GenerateInvoiceModal = ({ po, onClose }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${po.poNumber.split('-')[1]}-${Math.floor(1000 + Math.random() * 9000)}`,
      dueDate: '',
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/invoices', { ...data, poId: po._id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      alert('Invoice Generated Successfully!');
      onClose();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to generate invoice');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 flex justify-between items-center bg-indigo-600 text-white">
          <h3 className="font-bold">Generate Invoice for {po.poNumber}</h3>
          <button onClick={onClose} className="text-indigo-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-800 mb-4">
            <span className="font-bold">Amount to be billed:</span> ₹{po.totalAmount.toLocaleString()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              {...register('invoiceNumber')}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.invoiceNumber && <p className="mt-1 text-xs text-red-600 font-medium">{errors.invoiceNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.dueDate && <p className="mt-1 text-xs text-red-600 font-medium">{errors.dueDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              rows="3"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Payment instructions..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Generating...' : 'Submit Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
