import { useEffect, useState } from 'react';

// Ta en verdi som er litt hyperaktiv og gi den en timeout
//
// Bruk:
//          const updatedValue = useDebounce(delayedValue, 500);
//          React.useEffect(() => {
//              if (updatedValue) { console.log ('do stuff'); }
//          }, [updatedValue]);

function useDebounce<T>(value: T, delay: number): T {
    const [newValue, setNewValue] = useState<T>(value);

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            setNewValue(value);
        }, delay);
        return () => {
            clearTimeout(timeoutID);
        };
    }, [value, delay]);

    return newValue;
}

export default useDebounce;