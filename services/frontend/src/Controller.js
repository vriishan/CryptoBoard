// https://mui.com/material-ui/react-select/
import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useCrypto, dateRange, mediaSource } from "./CryptoContext";
import { Typography } from "@mui/material";

export default function Controller() {
    const { date, setDate, source, setSource } = useCrypto();

    const handleChangeDate = (e) => {
        setDate(e.target.value);
    };

    const handleChangeSource = (e) => {
        setSource(e.target.value);
    };

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "20px",
                marginTop: "20px",
            }}
        >
            <div style={{ width: "100%" }}>
                <Typography variant="h5" align="left" sx={{ mt: 3, mb: 3, fontWeight: "bold" }}>
                    Articles Trend Graph
                </Typography>
            </div>
            <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                    <InputLabel id="date-select-label">Date Range</InputLabel>
                    <Select
                        labelId="date-select-label"
                        id="date-select"
                        value={date}
                        label="Date Range"
                        onChange={handleChangeDate}
                    >
                        {dateRange.map((d) => {
                            return (
                                <MenuItem value={d.dateId} key={d.dateId}>
                                    {d.range}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </Box>
        </div>
    );
}
