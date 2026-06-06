import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

const quotationSchema = z.object({
  deliveryTimeline: z.string().min(1, 'Delivery timeline is required'),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unitPrice: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be positive'),
      tax: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be positive'),
    })
  ),
});

const QuotationForm = ({ rfq, onBack }) => {
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      deliveryTimeline: '',
      terms: '',
      items: rfq.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: 0,
        tax: 0,
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  // Calculate Grand Total
  const grandTotal = watchedItems.reduce((acc, curr) => {
    const total = (curr.quantity || 0) * (curr.unitPrice || 0) + (curr.tax || 0);
    return acc + total;
  }, 0);

  const mutation = useMutation({
    mutationFn: (data) => api.post('/quotations', { ...data, rfqId: rfq._id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendor-rfqs']);
      alert('Quotation submitted successfully!');
      onBack();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to submit quotation');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 border-b pb-4 mb-6">
        <button onClick={onBack} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Submit Quote: {rfq.title}</h3>
          <p className="text-sm text-gray-500">RFQ Number: {rfq.rfqNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-3 font-medium">Item Name</th>
                <th className="p-3 font-medium">Quantity</th>
                <th className="p-3 font-medium">Unit Price (₹)</th>
                <th className="p-3 font-medium">Tax (₹)</th>
                <th className="p-3 font-medium text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field, index) => {
                const uPrice = watchedItems[index]?.unitPrice || 0;
                const tax = watchedItems[index]?.tax || 0;
                const qty = field.quantity;
                const lineTotal = uPrice * qty + tax;

                return (
                  <tr key={field.id}>
                    <td className="p-3 text-sm font-medium text-gray-800">
                      {field.name}
                      <input type="hidden" {...register(`items.${index}.name`)} />
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {field.quantity}
                      <input type="hidden" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 p-1.5 border text-sm"
                        placeholder="0.00"
                      />
                      {errors.items?.[index]?.unitPrice && <span className="text-xs text-red-500">{errors.items[index].unitPrice.message}</span>}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        {...register(`items.${index}.tax`, { valueAsNumber: true })}
                        className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 p-1.5 border text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-3 text-right font-medium text-gray-800">₹{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="4" className="p-3 text-right font-bold text-gray-700">Grand Total:</td>
                <td className="p-3 text-right font-bold text-primary-600 text-lg">₹{grandTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Timeline</label>
            <input
              type="text"
              {...register('deliveryTimeline')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 p-2 border"
              placeholder="e.g. 2-3 weeks from PO date"
            />
            {errors.deliveryTimeline && <p className="mt-1 text-xs text-red-600">{errors.deliveryTimeline.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
            <textarea
              {...register('terms')}
              rows="2"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 p-2 border"
              placeholder="Payment terms, validity, etc."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
