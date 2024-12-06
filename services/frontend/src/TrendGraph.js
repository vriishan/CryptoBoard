import * as React from "react";
import { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Controller from "./Controller";
import dayjs from "dayjs";
import { useCrypto } from "./CryptoContext";

export default function TrendGraph() {
    const { cryptoDetail, date } = useCrypto(); // Get selected coins and date range
    const [trendData, setTrendData] = useState([]); // Manage trend data locally
    const [loading, setLoading] = useState(true); // Local loading state

    useEffect(() => {
        const today = dayjs();
        let startDay;

        if (date === 0) startDay = today.subtract(1, "month");
        else if (date === 1) startDay = today.subtract(3, "month");
        else if (date === 2) startDay = today.subtract(6, "month");
        else startDay = today.subtract(1, "year");

        const startDayString = startDay.format("YYYY-MM-DD");
        const totalDays = today.diff(startDay, "day");

        // Function to fetch trend data for a specific coin
        async function fetchTrend(coin) {
            try {
                const trendResult = await fetch(
                    `http://localhost:8000/api/trend?name=${coin}&start_date=${startDayString}`
                ).then((res) => res.json());

                const trend = Array(totalDays + 1).fill(null);
                trendResult.forEach((entry) => {
                    const dateIndex = today.diff(dayjs(entry.date), "day");
                    trend[totalDays - dateIndex] = entry.article_count;
                });

                return { coin, trend };
            } catch (error) {
                console.error(`Error fetching trend data for ${coin}:`, error);
                return { coin, trend: [] };
            }
        }

        async function fetchAllTrends() {
            setLoading(true);
            const selectedCoins = cryptoDetail.filter((c) => c.selected).map((c) => c.name);
            const allTrends = await Promise.all(selectedCoins.map(fetchTrend));
            setTrendData(allTrends);
            setLoading(false);
        }

        fetchAllTrends();
    }, [cryptoDetail, date]); // Rerun when selected coins or date range changes

    const today = dayjs();
    let startDay;
    if (date === 0) startDay = today.subtract(1, "month");
    else if (date === 1) startDay = today.subtract(3, "month");
    else if (date === 2) startDay = today.subtract(6, "month");
    else startDay = today.subtract(1, "year");

    const xAxis = Array(today.diff(startDay, "day") + 1)
        .fill(0)
        .map((_, i) => i);
    const formatter = (value) => today.subtract(xAxis.length - 1 - value, "day").format("MM-DD-YYYY");

    const adjustedTrendData = trendData.map(({ coin, trend }) => {
        const adjustedTrend = trend.slice(0, xAxis.length); // Match length with xAxis
        return { coin, trend: adjustedTrend };
    });

    if (loading) {
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
                <Controller />
                <Paper
                    elevation={3}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <div style={{ textAlign: "center", margin: "20px" }}>
                        <CircularProgress />
                        <p>Loading trend data...</p>
                    </div>
                </Paper>
            </div>
        );
    }

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
            <Controller />
            <Paper
                elevation={3}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <LineChart
                    xAxis={[{ data: xAxis, label: "Dates", valueFormatter: formatter }]}
                    series={adjustedTrendData.map(({ coin, trend }) => ({
                        data: trend,
                        label: coin,
                        connectNulls: true,
                    }))}
                    height={350}
                    style={{
                        marginTop: "30px",
                        marginBottom: "20px",
                    }}
                />
            </Paper>
        </div>
    );
}
