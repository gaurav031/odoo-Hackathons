import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../../api/axios';

const actionSchema = z.object({
  remarks: z.string().min(3, 'Please provide detailed remarks for this action'),
});

const ApprovalActionModal = ({ approval, onClose }) => {
  const queryClient = useQueryClient();
  const isApproving = approval.intent === 'Approved';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      remarks: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      api.post(`/approvals/${approval._id}/action`, {
        status: approval.intent,
        remarks: data.remarks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['approvals']);
      onClose();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to process approval');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className={`p-4 flex justify-between items-center text-white ${isApproving ? 'bg-green-600' : 'bg-red-600'}`}>
          <h3 className="font-bold">
            {isApproving ? 'Confirm Approval' : 'Confirm Rejection'}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              You are about to <strong className={isApproving ? 'text-green-600' : 'text-red-600'}>{approval.intent.toLowerCase()}</strong> this {approval.referenceType} request. Please provide mandatory remarks.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              {...register('remarks')}
              rows="4"
              className={`w-full rounded-md shadow-sm p-3 border focus:ring-2 focus:ring-opacity-50 ${
                isApproving ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500'
              }`}
              placeholder="State your reasons or notes..."
              autoFocus
            ></textarea>
            {errors.remarks && <p className="mt-1 text-xs text-red-600 font-medium">{errors.remarks.message}</p>}
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
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none disabled:opacity-50 transition-colors ${
                isApproving ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {mutation.isPending ? 'Processing...' : isApproving ? 'Approve' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalActionModal;
