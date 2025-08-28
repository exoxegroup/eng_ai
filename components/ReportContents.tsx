import React from 'react';
import { SessionData } from '../types';

const ReportItem: React.FC<{ label: string; value: React.ReactNode; isBlock?: boolean }> = ({ label, value, isBlock = false }) => (
  <div className={`bg-white p-4 rounded-lg shadow-sm print:shadow-none print:border print:border-slate-200 ${isBlock ? 'col-span-1 md:col-span-2' : ''}`}>
    <h3 className="text-sm font-semibold text-slate-500 mb-1">{label}</h3>
    <div className="text-slate-800 text-base break-words">{value}</div>
  </div>
);

const ReportContents: React.FC<{ data: SessionData }> = ({ data }) => {
  const sessionDuration = data.endTime ? ((data.endTime.getTime() - data.startTime.getTime()) / 1000 / 60).toFixed(2) : 'N/A';

  return (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-lg print:shadow-none print:border print:border-slate-200 print:bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="text-xl font-bold text-slate-800 col-span-1 md:col-span-2 border-b pb-2 mb-2">Session Summary</h2>
        <ReportItem label="Session ID" value={data.sessionId} />
        <ReportItem label="User Satisfaction" value={
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                data.userSatisfaction === 'Satisfied' ? 'bg-green-100 text-green-800' : 
                data.userSatisfaction === 'Unsatisfied' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
            }`}>
                {data.userSatisfaction}
            </span>
        }/>
        <ReportItem label="Country of Origin" value={data.countryOfOrigin || 'Not provided'} />
        <ReportItem label="User Location" value={data.userLocation || 'Not available'} />
        <ReportItem label="Session Start" value={data.startTime.toLocaleString()} />
        <ReportItem label="Session End" value={data.endTime ? data.endTime.toLocaleString() : 'N/A'} />
        <ReportItem label="Session Duration (minutes)" value={sessionDuration} />
        <ReportItem label="Total Messages" value={data.totalMessages} />

        <h2 className="text-xl font-bold text-slate-800 col-span-1 md:col-span-2 border-b pb-2 mb-2 mt-4">Prompts & Solution</h2>
        <ReportItem label="User's Original Prompt" value={<p className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-2 rounded">{data.originalPrompt || 'Not provided'}</p>} isBlock />
        <ReportItem label="AI's Refined Prompt" value={<p className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-2 rounded">{data.aiRefinedPrompt || 'Not generated'}</p>} isBlock />
        <ReportItem label="AI's Solution" value={<p className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-2 rounded">{data.aiSolution || 'Not provided'}</p>} isBlock />
        
        <h2 className="text-xl font-bold text-slate-800 col-span-1 md:col-span-2 border-b pb-2 mb-2 mt-4">Interaction Metrics</h2>
        <ReportItem label="AI-Initiated Refinements" value={data.aiInitiatedRefinements} />
        <ReportItem label="User-Initiated Refinements" value={data.userInitiatedRefinements} />
        <ReportItem label="Satisfaction Survey Interactions" value={data.satisfactionSurveyInteractions} />
        
        <h2 className="text-xl font-bold text-slate-800 col-span-1 md:col-span-2 border-b pb-2 mb-2 mt-4">Performance Analysis</h2>
        <ReportItem label="User Engagement Score" value={`${data.userEmotionalEngagementScore} / 3`} />
        <ReportItem label="Rationale for Engagement Score" value={data.engagementRationale} />
        <ReportItem label="User Intelligence Score" value={`${data.userIntelligenceScore} / 3`} />
        <ReportItem label="Rationale for Intelligence Score" value={data.intelligenceRationale} />
      </div>
    </div>
  );
};

export default ReportContents;