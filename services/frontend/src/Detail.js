import { Typography } from "@mui/material";
import NavBar from "./NavBar";
import { useParams } from "react-router";
import News from "./News";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { LineChart } from "@mui/x-charts/LineChart";
import { useCrypto, dateRange } from "./CryptoContext";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

// function formatKey(key) {
//     return key
//         .replace(/_/g, " ") // Replace underscores with spaces
//         .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
// }

function formatNumericValue(value) {
    if (value === 0 || value === null || value === "N/A") return "Not Available";
    return `$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

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

function formatSupply(value) {
    if (value === 0 || value === null || value === "N/A") return "Not Available";
    return `${parseFloat(value).toLocaleString()} units`;
}

// Function to decimate data for better readability in the graph
function decimateData(xData, yData, rangeId) {
    let interval = 1;

    // Set decimation interval based on range
    if (rangeId === 0)
        interval = 1; // 1 week - show all points
    else if (rangeId === 1)
        interval = 7; // 1 month - every 7th point
    else if (rangeId === 2)
        interval = 7; // 3 months - every 7th point
    else if (rangeId === 3) interval = 30; // 1 year - every 30th point

    // Reduce the data points
    const filteredX = xData.filter((_, index) => index % interval === 0);
    const filteredY = yData.filter((_, index) => index % interval === 0);

    return { filteredX, filteredY };
}

export default function Detail() {
    let { coin } = useParams();
    const { cryptoDetail } = useCrypto();
    const [date, setDate] = useState(0); // not same as those in CryptoContext.js
    const [showData, setShowData] = useState({ x: [0, 1], y: [0, 1] });
    const [coinIcon, setCoinIcon] = useState("");
    // Find the selected cryptocurrency details
    const priceInfo = cryptoDetail.find((crypto) => crypto.name.toLowerCase() === coin.toLowerCase());
    const today = dayjs();
    let startDay;

    if (date === 0) startDay = today.subtract(1, "month");
    else if (date === 1) startDay = today.subtract(3, "month");
    else if (date === 2) startDay = today.subtract(6, "month");
    else startDay = today.subtract(1, "year");

    const startDayString = startDay.format("YYYY-MM-DD");
    const overall = Number(dayjs().diff(startDay.startOf("day"), "second"));
    function computeX(priceData) {
        return priceData.map((e) => {
            return (overall - Number(dayjs().diff(dayjs(e.timestamp), "second"))) / 86400;
        });
    }

    useEffect(() => {
        async function fetchData() {
            let priceData = await fetch(`http://localhost:8000/api/coin?name=${coin}&start_date=${startDayString}`);
            priceData = await priceData.json();
            priceData.sort((a, b) => {
                if (dayjs(a.timestamp).isBefore(dayjs(b.timestamp))) {
                    return -1;
                } else {
                    return 1;
                }
            });
            const x = computeX(priceData);
            const y = priceData.map((e) => {
                let temp = e["price"];
                return Number(temp);
            });
            setShowData({ x, y });
        }
        fetchData();
    }, [coin, startDayString]); // Ignore this warning

    useEffect(() => {
        async function fetchCoinIcon() {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.toLowerCase()}`);
                if (!response.ok) throw new Error("Failed to fetch coin icon");
                const data = await response.json();
                setCoinIcon(data.image?.thumb || ""); // Use the thumbnail from the response
            } catch (error) {
                console.error("Error fetching coin icon:", error);
            }
        }

        fetchCoinIcon();
    }, [coin]);

    if (!priceInfo) {
        return (
            <>
                <NavBar />
                <Typography variant="h5" color="error" align="center" style={{ marginTop: "20px" }}>
                    Error: Cryptocurrency details not found for {coin}
                </Typography>
            </>
        );
    }

    // Decimate data for better readability
    const { filteredX, filteredY } = decimateData(showData.x, showData.y, date);
    console.log(filteredX);
    const formatter = (value) => today.subtract(overall - value.toFixed(0) * 86400, "second").format("MM-DD-YYYY");

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div style={{ height: "7%", width: "100%" }}>
                <NavBar />
            </div>
            <div
                style={{
                    display: "flex",
                    height: "93%",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        width: "45%",
                        padding: "0 30px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", marginTop: "24px" }}>
                            {coinIcon && (
                                <img
                                    src={coinIcon}
                                    alt={`${coin} icon`}
                                    style={{ width: "30px", height: "30px", marginRight: "10px" }}
                                />
                            )}
                            <Typography variant="h5" style={{ fontWeight: "bold" }}>
                                Details for {coin}
                            </Typography>
                        </div>
                        <TableContainer component={Paper}>
                            <Table aria-label="crypto details">
                                <TableBody>
                                    {/* Current Price */}
                                    {priceInfo?.price?.price !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                Current Price
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatLargeNumber(priceInfo?.price?.price)} USD
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Percent Change (24h) */}
                                    {priceInfo?.price?.percent_change_24h !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                Percent Change (24h)
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatPercentChangeWithArrow(priceInfo?.price?.percent_change_24h)}
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Fully Diluted Market Cap */}
                                    {priceInfo?.price?.fully_diluted_market_cap !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                Fully Diluted Market Cap
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatLargeNumber(priceInfo?.price?.fully_diluted_market_cap)} USD
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Circulating Supply */}
                                    {priceInfo?.price?.circulating_supply !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                Circulating Supply
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatLargeNumber(priceInfo?.price?.circulating_supply)} units
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Total Supply */}
                                    {priceInfo?.price?.total_supply !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                Total Supply
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatLargeNumber(priceInfo?.price?.total_supply)} units
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* 24 Hour Volume */}
                                    {priceInfo?.price?.["24_hour_volume"] !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                24 Hour Volume
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatLargeNumber(priceInfo?.price?.["24_hour_volume"])} USD
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Volume Change (24h) */}
                                    {priceInfo?.price?.volume_change_24h !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                Volume Change (24h)
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatPercentChangeWithArrow(priceInfo?.price?.volume_change_24h)}
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Timestamp */}
                                    {priceInfo?.price?.timestamp !== "N/A" && (
                                        <TableRow>
                                            <TableCell style={{ fontWeight: "bold" }} align="left">
                                                Last Updated
                                            </TableCell>
                                            <TableCell align="right">
                                                {new Date(priceInfo.price.timestamp).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div style={{ width: "100%" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "24px",
                            }}
                        >
                            <Typography variant="h6" align="left" style={{ fontWeight: "bold" }}>
                                Price Trend Graph
                            </Typography>
                            <Box sx={{ width: 120 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="date-select-label">Date Range</InputLabel>
                                    <Select
                                        labelId="date-select-label"
                                        id="date-select"
                                        value={date}
                                        label="Date Range"
                                        onChange={(e) => setDate(e.target.value)}
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
                        <Paper
                            elevation={3}
                            style={{
                                width: "100%",
                                padding: "18px 0",
                                marginTop: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <LineChart
                                xAxis={[{ data: filteredX, label: "Dates", valueFormatter: formatter }]}
                                series={[
                                    {
                                        data: filteredY,
                                        label: "Price (USD)",
                                    },
                                ]}
                                style={{
                                    width: "90%",
                                    marginLeft: "20px",
                                }}
                                height={300}
                            />
                        </Paper>
                    </div>
                </div>
                <News size={5} coin={coin} />
            </div>
        </div>
    );
}
