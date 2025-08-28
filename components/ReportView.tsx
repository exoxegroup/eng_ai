import React from 'react';
import { SessionData } from '../types';
import ReportContents from './ReportContents';

interface ReportViewProps {
  data: SessionData;
}

const ReportView: React.FC<ReportViewProps> = ({ data }) => {
  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Engineering AI Coach</h1>
          <p className="text-slate-600 mt-1">Session Data Report</p>
        </header>
        
        <ReportContents data={data} />
      </div>
    </div>
  );
};

export default ReportView;