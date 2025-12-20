import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SidebarMode = 'compact' | 'full';

interface LayoutContextType {
    sidebarMode: SidebarMode;
    setSidebarMode: (mode: SidebarMode) => void;
    showRightSection: boolean;
    setShowRightSection: (show: boolean) => void;
    toggleSidebarMode: () => void;
    toggleRightSection: () => void;
    tweetModalOpen: boolean;
    setTweetModalOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    // Initialize from localStorage or default
    const [sidebarMode, setSidebarModeState] = useState<SidebarMode>(() => {
        const saved = localStorage.getItem('layout_sidebarMode');
        return (saved as SidebarMode) || 'compact'; // Default to compact as per recent changes
    });

    const [showRightSection, setShowRightSectionState] = useState<boolean>(() => {
        const saved = localStorage.getItem('layout_showRightSection');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Non-persisted UI state
    const [tweetModalOpen, setTweetModalOpen] = useState(false);

    // Effects to save to localStorage
    useEffect(() => {
        localStorage.setItem('layout_sidebarMode', sidebarMode);
    }, [sidebarMode]);

    useEffect(() => {
        localStorage.setItem('layout_showRightSection', JSON.stringify(showRightSection));
    }, [showRightSection]);

    const setSidebarMode = (mode: SidebarMode) => {
        setSidebarModeState(mode);
    };

    const setShowRightSection = (show: boolean) => {
        setShowRightSectionState(show);
    };

    const toggleSidebarMode = () => {
        setSidebarModeState(prev => prev === 'compact' ? 'full' : 'compact');
    };

    const toggleRightSection = () => {
        setShowRightSectionState(prev => !prev);
    };

    return (
        <LayoutContext.Provider value={{
            sidebarMode,
            setSidebarMode,
            showRightSection,
            setShowRightSection,
            toggleSidebarMode,
            toggleRightSection,
            tweetModalOpen,
            setTweetModalOpen
        }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
