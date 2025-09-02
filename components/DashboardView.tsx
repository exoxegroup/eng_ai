import React, { useState } from 'react';
import { useSessions } from '../src/hooks/useApi';
import { SessionData } from '../types';
import ReportView from './ReportView';
import PrintableReport from './PrintableReport';
import ExportIcon from './icons/ExportIcon';

const SessionListItem: React.FC<{ session: SessionData; onSelect: () => void; }> = ({ session, onSelect }) => (
    <button onClick={onSelect} className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex justify-between items-center">
        <div>
            <p className="font-semibold text-blue-600">{session.sessionId}</p>
            <p className="text-sm text-slate-500">
                {session.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'}
            </p>
        </div>
        <div>
             <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                session.userSatisfaction === 'Satisfied' ? 'bg-green-100 text-green-800' : 
                session.userSatisfaction === 'Unsatisfied' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
            }`}>
                {session.userSatisfaction}
            </span>
        </div>
    </button>
);

const DashboardView: React.FC = () => {
    const { data: sessions = [], isLoading, error } = useSessions();
    const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Handle loading and error states
    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-slate-600">Loading sessions...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Sessions</h2>
                    <p className="text-red-600">
                        {(error as Error).message || 'Failed to load sessions from the server.'}
                    </p>
                </div>
            </div>
        );
    }

    if (isPrinting) {
        return <PrintableReport sessions={sessions} onDone={() => setIsPrinting(false)} />;
    }

    if (selectedSession) {
        return (
            <div>
                 <div className="bg-white p-4 sticky top-0 z-10 border-b no-print">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <button onClick={() => setSelectedSession(null)} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition">
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </div>
                <div className="p-4 sm:p-6 md:p-8">
                    <ReportView data={selectedSession} />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[var(--text-primary)] text-3xl font-bold leading-tight tracking-tight">Session Dashboard</h1>
                {sessions.length > 0 && (
                     <button 
                        onClick={() => setIsPrinting(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-white text-[var(--text-secondary)] text-sm font-medium rounded-lg border border-[var(--border-color)] hover:bg-slate-50 transition-colors"
                    >
                        <ExportIcon />
                        Print All Reports
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {sessions.length > 0 ? (
                    sessions.map(session => (
                        <SessionListItem key={session.sessionId} session={session} onSelect={() => setSelectedSession(session)} />
                    ))
                ) : (
                    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-700">No sessions recorded yet.</h2>
                        <p className="text-slate-500 mt-2">Complete a session in the chat view to see the report here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;