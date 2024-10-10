import React, { useRef, useEffect, useState } from 'react';
import { DatePicker, DatePickerProps, DateValidationError } from '@mui/x-date-pickers';
import { Box, SxProps } from '@mui/material';
import { Dayjs } from 'dayjs';

interface CustomDatePickerProps extends DatePickerProps<Dayjs> {
    label: string;
    value: Dayjs | null; // State-verdi
    onDateChange: (date: Dayjs | null) => void; // Callback for endret dato
    onDateError: (error: DateValidationError | null) => void; // Callback for feil-status
    sx?: SxProps;
}

const CustomDatePicker = ({label,value,onDateChange,onDateError,sx,...datePickerProps}: CustomDatePickerProps) => {
    const [dateError, setDateError] = useState<DateValidationError | null>(null);
    const divRef = useRef<HTMLDivElement | null>(null); // Ankeret til datepicker popper
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null); // Forankring av datepicker popper

    // Velger hvor datepicker popper skal forankres
    useEffect(() => {
        if (divRef.current) {
            setAnchorEl(divRef.current);
        }
    }, [divRef]);

    // Når datoen endres, send info ut
    const handleDateChange = (newDate: Dayjs | null) => {
        onDateChange(newDate);
    };

    // Når feil-status endres, send info ut
    const handleDateError = (error: DateValidationError | null) => {
        setDateError(error);
        onDateError(error);
    };

    // Håndtere feilmeldinger
    const getDateErrorMessage = (error: DateValidationError | null) => {
        switch (error) {
            case 'maxDate':
            case 'minDate':
                return `${label} må være innenfor det siste året`;
            case 'invalidDate':
                return `Ugyldig ${label.toLowerCase()}`;
            default:
                return '';
        }
    };
    const errorMessage = getDateErrorMessage(dateError);

    // Props her for å gjøre JSX litt mer oversiktlig
    const boxProps = {
        ref: divRef,
        sx: {
            ...sx, 
            padding: 0, 
            marginBottom: '8px', 
            display: 'inline-block'
        }
    }
    const datePickerAllProps = {
        ...datePickerProps,
        label,
        value,
        onChange: handleDateChange,
        onError: handleDateError,
        slotProps: {
            textField: {
                helperText: errorMessage || '',
                fullWidth: true,
                required: true,
                margin: 'normal' as "none" | "normal" | "dense",
                error: Boolean(dateError),
            },
            popper: {
                anchorEl: anchorEl,
            },
        },
    };

    return (
        <Box {...boxProps}>
            <DatePicker {...datePickerAllProps} />
        </Box>
    );
};

export default CustomDatePicker;