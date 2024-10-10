import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectChangeEvent } from '@mui/material';

interface RoomTypeSelectorProps {
  roomType: string;
  roomTypeError: string | null;
  touched: boolean;
  onRoomTypeChange: (event: SelectChangeEvent<string>) => void;
}

// Listen over romryper her
const ROOM_TYPES = [
  { value: '', label: 'Velg romtype', disabled: true, style: { fontStyle: 'italic' } },
  { value: 'enkeltrom', label: 'Enkeltrom' },
  { value: 'dobbeltrom', label: 'Dobbeltrom' },
  { value: 'familierom', label: 'Familierom' },
];

const RoomTypeSelector = ({ roomType, roomTypeError, touched, onRoomTypeChange }: RoomTypeSelectorProps) => {
    const isRoomType = (roomType !== '') ? true : false;
    const selectProps = {
        labelId: 'room-type-label',
        value: roomType,
        onChange: onRoomTypeChange,
        label: 'Romtype',
      };

    return (
    <FormControl fullWidth margin="normal" error={touched && !!roomTypeError}>
        <InputLabel id="room-type-label">Romtype</InputLabel>
        <Select variant='outlined' {...selectProps}>
        {ROOM_TYPES.map((item) => (
            <MenuItem key={item.value} value={item.value} disabled={item.disabled} style={item.style}>
                {item.label}
            </MenuItem>
        ))}
        </Select>
        <FormHelperText>{touched && roomTypeError ? roomTypeError : !isRoomType ? 'Vennligst velg et rom' : ''}</FormHelperText>
    </FormControl>
    );
};

export default RoomTypeSelector;