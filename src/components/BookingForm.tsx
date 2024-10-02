'use client';
import React, { useState } from 'react';
import { TextField, Button, MenuItem, FormControl, InputLabel, Select, TextFieldProps, SelectChangeEvent, FormHelperText } from '@mui/material';
import { DatePicker, LocalizationProvider, DateValidationError } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs , { Dayjs } from 'dayjs';
import 'dayjs/locale/nb';
import useDebounce from '../app/hooks/useDebounce';

const CustomTextField = (props: TextFieldProps) => (
    <TextField {...props} fullWidth margin="normal" required />
);

const MAX_DATE = dayjs().add(364, 'day'); // Kan maks bestille hotell 364 dager fremover i tid

const BookingForm: React.FC = () => {
    // STATE HANDLING OG DEBOUNCING
    // Debounce i denne sammenhengen:
    //      Datepicker input oppdatering med forsinkelse
    //      Tastetrykk: Vi oppdaterer hvis tastene står urørt i 0.5 sek
    //      Museklikk: State change kan føre til flickering av datapicker popper, men 0.5 sek fjerner det.
    // Notat # her kunne jeg med fordel ha brukt et state handling library
    const delay = 500;
    const [roomType,        setRoomType       ] = useState<string>('');
    const [startDate,       setStartDate      ] = useState<Dayjs | null>(null);
    const [endDate,         setEndDate        ] = useState<Dayjs | null>(null);

    const [startDateError,  setStartDateError ] = useState<DateValidationError | null>(null);
    const [endDateError,    setEndDateError   ] = useState<DateValidationError | null>(null);
    const [genericError ,   setGenericError   ] = useState<string | null>(null);

    const updatedStartDate                      = useDebounce(startDate,        delay);
    const updatedStartDateError                 = useDebounce(startDateError,   delay);
    const updatedEndDate                        = useDebounce(endDate,          delay);
    const updatedEndDateError                   = useDebounce(endDateError,     delay);
    const updatedGenericError                   = useDebounce(genericError,     delay);

    const handleStartDateChange     = (newDate:         Dayjs | null)               => { setStartDate(newDate);                 validateDates(newDate, updatedEndDate);                 };
    const handleEndDateChange       = (newDate:         Dayjs | null)               => { setEndDate  (newDate);                 validateDates(updatedStartDate, newDate);               };
    const handleRoomTypeChange      = (e:               SelectChangeEvent<string>)  => { setRoomType(e.target.value as string);                                                         };
    const handleOnStartDateError    = (startDateError:  DateValidationError)        => { setStartDateError(startDateError);     return (startDateError)    ? setGenericError('startDateError') : validateDates(updatedStartDate, updatedEndDate); };
    const handleOnEndDateError      = (endDateError:    DateValidationError)        => { setEndDateError(endDateError)    ;     return (endDateError)      ? setGenericError('endDateError')   : validateDates(updatedStartDate, updatedEndDate); };

    const isFormValid = React.useMemo(() => {
        return (
          roomType !== '' && 
          updatedStartDate !== null && 
          updatedEndDate !== null && 
          !updatedGenericError
        );
    }, [roomType, updatedStartDate, updatedEndDate, updatedGenericError]);

    const getDateErrorMessage = (error: DateValidationError | null | string, label: string) => {
        switch (error) {
            case 'maxDate':
            case 'minDate':       return `${label} må være innenfor det siste året`;
            case 'invalidDate':   return `Ugyldig ${label.toLowerCase()}`;
            case 'mismatchDate':  return `${label} må komme i riktig rekkefølge`;
            case 'sameDate':      return `${label} kan ikke være like`;
            default:              return '';
        }
    };

    // Generelle feilmeldinger
    const genericErrorMessage = React.useMemo(() => {
        if      (updatedGenericError === 'mismatchDate' ||
                 updatedGenericError === 'sameDate'         )   {  return getDateErrorMessage(updatedGenericError, 'Datoene');    }
        else if (updatedGenericError)                           {  return 'Det er en feil i skjemaet, vennligst sjekk feltene.';  }
        return '';
    }, [updatedGenericError]);  

    // Startdato feilmeldinger
    const startDateErrorMessage = React.useMemo(() => {
        return getDateErrorMessage(updatedStartDateError, 'Startdato');
    }, [updatedStartDateError]);

    // Sluttdato feilmeldinger
    const endDateErrorMessage = React.useMemo(() => {
        return getDateErrorMessage(updatedEndDateError, 'Sluttdato');
    }, [updatedEndDateError]);

    // Definer litt felles props, men kun oppdatere når feil oppstår
    const commonSlots = React.useMemo(() => ({
        slots:      { textField: ( textFieldProps:  ( TextFieldProps )) => <CustomTextField {...textFieldProps} />,},
        slotProps:  { textField: { InputLabelProps: { shrink: true   },},},
        disablePast: true,
        maxDate: MAX_DATE,
    }), [startDateErrorMessage,endDateErrorMessage]);

    // Definer spesifikke props for fra date
    const startDateProps = {
        label: 'Fra dato',
        value: updatedStartDate,
        onChange: handleStartDateChange,
        onError: handleOnStartDateError,
        slotProps: { textField: { helperText: startDateErrorMessage || '' },},
    };
    
    // Definer spesifikke props for til dato
    const endDateProps = {
        label: 'Til dato',
        value: updatedEndDate,
        onChange: handleEndDateChange,
        onError: handleOnEndDateError,
        slotProps: { textField: { helperText: endDateErrorMessage || '' },},
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Validere datoer: Innsjekk før utsjekk
        if (!validateDates(updatedStartDate, updatedEndDate)) {
            return;
        }
        
        // Ingen feilmeldinger registrert, fortsett med "innsendelse"
        const sendOffMessage = `Reservasjon: ${roomType}, Fra: ${startDate?.format('DD.MM.YYYY')}, Til: ${endDate?.format('DD.MM.YYYY')}`;
        console.log(sendOffMessage);
        alert(sendOffMessage);
    };

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
        return true;
    };

    const roomTypes = [
        { value: '',            label: 'Velg romtype', disabled: true, style: { fontStyle: 'italic' } },
        { value: 'enkeltrom',   label: 'Enkeltrom'  },
        { value: 'dobbeltrom',  label: 'Dobbeltrom' },
        { value: 'familierom',  label: 'Familierom' },
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nb">
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="room-type-label">Romtype</InputLabel>
                    <Select onChange={handleRoomTypeChange} label={"Romtype"} variant="outlined" labelId="room-type-label" value={roomType} >
                        {roomTypes.map((room) => (
                            <MenuItem key={room.value} value={room.value} disabled={room.disabled} style={room.style}>{room.label}</MenuItem>
                        ))}
                    </Select>
                    {!roomType && 
                        <FormHelperText id="room-type-helper-text">Vennligst velg et rom</FormHelperText>
                    }
                    <DatePicker {...commonSlots} {...startDateProps}    />
                    <DatePicker {...commonSlots} {...endDateProps}      />
                    {genericErrorMessage && 
                        <FormHelperText id="generic-helper-text" sx={{ color: 'error.main' }}>{genericErrorMessage}</FormHelperText>
                    }
                    <Button type="submit" variant="contained" color="primary" disabled={!isFormValid}>Bestill rom</Button>
                </FormControl>
            </form>
        </LocalizationProvider>
    );
};

export default BookingForm;