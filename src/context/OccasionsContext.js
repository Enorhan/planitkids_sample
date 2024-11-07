// src/context/OccasionsContext.js
import React, { createContext, useState, useContext } from 'react';

const OccasionsContext = createContext();

export const OccasionsProvider = ({ children }) => {
    const [occasions, setOccasions] = useState([]);

    return (
        <OccasionsContext.Provider value={{ occasions, setOccasions }}>
            {children}
        </OccasionsContext.Provider>
    );
};

export const useOccasions = () => {
    const context = useContext(OccasionsContext);
    if (!context) {
        throw new Error("useOccasions must be used within an OccasionsProvider");
    }
    return context;
};