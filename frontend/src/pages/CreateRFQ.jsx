import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Paperclip } from 'lucide-react';
import api from '../api/axios';

const createRfqSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a detailed description'),
  deadline: z.string().min(1, 'Deadline is required'),
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Item name is required'),
        quantity: z.number({ invalid_type_error: 'Must be a number' }).min(1),
        specs: z.string().optional(),
      })
    )
    .min(1, 'At least one item is required'),
  invitedVendors: z.array(z.string()).min(1, 'Please select at least one vendor'),
});

const CreateRFQ = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch vendors for selection
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await api.get('/vendors');
      return res.data.data.vendors;
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRfqSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      items: [{ name: '', quantity: 1, specs: '' }],
      invitedVendors: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/rfqs', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rfqs']);
      navigate('/rfqs');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create RFQ');
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('deadline', data.deadline);
    formData.append('items', JSON.stringify(data.items));
    formData.append('invitedVendors', JSON.stringify(data.invitedVendors));

    // Append files
    const fileInput = document.getElementById('attachments');
    if (fileInput && fileInput.files) {
      Array.from(fileInput.files).forEach((file) => {
        formData.append('attachments', file);
      });
    }

    mutation.mutate(formData);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/rfqs')}
          className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Create New RFQ</h2>
          <p className="text-sm text-gray-500">Define requirements and invite vendors to bid.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">1. Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">RFQ Title</label>
              <input
                type="text"
                {...register('title')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                placeholder="e.g. Q3 IT Hardware Procurement"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                placeholder="Describe the overall objective..."
              ></textarea>
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline</label>
              <input
                type="date"
                {...register('deadline')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
              />
              {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline.message}</p>}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">2. Line Items</h3>
            <button
              type="button"
              onClick={() => append({ name: '', quantity: 1, specs: '' })}
              className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Item Name</label>
                <input
                  type="text"
                  {...register(`items.${index}.name`)}
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                />
                {errors.items?.[index]?.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.items[index].name.message}</p>
                )}
              </div>
              <div className="col-span-12 md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                <input
                  type="number"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                />
                {errors.items?.[index]?.quantity && (
                  <p className="mt-1 text-xs text-red-600">{errors.items[index].quantity.message}</p>
                )}
              </div>
              <div className="col-span-12 md:col-span-5">
                <label className="block text-xs font-medium text-gray-500 mb-1">Technical Specs</label>
                <input
                  type="text"
                  {...register(`items.${index}.specs`)}
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                  placeholder="Optional"
                />
              </div>
              <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center items-end h-full pb-2">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {errors.items?.message && <p className="text-sm text-red-600 font-medium">{errors.items.message}</p>}
        </div>

        {/* Attachments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center space-x-2">
            <Paperclip className="w-5 h-5 text-gray-500" />
            <span>3. Attachments (Optional)</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documents (PDF, Word, Images)</label>
            <input
              type="file"
              id="attachments"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-300 rounded-md p-2"
            />
            <p className="text-xs text-gray-500 mt-2">Max 5 files. Max size 5MB per file.</p>
          </div>
        </div>

        {/* Vendor Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">4. Invite Vendors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2">
            {vendors?.map((vendor) => (
              <label
                key={vendor._id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={vendor._id}
                  {...register('invitedVendors')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{vendor.companyName}</p>
                  <p className="text-xs text-gray-500">{vendor.categories?.join(', ') || 'General'}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.invitedVendors && <p className="mt-1 text-sm text-red-600 font-medium">{errors.invitedVendors.message}</p>}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-3 bg-primary-600 text-white font-bold rounded-lg shadow-md hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Publishing RFQ...' : 'Publish RFQ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRFQ;
