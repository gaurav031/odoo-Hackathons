import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import ApprovalActionModal from './ApprovalActionModal';

const fetchPendingApprovals = async () => {
  const response = await api.get('/approvals/pending');
  return response.data.data.approvals;
};

const ApprovalList = () => {
  const [selectedApproval, setSelectedApproval] = useState(null);

  const { data: approvals, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: fetchPendingApprovals,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading pending approvals...</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvals?.map((approval) => (
          <div key={approval._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-bold text-gray-800">{approval.referenceType} Request</span>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Level {approval.level}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Requested by: <span className="font-medium text-gray-800">{approval.requesterId?.name}</span></p>
              <p className="text-xs text-gray-500">Ref ID: {approval.referenceId}</p>
              <p className="text-xs text-gray-400 mt-4">Date: {new Date(approval.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedApproval({ ...approval, intent: 'Approved' })}
                className="flex-1 flex items-center justify-center space-x-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setSelectedApproval({ ...approval, intent: 'Rejected' })}
                className="flex-1 flex items-center justify-center space-x-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        ))}
        {approvals?.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">You're all caught up!</p>
            <p className="text-sm mt-1">No pending approvals require your attention.</p>
          </div>
        )}
      </div>

      {selectedApproval && (
        <ApprovalActionModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
        />
      )}
    </>
  );
};

export default ApprovalList;
