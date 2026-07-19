import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";

interface CustomAutocompleteProps {
    options: (string | { label: string; value: any })[]; // Options can be strings or objects with `label` and `value`
    label: string;
    placeholder: string;
    value?: string | { label: string; value: any } | null;
    multiple?: boolean; // Add a multiple flag for multi-selection
    onChange: (
        newValue: string | { label: string; value: any } | string[] | null
    ) => void;
}

const CustomAutocomplete: React.FC<CustomAutocompleteProps> = ({
                                                                   options,
                                                                   label,
                                                                   placeholder,
                                                                   value,
                                                                   onChange,
                                                               }) => {
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (typeof value === "string") {
            setInputValue(value);
        } else if (value && typeof value === "object" && "label" in value) {
            setInputValue(value.label);
        } else {
            setInputValue("");
        }
    }, [value]);

    return (
        <Autocomplete
            options={options}
            freeSolo
            ListboxProps={{
                style: {
                    maxHeight: 4 * 48, // Limit to 4 items (48px is the default item height)
                    overflow: "auto",
                },
            }}
            getOptionLabel={(option) =>
                typeof option === "string"
                    ? option
                    : option && typeof option === "object" && "label" in option
                        ? option.label
                        : ""
            }
            value={value || null}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(event, newValue) => {
                if (newValue === null || newValue === undefined) {
                    onChange(null);
                } else if (typeof newValue === "string") {
                    onChange(newValue);
                } else {
                    onChange(newValue || null);
                }
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    variant="outlined"
                    sx={{
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": {
                                borderColor: "#d1d5db",
                                borderWidth: "1px",
                            },
                            "&:hover fieldset": {
                                borderColor: "#bdbdbd",
                                borderWidth: "1.5px",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#3b82f6",
                                borderWidth: "2px",
                            },
                        },
                    }}
                />
            )}
        />
    );
};

export default CustomAutocomplete;
