import React from 'react';
import { View } from '../../App';

interface ResearcherLayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
  onStartNewSession: () => void;
}

const BellIcon = () => (
    <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
        <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
    </svg>
);

const LogoIcon = () => (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
    </svg>
);


const ResearcherLayout: React.FC<ResearcherLayoutProps> = ({ children, activeView, onNavigate, onStartNewSession }) => {
    return (
        <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden">
            <div className="flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--border-color)] px-10 py-4 bg-white no-print">
                    <div className="flex items-center gap-4 text-[var(--text-primary)]">
                        <div className="size-6 text-[var(--primary-color)]">
                           <LogoIcon />
                        </div>
                        <h2 className="text-[var(--text-primary)] text-xl font-bold leading-tight tracking-[-0.015em]">Coach AI</h2>
                    </div>
                    <nav className="flex flex-1 justify-center items-center gap-8">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className={`text-sm font-medium leading-normal py-2 ${activeView === 'dashboard' ? 'active-nav' : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)]'}`}>Dashboard</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('analysis'); }} className={`text-sm font-medium leading-normal py-2 ${activeView === 'analysis' ? 'active-nav' : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)]'}`}>Analysis</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full size-10 bg-transparent text-[var(--text-secondary)] hover:bg-[var(--secondary-color)]">
                            <div className="text-[var(--text-secondary)]">
                                <BellIcon />
                            </div>
                        </button>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url("https://i.pravatar.cc/40?u=researcher")` }}></div>
                        <button onClick={onStartNewSession} className="ml-4 px-4 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
                            Start New Session
                        </button>
                    </div>
                </header>
                 <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ResearcherLayout;
