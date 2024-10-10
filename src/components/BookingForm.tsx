'use client';
import React, { useState } from 'react';
import { Box, Button, SelectChangeEvent, FormHelperText } from '@mui/material';
import { LocalizationProvider, DateValidationError } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs , { Dayjs } from 'dayjs';
import 'dayjs/locale/nb';
import CustomDatePicker from './CustomDatePicker';
import RoomTypeSelector from './RoomTypeSelector';

// Kan maks bestille hotell 364 dager fremover i tid
const MAX_DATE = dayjs().add(364, 'day');

// Feilmeldinger samlet her
const ERROR_MESSAGES = {
    roomType: 'Romtype må velges',
    mismatchDate: 'Datoene må komme i riktig rekkefølge',
    sameDate: 'Datoene kan ikke være like',
    genericError: 'Det er en feil i skjemaet, vennligst sjekk feltene.',
    initialRoomType: 'Vennligst velg et rom',
};

const BookingForm = () => {
    // States for romtype
    const [roomType,        setRoomType         ] = useState<string>('');
    const [roomTypeError,   setRoomTypeError    ] = useState<string | null>(ERROR_MESSAGES.initialRoomType);
    const [roomTypeTouched, setRoomTypeTouched  ] = useState<boolean>(false);

    // States for innsjekk
    const [startDate,       setStartDate        ] = useState<Dayjs | null>(null);
    const [startDateError,  setStartDateError   ] = useState<boolean>(false);

    // States for utsjekk
    const [endDate,         setEndDate          ] = useState<Dayjs | null>(null);
    const [endDateError,    setEndDateError     ] = useState<boolean>(false);
    
    // State for generelle feil
    const [genericError ,   setGenericError     ] = useState<string | null>(null);

    // Sjekk om skjemaet kan sendes
    const isFormValid = roomType !== '' && startDate !== null && endDate !== null && !startDateError && !endDateError && !genericError;

    // Generell feilmelding
    const genericErrorMessage =
        (genericError === 'mismatchDate'    && ERROR_MESSAGES.mismatchDate) ||
        (genericError === 'sameDate'        && ERROR_MESSAGES.sameDate) ||
        (genericError                       && ERROR_MESSAGES.genericError) ||
        '';

    // Når innsjekk endres
    const handleStartDateChange = (newDate: Dayjs | null) => {
        setStartDate(newDate);
        validateDates(newDate, endDate);
    };

    // Når utsjekk endres
    const handleEndDateChange = (newDate: Dayjs | null) => {
        setEndDate  (newDate);
        validateDates(startDate, newDate);
    };

    // Når feil oppstår/fjernes
    const handleDateError = (field: 'start' | 'end', error: boolean) => {
        if (field === 'start') {
            setStartDateError(error);
        } else if (field === 'end') {
            setEndDateError(error);
        }
        if (!error && !startDateError && !endDateError) {
            setGenericError(null);
        } else if (error) {
            setGenericError(ERROR_MESSAGES.genericError);
        }
    };

    // Når romtype endres
    const handleRoomTypeChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value as string;
        setRoomType(value);
        setRoomTypeTouched(true);
        value ? setRoomTypeError(null) : ERROR_MESSAGES.initialRoomType;
    };

    // Når man sender skjemaet
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        // dobbeltsjekk at romtypen er gyldig før innsending
        if (!validateRoomType()) {
            setGenericError(ERROR_MESSAGES.roomType);
            return;
        }
        // dobbeltsjekk at datoene er gyldig før innsending
        if (!validateDates(startDate, endDate)) {
            return;
        }
        // Ingen feilmeldinger registrert, fortsett med innsendelse
        const sendOffMessage = `Reservasjon: ${roomType}, Fra: ${startDate?.format('DD.MM.YYYY')}, Til: ${endDate?.format('DD.MM.YYYY')}`;
        // Litt direkte tilbakemelding, men har kommer API-kall senere
        console.log(sendOffMessage);
        alert(sendOffMessage);
    };

    // Sjekk at datoer kan godtaes
    const validateDates = (start: Dayjs | null, end: Dayjs | null) => {
        if (start && end) {
            // utsjekk må være etter innsjekk
            if (start.isSame(end)) {
                setGenericError('sameDate');
                return false;
            }
            if (start.add(1,'day').isAfter(end)) {
                setGenericError('mismatchDate');
                return false;
            }
        }
        setGenericError(null); // nullstill generell feilmelding
        console.log('genericError:',genericError);
        return true;
    };

    // Sjekk at romtypen kan godtaes
    const validateRoomType = () => {
        if (!roomType) {
            setRoomTypeError(ERROR_MESSAGES.initialRoomType);
            return false;
        }
        setRoomTypeError(null);
        return true;
    };

    // Props her for å gjøre JSX litt mer oversiktlig
    const boxProps = {
        margin: 'normal',
        sx: {
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column'
        },
    };
    const roomTypeSelectorProps = {
        roomType: roomType,
        roomTypeError: roomTypeError,
        touched: roomTypeTouched,
        onRoomTypeChange: handleRoomTypeChange,
    };
    const commonProps = {
        disablePast: true,
        maxDate: MAX_DATE,
        sx: { marginBottom: 0, width: '100%' },
    };
    const startDatePickerProps = {
        label: 'Fra dato',
        value: startDate,
        onDateChange: handleStartDateChange,
        onDateError: (error:DateValidationError | null) => handleDateError('start', !!error),
        ...commonProps,
    };
    const endDatePickerProps = {
        label: 'Til dato',
        value: endDate,
        onDateChange: handleEndDateChange,
        onDateError: (error:DateValidationError | null) => handleDateError('end', !!error),
        ...commonProps,
    };
    const genericFormHelperProps = {
        id: 'generic-helper-text',
        sx: {
            color: 'error.main', 
            marginBottom: '8px', 
            width: '300px', 
            height: '15px', 
            padding: '0px', 
            display: 'inline-block', 
            visibility: genericErrorMessage ? 'visible' : 'hidden'
        },
    };
    const submitButtonProps = {
        disabled: !isFormValid,
        sx: {
            width: '100%'
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nb">
            <Box {...boxProps} >
            <form onSubmit={handleSubmit}>
                <RoomTypeSelector {...roomTypeSelectorProps} />        
                <CustomDatePicker {...startDatePickerProps} />
                <CustomDatePicker {...endDatePickerProps} />
                <FormHelperText {...genericFormHelperProps} >{genericErrorMessage}</FormHelperText>
                <Button {...submitButtonProps} variant="contained" type="submit" color="primary" >Bestill rom</Button>
            </form>
            </Box>
        </LocalizationProvider>
    );
};

export default BookingForm;