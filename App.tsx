import React, { useState, useCallback, useEffect } from 'react';
import { useCreateSession } from './src/hooks/useApi';
import { ChatMessage, SessionData } from './types';
import ChatView from './components/ChatView';
import DashboardView from './components/DashboardView';
import AnalysisView from './components/AnalysisView';
import OtpView from './components/OtpView';
import ResearcherLayout from './components/layout/ResearcherLayout';
import { AI_INITIAL_GREETING, AI_ENGINEERING_PROMPT_QUESTION, SATISFACTION_QUESTION, END_SESSION_KEYWORDS } from './constants';
import { getAiCoachResponseStream, generateSessionReport, validateCountry } from './services/geminiService';

const createInitialSessionData = (): SessionData => ({
    sessionId: `eng-coach-${Date.now()}`,
    startTime: new Date(),
    endTime: null,
    countryOfOrigin: null,
    userLocation: null,
    originalPrompt: null,
    aiRefinedPrompt: null,
    aiSolution: null,
    userSatisfaction: 'Not provided',
    totalMessages: 1,
    sessionDuration: null,
    aiInitiatedRefinements: 0,
    userInitiatedRefinements: 0,
    satisfactionSurveyInteractions: 0,
    userEmotionalEngagementScore: 1,
    engagementRationale: '',
    userIntelligenceScore: 1,
    intelligenceRationale: '',
    keyTopics: [],
    skillAreas: [],
    nextSteps: [],
});

export type View = 'chat' | 'dashboard' | 'analysis';



const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [sessionData, setSessionData] = useState<SessionData>(createInitialSessionData);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: crypto.randomUUID(), sender: 'ai', text: AI_INITIAL_GREETING, timestamp: new Date() }
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEnding, setIsEnding] = useState<boolean>(false);
    const [isAnalysisAuthenticated, setIsAnalysisAuthenticated] = useState<boolean>(false);
    const [isDashboardAuthenticated, setIsDashboardAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const fetchLocation = async () => {
            if (sessionData.userLocation === null) {
                try {
                    const response = await fetch('https://ipapi.co/json/');
                    if (!response.ok) throw new Error('Failed to fetch location');
                    const data = await response.json();
                    const locationString = `${data.city}, ${data.region}, ${data.country_name}`;
                    setSessionData(prev => ({ ...prev, userLocation: locationString }));
                } catch (error) {
                    console.error("Could not fetch user location:", error);
                    setSessionData(prev => ({ ...prev, userLocation: 'Not available' }));
                }
            }
        };

        if (view === 'chat') {
            fetchLocation();
        }
    }, [sessionData.sessionId, view]);

    const handleStartNewSession = useCallback(() => {
        setSessionData(createInitialSessionData());
        setMessages([{ id: crypto.randomUUID(), sender: 'ai', text: AI_INITIAL_GREETING, timestamp: new Date() }]);
        setIsLoading(false);
        setIsEnding(false);
        setView('chat');
    }, []);

    const createSessionMutation = useCreateSession();

    const generateReport = useCallback(async (finalMessages: ChatMessage[], satisfaction: 'Satisfied' | 'Unsatisfied' | 'Not provided') => {
        setIsLoading(true);
        try {
            const reportData = await generateSessionReport(finalMessages, sessionData.originalPrompt || '', {
              satisfaction,
              userRefinements: sessionData.userInitiatedRefinements,
              satisfactionInteractions: sessionData.satisfactionSurveyInteractions
            });
            
            const finalSessionData = {
                ...sessionData,
                ...reportData,
                endTime: new Date(),
            };
            
            // Save to database via API
            await createSessionMutation.mutateAsync(finalSessionData);
            
            // Also save to localStorage as fallback
            const storedSessions = JSON.parse(localStorage.getItem('eng-coach-sessions') || '[]');
            storedSessions.push(finalSessionData);
            localStorage.setItem('eng-coach-sessions', JSON.stringify(storedSessions));

            setSessionData(finalSessionData);
            setView('dashboard');

        } catch (error) {
            console.error("Failed to generate report:", error);
            
            // Fallback to localStorage if API fails
            const finalSessionData = {
                ...sessionData,
                endTime: new Date(),
            };
            const storedSessions = JSON.parse(localStorage.getItem('eng-coach-sessions') || '[]');
            storedSessions.push(finalSessionData);
            localStorage.setItem('eng-coach-sessions', JSON.stringify(storedSessions));
            setSessionData(finalSessionData);
            setView('dashboard');
        } finally {
            setIsLoading(false);
        }
    }, [sessionData, createSessionMutation]);
    
    const handleEndSessionAndShowDashboard = useCallback(async () => {
        if (isLoading) return;

        // A session is considered "started" if the user has provided their country of origin.
        // This prevents saving empty sessions if the user clicks dashboard immediately.
        if (sessionData.countryOfOrigin) {
            setIsEnding(true);
            await generateReport(messages, 'Not provided');
        } else {
            setView('dashboard');
        }
    }, [isLoading, messages, sessionData.countryOfOrigin, generateReport]);

    const handleSendMessage = useCallback(async (text: string) => {
        setIsLoading(true);
        const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text, timestamp: new Date() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        if (sessionData.countryOfOrigin === null) {
            const { isValid, countryName } = await validateCountry(text);
            
            if (isValid && countryName) {
                setSessionData(prev => ({
                    ...prev,
                    countryOfOrigin: countryName,
                    totalMessages: prev.totalMessages + 1,
                }));

                const aiFollowUpMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    sender: 'ai',
                    text: AI_ENGINEERING_PROMPT_QUESTION,
                    timestamp: new Date()
                };
                
                setMessages(prev => [...prev, aiFollowUpMessage]);
                
                setSessionData(prev => ({
                    ...prev,
                    totalMessages: prev.totalMessages + 1,
                }));
            } else {
                 const aiRepromptMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    sender: 'ai',
                    text: "I'm sorry, that doesn't seem to be a valid country. Could you please tell me your country of origin?",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiRepromptMessage]);
                setSessionData(prev => ({
                    ...prev,
                    totalMessages: prev.totalMessages + 1,
                }));
            }

            setIsLoading(false);
            return;
        }

        const lowerCaseText = text.toLowerCase().trim();
        const isEndingSession = END_SESSION_KEYWORDS.some(keyword => lowerCaseText.includes(keyword));

        const lastAiMessage = messages[messages.length - 1]?.text || '';
        const wasSatisfactionQuestionAsked = lastAiMessage.includes(SATISFACTION_QUESTION);

        setSessionData(prev => ({
            ...prev,
            originalPrompt: prev.originalPrompt === null ? text : prev.originalPrompt,
            totalMessages: prev.totalMessages + 1,
            userInitiatedRefinements: prev.originalPrompt !== null ? prev.userInitiatedRefinements + 1 : prev.userInitiatedRefinements,
            satisfactionSurveyInteractions: wasSatisfactionQuestionAsked ? prev.satisfactionSurveyInteractions + 1 : prev.satisfactionSurveyInteractions,
        }));

        if (isEndingSession) {
             setIsEnding(true);
             await generateReport(newMessages, 'Satisfied');
            return;
        }

        try {
            const stream = await getAiCoachResponseStream(newMessages);
            let aiResponseText = "";
            const aiMessageId = crypto.randomUUID();

            setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '...', timestamp: new Date() }]);

            for await (const chunk of stream) {
                aiResponseText += chunk.text;
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg));
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorMessage: ChatMessage = {
                id: crypto.randomUUID(),
                sender: 'ai',
                text: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setSessionData(prev => ({
              ...prev,
              totalMessages: prev.totalMessages + 1,
            }))
        }
    }, [messages, sessionData, generateReport]);

    const renderContent = () => {
        if (view === 'chat') {
            return (
                <ChatView
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    onShowDashboard={handleEndSessionAndShowDashboard}
                    isEnding={isEnding}
                />
            );
        }

        const researcherContent = () => {
            switch (view) {
                case 'dashboard':
                    return isDashboardAuthenticated
                        ? <DashboardView />
                        : <OtpView onVerifySuccess={() => setIsDashboardAuthenticated(true)} />;
                case 'analysis':
                    return isAnalysisAuthenticated
                        ? <AnalysisView />
                        : <OtpView onVerifySuccess={() => setIsAnalysisAuthenticated(true)} />;
                default:
                    return isDashboardAuthenticated
                        ? <DashboardView />
                        : <OtpView onVerifySuccess={() => setIsDashboardAuthenticated(true)} />;
            }
        };

        return (
            <ResearcherLayout
                activeView={view}
                onNavigate={(newView: View) => setView(newView)}
                onStartNewSession={handleStartNewSession}
            >
                {researcherContent()}
            </ResearcherLayout>
        );
    };

    return (
        <div className="antialiased text-slate-800">{renderContent()}</div>
    );
};

export default App;