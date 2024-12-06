import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useCrypto } from "./CryptoContext";

// Formatting functions
function formatLargeNumber(value) {
    if (value === 0 || value === null || value === "N/A") return "Not Available";
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`; // Trillions
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`; // Billions
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`; // Millions
    return `${value.toLocaleString()}`; // Thousands or less
}

function formatPercentChangeWithArrow(value) {
    if (value === 0 || value === null || value === "N/A") return null;

    const formattedValue = `${parseFloat(value).toFixed(2)}%`;
    const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "";
    const arrowColor = value > 0 ? "green" : value < 0 ? "red" : "black";

    return (
        <span style={{ color: arrowColor, fontWeight: "bold" }}>
            {arrow} {formattedValue}
        </span>
    );
}

export default function BasicTable() {
    const { cryptoDetail, setSelected } = useCrypto(); // Use setSelected from context

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 20px",
            }}
        >
            <div style={{ width: "100%" }}>
                <Typography variant="h5" align="left" sx={{ mt: 3, mb: 3, fontWeight: "bold" }}>
                    Crypto-Coins
                </Typography>
            </div>
            <TableContainer component={Paper} sx={{ width: "100%", minWidth: 650 }}>
                <Table sx={{ minWidth: 650 }} aria-label="crypto table">
                    <TableHead>
                        <TableRow style={{ backgroundColor: "lightgrey" }}>
                            <TableCell style={{ fontWeight: "bold" }} align="center">
                                Name
                            </TableCell>
                            <TableCell style={{ fontWeight: "bold" }} align="center">
                                Price
                            </TableCell>
                            <TableCell style={{ fontWeight: "bold" }} align="center">
                                % Change (24Hrs)
                            </TableCell>
                            <TableCell style={{ fontWeight: "bold" }} align="center">
                                Selected
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cryptoDetail.map((row) => (
                            <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                {/* Name */}
                                <TableCell component="th" scope="row" align="center">
                                    <Link to={`/detail/${row.name}`} style={{ textDecoration: "none" }}>
                                        {`${row.name} (${row.symbol})`}
                                    </Link>
                                </TableCell>

                                {/* Price */}
                                <TableCell align="center">{formatLargeNumber(row.price["price"])} USD</TableCell>

                                {/* % Change */}
                                <TableCell align="center">
                                    {formatPercentChangeWithArrow(row.price["percent_change_24h"])}
                                </TableCell>

                                {/* Selected Switch */}
                                <TableCell align="center">
                                    <Switch
                                        checked={row.selected}
                                        onChange={() => {
                                            setSelected(row.id, !row.selected);
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
