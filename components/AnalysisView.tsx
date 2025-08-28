import React, { useState, useEffect, useMemo } from 'react';
import { SessionData } from '../types';
import SearchIcon from './icons/SearchIcon';

// Helper to calculate average, returning 0 for empty arrays to avoid NaN.
const calculateAverage = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    return arr.reduce((acc, val) => acc + val, 0) / arr.length;
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-200 rounded-full h-2">
            <div className="bg-[var(--primary-color)] h-2 rounded-full" style={{ width: `${value.toFixed(0)}%` }}></div>
        </div>
        <span className="text-sm text-[var(--text-secondary)]">{value.toFixed(0)}%</span>
    </div>
);

const ITEMS_PER_PAGE = 10;

const AnalysisView: React.FC = () => {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<SessionData[]>([]);
    const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string>('All');
    
    // State for the data table
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);


    useEffect(() => {
        const storedSessions = localStorage.getItem('eng-coach-sessions');
        if (storedSessions) {
            try {
                const parsed = JSON.parse(storedSessions).map((s: any) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: s.endTime ? new Date(s.endTime) : null,
                })).sort((a: SessionData, b: SessionData) => b.startTime.getTime() - a.startTime.getTime());
                setSessions(parsed);
                if (parsed.length > 0) {
                    setSelectedSession(parsed[0]);
                }
            } catch (error) {
                console.error("Failed to parse sessions from localStorage", error);
                setSessions([]);
            }
        }
    }, []);
    
    const countryData = useMemo(() => {
        const dataByCountry: { [key: string]: { sessions: SessionData[] } } = {};
        sessions.forEach(session => {
            if (session.countryOfOrigin) {
                const country = session.countryOfOrigin.trim();
                if (!dataByCountry[country]) {
                    dataByCountry[country] = { sessions: [] };
                }
                dataByCountry[country].sessions.push(session);
            }
        });

        return Object.entries(dataByCountry).map(([country, data]) => {
            const total = data.sessions.length;
            const satisfied = data.sessions.filter(s => s.userSatisfaction === 'Satisfied').length;
            const engagement = calculateAverage(data.sessions.map(s => s.userEmotionalEngagementScore));
            const intelligence = calculateAverage(data.sessions.map(s => s.userIntelligenceScore));
            return {
                country,
                totalSessions: total,
                satisfactionRate: total > 0 ? (satisfied / total) * 100 : 0,
                avgEngagement: (engagement / 3) * 100,
                avgIntelligence: (intelligence / 3) * 100,
            };
        }).sort((a, b) => b.totalSessions - a.totalSessions);
    }, [sessions]);
    

    useEffect(() => {
        let newFiltered = sessions;
        if (selectedCountry !== 'All') {
            newFiltered = sessions.filter(s => s.countryOfOrigin === selectedCountry);
        }
        setFilteredSessions(newFiltered);
        setCurrentPage(1); // Reset page on filter change
        if (newFiltered.length > 0 && (!selectedSession || selectedSession.countryOfOrigin !== selectedCountry && selectedCountry !== 'All')) {
           setSelectedSession(newFiltered[0]);
        } else if (newFiltered.length === 0) {
            setSelectedSession(null);
        }
    }, [selectedCountry, sessions, selectedSession]);

    const paginatedSessionsData = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        
        const sessionsAfterSearch = filteredSessions.filter(s =>
            s.sessionId.toLowerCase().includes(searchLower) ||
            (s.countryOfOrigin || '').toLowerCase().includes(searchLower) ||
            s.userSatisfaction.toLowerCase().includes(searchLower)
        );

        const totalItems = sessionsAfterSearch.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        
        const itemsForCurrentPage = sessionsAfterSearch.slice(startIndex, endIndex);

        return { items: itemsForCurrentPage, totalItems, totalPages };

    }, [filteredSessions, searchTerm, currentPage]);


    // --- Calculated Metrics from filtered sessions ---
    const totalSessions = filteredSessions.length;
    const engagementScores = filteredSessions.map(s => s.userEmotionalEngagementScore);
    const intelligenceScores = filteredSessions.map(s => s.userIntelligenceScore);
    const satisfiedSessions = filteredSessions.filter(s => s.userSatisfaction === 'Satisfied').length;
    
    const avgEngagement = (calculateAverage(engagementScores) / 3) * 100;
    const avgIntelligence = (calculateAverage(intelligenceScores) / 3) * 100;
    const satisfactionRate = totalSessions > 0 ? (satisfiedSessions / totalSessions) * 100 : 0;
    
    const sessionDuration = (data: SessionData | null) => data && data.endTime ? ((data.endTime.getTime() - data.startTime.getTime()) / 1000 / 60).toFixed(2) : 'N/A';


    return (
        <div className="p-8 grid grid-cols-12 gap-8">
            <aside className="col-span-3 bg-white p-6 rounded-lg shadow-sm self-start">
                <h2 className="text-[var(--text-primary)] text-lg font-bold leading-tight tracking-[-0.015em] mb-6">Filters</h2>
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="date-range">Date Range</label>
                        <select disabled className="form-select w-full rounded-md border-[var(--border-color)] bg-gray-100 text-[var(--text-primary)] cursor-not-allowed h-12 px-4 text-sm font-normal" id="date-range">
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="country">Country</label>
                        <select 
                            id="country"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="form-select w-full rounded-md border-[var(--border-color)] bg-white text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] h-12 px-4 text-sm font-normal"
                        >
                            <option value="All">All Countries</option>
                            {countryData.map(c => <option key={c.country} value={c.country}>{c.country}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="scores">Scores</label>
                        <select disabled className="form-select w-full rounded-md border-[var(--border-color)] bg-gray-100 text-[var(--text-primary)] cursor-not-allowed h-12 px-4 text-sm font-normal" id="scores">
                            <option>All Scores</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="satisfaction">Satisfaction</label>
                        <select disabled className="form-select w-full rounded-md border-[var(--border-color)] bg-gray-100 text-[var(--text-primary)] cursor-not-allowed h-12 px-4 text-sm font-normal" id="satisfaction">
                            <option>All Ratings</option>
                        </select>
                    </div>
                </div>
            </aside>
            <div className="col-span-9 space-y-8">
                <section>
                    <h1 className="text-[var(--text-primary)] text-3xl font-bold leading-tight tracking-tight mb-6">Key Metrics</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-[var(--border-color)] shadow-sm">
                            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Total Sessions</p>
                            <p className="text-[var(--text-primary)] tracking-tight text-3xl font-bold leading-tight">{totalSessions}</p>
                        </div>
                        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-[var(--border-color)] shadow-sm">
                            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Avg. Engagement</p>
                            <p className="text-[var(--text-primary)] tracking-tight text-3xl font-bold leading-tight">{avgEngagement.toFixed(0)}%</p>
                        </div>
                        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-[var(--border-color)] shadow-sm">
                            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Avg. Intelligence</p>
                            <p className="text-[var(--text-primary)] tracking-tight text-3xl font-bold leading-tight">{avgIntelligence.toFixed(0)}%</p>
                        </div>
                        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-[var(--border-color)] shadow-sm">
                            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Satisfaction Rate</p>
                            <p className="text-[var(--text-primary)] tracking-tight text-3xl font-bold leading-tight">{satisfactionRate.toFixed(0)}%</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-[var(--text-primary)] text-2xl font-bold leading-tight tracking-tight mb-6">Trends</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 rounded-lg border border-[var(--border-color)] p-6 bg-white shadow-sm">
                            <p className="text-[var(--text-primary)] text-base font-medium leading-normal">Engagement Trend</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-[var(--text-primary)] tracking-tight text-3xl font-bold leading-tight">+5%</p>
                                <p className="text-green-600 text-sm font-medium leading-normal">vs Last 30 Days</p>
                            </div>
                            <div className="flex min-h-[200px] flex-1 flex-col gap-4 pt-4">
                                <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 472 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0V109Z" fill="url(#paint0_linear_trends)"></path>
                                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="var(--primary-color)" strokeLinecap="round" strokeWidth="3"></path>
                                    <defs>
                                        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_trends" x1="236" x2="236" y1="1" y2="149">
                                            <stop stopColor="var(--primary-color)" stopOpacity="0.2"></stop>
                                            <stop offset="1" stopColor="var(--primary-color)" stopOpacity="0"></stop>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 rounded-lg border border-[var(--border-color)] p-6 bg-white shadow-sm">
                            <p className="text-[var(--text-primary)] text-base font-medium leading-normal">Intelligence Trend</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-[var(--text-primary)] tracking-tight text-3xl font-bold leading-tight">-2%</p>
                                <p className="text-red-600 text-sm font-medium leading-normal">vs Last 30 Days</p>
                            </div>
                           <div className="grid min-h-[200px] grid-flow-col gap-4 items-end justify-items-center pt-4">
                                <div className="bg-[var(--primary-color)] w-full rounded-t-md" style={{ height: `60%` }}></div>
                                <div className="bg-[var(--primary-color)] w-full rounded-t-md" style={{ height: `70%` }}></div>
                                <div className="bg-[var(--primary-color)] w-full rounded-t-md" style={{ height: `40%` }}></div>
                                <div className="bg-[var(--primary-color)] w-full rounded-t-md" style={{ height: `50%` }}></div>
                                <div className="bg-[var(--primary-color)] w-full rounded-t-md" style={{ height: `20%` }}></div>
                            </div>
                            <div className="grid grid-flow-col gap-4 justify-items-center border-t border-[var(--border-color)] pt-2">
                                <p className="text-[var(--text-secondary)] text-xs font-medium">1-20</p>
                                <p className="text-[var(--text-secondary)] text-xs font-medium">21-40</p>
                                <p className="text-[var(--text-secondary)] text-xs font-medium">41-60</p>
                                <p className="text-[var(--text-secondary)] text-xs font-medium">61-80</p>
                                <p className="text-[var(--text-secondary)] text-xs font-medium">81-100</p>
                            </div>
                        </div>
                    </div>
                </section>

                 <section>
                    <div className="flex flex-col">
                        <h2 className="text-[var(--text-primary)] text-2xl font-bold leading-tight tracking-tight mb-4">Data by Country</h2>
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
                                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[var(--text-primary)] sm:pl-6">Country</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Sessions</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Avg. Engagement</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Avg. Intelligence</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Satisfaction Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)] bg-white">
                                            {countryData.map((c) => (
                                                <tr key={c.country}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-[var(--text-primary)] sm:pl-6">{c.country}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]">{c.totalSessions}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]"><ProgressBar value={c.avgEngagement} /></td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]"><ProgressBar value={c.avgIntelligence} /></td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]"><ProgressBar value={c.satisfactionRate} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="grid grid-cols-1 @container">
                    <div className="flex flex-col">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[var(--text-primary)] text-2xl font-bold leading-tight tracking-tight">Session Data</h2>
                             <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by ID, country..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset to page 1 on new search
                                    }}
                                    className="form-input block w-64 rounded-md border-[var(--border-color)] bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
                                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[var(--text-primary)] sm:pl-6">Session ID</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Country</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Start Time</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Duration (min)</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Engagement</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Intelligence</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]">Satisfaction</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)] bg-white">
                                            {paginatedSessionsData.items.map((session) => (
                                                <tr key={session.sessionId} className={selectedSession?.sessionId === session.sessionId ? 'bg-blue-50' : ''}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-[var(--text-primary)] sm:pl-6">{session.sessionId}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]">{session.countryOfOrigin || 'N/A'}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]">{session.startTime.toLocaleDateString()}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]">{sessionDuration(session)}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]"><ProgressBar value={(session.userEmotionalEngagementScore / 3) * 100} /></td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]"><ProgressBar value={(session.userIntelligenceScore / 3) * 100} /></td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            session.userSatisfaction === 'Satisfied' ? 'bg-green-100 text-green-800' :
                                                            session.userSatisfaction === 'Neutral' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {session.userSatisfaction}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        {/* Pagination */}
                        {paginatedSessionsData.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-[var(--border-color)] px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginatedSessionsData.totalPages))}
                                        disabled={currentPage === paginatedSessionsData.totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Showing <span className="font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, paginatedSessionsData.totalItems)}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, paginatedSessionsData.totalItems)}</span> of{' '}
                                            <span className="font-medium">{paginatedSessionsData.totalItems}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--border-color)] hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            {Array.from({ length: paginatedSessionsData.totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                        page === currentPage
                                                            ? 'z-10 bg-[var(--primary-color)] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-color)]'
                                                            : 'text-[var(--text-primary)] ring-1 ring-inset ring-[var(--border-color)] hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginatedSessionsData.totalPages))}
                                                disabled={currentPage === paginatedSessionsData.totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--border-color)] hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AnalysisView;