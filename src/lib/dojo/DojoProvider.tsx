import React, { createContext, useContext, useEffect, useState } from "react";
import { setupDojo } from "./config";

interface DojoContextType {
    world: any;
    components: any;
    systemCalls: any;
}

const DojoContext = createContext<DojoContextType | null>(null);

export const useDojo = () => {
    const context = useContext(DojoContext);
    if (!context) {
        throw new Error("useDojo must be used within a DojoProvider");
    }
    return context;
};

export const DojoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dojo, setDojo] = useState<DojoContextType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const dojoInstance = await setupDojo();
                setDojo(dojoInstance);
            } catch (error) {
                console.error("Failed to initialize Dojo:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    if (loading) {
        return <div>Loading Dojo Engine...</div>;
    }

    if (!dojo) {
        return <div>Failed to initialize Dojo Engine</div>;
    }

    return (
        <DojoContext.Provider value={dojo}>
            {children}
        </DojoContext.Provider>
    );
}; 