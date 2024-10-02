'use client';
import React, { useState } from 'react';
import { TextField, Button, MenuItem, FormControl, InputLabel, Select, TextFieldProps, SelectChangeEvent } from '@mui/material';
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
    const [roomType,    setRoomType ] = useState<string>('');
    const [startDate,   setStartDate] = useState<Dayjs | null>(null);
    const [endDate,     setEndDate  ] = useState<Dayjs | null>(null);
    const [error,       setError    ] = React.useState<DateValidationError | null>(null);

    // Datepicker input oppdatering med forsinkelse
    // Tastetrykk: Vi oppdaterer hvis tastene står urørt i 0.5 sek
    // Museklikk: State change kan føre til flickering av datapicker popper, men 0.5 sek fjerner det.
    const updatedStartDate  = useDebounce(startDate,    500);
    const updatedEndDate    = useDebounce(endDate,      500);
    const updatedError      = useDebounce(error,        500);

    const handleRoomTypeChange  = (e: SelectChangeEvent<string>)        => { setRoomType    (e.target.value as string); };
    const handleStartDateChange = (newDate: Dayjs | null)               => { setStartDate   (newDate);                  };
    const handleEndDateChange   = (newDate: Dayjs | null)               => { setEndDate     (newDate);                  };
    const handleOnError         = (error: DateValidationError)          => { setError       (error);                    };
    const errorMessage = React.useMemo(() => {
        switch (updatedError) {
          case 'maxDate':
          case 'minDate':       { return 'Vennligst velg en dato innen det siste året';   }
          case 'invalidDate':   { return 'Datoen er ikke gyldig';                         }
          default:              { return '';                                              }
        }
      }, [updatedError]);
  
  
    // Definer litt felles props, men kun oppdatere når feil oppstår
    const commonSlots = React.useMemo(() => ({
        slots:      { textField: ( textFieldProps:  ( TextFieldProps )) => <CustomTextField {...textFieldProps} />,},
        slotProps:  { textField: { InputLabelProps: { shrink: true   },     helperText:         errorMessage}     ,},
        disablePast: true,
        maxDate: MAX_DATE,
        onError: handleOnError,
    }), [errorMessage]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('updatedError:',updatedError);
        if (updatedError !== null) return; // Stopp her hvis det noe som er feil
        
        // Ingen feilmeldinger registrert, værsågod fortsett med "innsendelse"
        const sendOffMessage = `Booking: ${roomType}, Fra: ${startDate?.format('DD.MM.YYYY')}, Til: ${endDate?.format('DD.MM.YYYY')}`;
        console.log(sendOffMessage);
        alert(sendOffMessage);
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
                    <Select onChange={handleRoomTypeChange} label={"Romtype"} variant="outlined" labelId="room-type-label" value={roomType} required >
                        {roomTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value} disabled={type.disabled} style={type.style}>{type.label}</MenuItem>
                        ))}
                    </Select>
                    <DatePicker onChange={handleStartDateChange} label="Fra dato" value={updatedStartDate} {...commonSlots} />
                    <DatePicker onChange={handleEndDateChange} label="Til dato" value={updatedEndDate} {...commonSlots} />
                    <Button type="submit" variant="contained" color="primary">Bestill rom</Button>
                </FormControl>
            </form>
        </LocalizationProvider>
    );
};

export default BookingForm;