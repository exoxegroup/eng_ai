import React from 'react';
import { SessionData } from '../types';
import ReportContents from './ReportContents';

interface PrintableReportProps {
  sessions: SessionData[];
  onDone: () => void;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ sessions, onDone }) => {
  React.useEffect(() => {
    const handleAfterPrint = () => {
      onDone();
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Use a timeout to ensure the DOM has updated before printing
    const timer = setTimeout(() => {
        window.print();
    }, 500);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="bg-white">
      <div className="p-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Engineering AI Coach
        </h1>
        <p className="text-slate-600 mt-1">All Sessions Report</p>
      </div>
      
      {sessions.map((session) => (
        <div key={session.sessionId} className="p-8 page-break">
          <ReportContents data={session} />
        </div>
      ))}
    </div>
  );
};

export default PrintableReport;
