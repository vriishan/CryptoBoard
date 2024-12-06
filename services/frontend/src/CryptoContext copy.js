import React, { createContext, useContext, useState, useEffect } from "react";
import dayjs from "dayjs";
const CryptoContext = createContext();

const coins = ["Bitcoin", "Ethereum", "Dogecoin"];

const initCryptoDetail = [
    {
        id: 0,
        name: "Bitcoin",
        symbol: "BTC",
        selected: true,
        price: {
            percent_change_24h: 0,
            price: 0,
            fully_diluted_market_cap: 0,
            circulating_supply: 0,
            total_supply: 0,
            "24_hour_volume": 0,
            volume_change_24h: 0,
            timestamp: "N/A",
        },
        trend: Array(dayjs().diff(dayjs().subtract(1, "month"), "day") + 1).fill(null),
    },
    {
        id: 1,
        name: "Ethereum",
        symbol: "ETH",
        selected: true,
        price: {
            percent_change_24h: 0,
            price: 0,
            fully_diluted_market_cap: 0,
            circulating_supply: 0,
            total_supply: 0,
            "24_hour_volume": 0,
            volume_change_24h: 0,
            timestamp: "N/A",
        },
        trend: Array(dayjs().diff(dayjs().subtract(1, "month"), "day") + 1).fill(null),
    },
    {
        id: 2,
        name: "Dogecoin",
        symbol: "DOGE",
        selected: true,
        price: {
            percent_change_24h: 0,
            price: 0,
            fully_diluted_market_cap: 0,
            circulating_supply: 0,
            total_supply: 0,
            "24_hour_volume": 0,
            volume_change_24h: 0,
            timestamp: "N/A",
        },
        trend: Array(dayjs().diff(dayjs().subtract(1, "month"), "day") + 1).fill(null),
    },
];

const dateRange = [
    { dateId: 0, range: "1 month" },
    { dateId: 1, range: "3 months" },
    { dateId: 2, range: "6 months" },
    { dateId: 3, range: "1 year" },
];
const mediaSource = [
    { sourceId: 0, source: "All" },
    { sourceId: 1, source: "coindesk.com" },
    { sourceId: 2, source: "cointelegraph.com" },
    { sourceId: 3, source: "news.bitcoin.com" },
    { sourceId: 4, source: "cryptopotato.com" },
    { sourceId: 5, source: "medium.com" },
];

function infinityCharCheck(value) {
    return value === "∞" ? "N/A" : value;
}

function CryptoProvider({ children }) {
    const [cryptoDetail, setCryptoDetail] = useState(initCryptoDetail);
    const [date, setDate] = useState(0);
    const [source, setSource] = useState(0);
    const [news, setNews] = useState([]);

    useEffect(() => {
        async function fetchPrices() {
            try {
                const response = await fetch("http://localhost:8000/api/coin");
                if (!response.ok) {
                    throw new Error("Failed to fetch prices");
                }
                const priceData = await response.json();

                const updatedCryptoDetail = cryptoDetail.map((crypto) => {
                    const latestData = priceData
                        .filter((item) => item.coin.toLowerCase() === crypto.name.toLowerCase())
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

                    if (latestData) {
                        return {
                            ...crypto,
                            price: {
                                percent_change_24h: infinityCharCheck(latestData["percent_change_24h"]),
                                price: infinityCharCheck(latestData["price"]),
                                fully_diluted_market_cap: infinityCharCheck(latestData["fully_diluted_market_cap"]),
                                circulating_supply: infinityCharCheck(latestData["circulating_supply"]),
                                total_supply: infinityCharCheck(latestData["total_supply"]),
                                "24_hour_volume": infinityCharCheck(latestData["24_hour_volume"]),
                                volume_change_24h: infinityCharCheck(latestData["volume_change_24h"]),
                                timestamp: infinityCharCheck(latestData["timestamp"]),
                            },
                        };
                    }
                    return crypto;
                });

                setCryptoDetail(updatedCryptoDetail);
            } catch (error) {
                console.error("Error fetching prices:", error);
            }
        }

        fetchPrices();
    }, []); // Ignore this warning

    useEffect(() => {
        async function fetchNews() {
            try {
                const response = await fetch("http://localhost:8000/api/article");
                if (!response.ok) {
                    throw new Error("Failed to fetch news");
                }
                const newsData = await response.json();
                setNews(newsData);
            } catch (error) {
                console.error("Error fetching news:", error);
            }
        }

        fetchNews();
    }, []);

    useEffect(() => {
        const today = dayjs();
        let startDay;
        if (date === 0) {
            startDay = today.subtract(1, "month");
        } else if (date === 1) {
            startDay = today.subtract(3, "month");
        } else if (date === 2) {
            startDay = today.subtract(6, "month");
        } else {
            startDay = today.subtract(1, "year");
        }
        const startDayString = startDay.format("YYYY-MM-DD");
        console.log("DEBUG:useEffect rerun");
        function computeX(res) {
            const overall = today.diff(startDay, "day");
            return res.map((e) => overall - Number(today.diff(dayjs(e.date), "day")));
        }
        async function fetchTrend(coin) {
            let trendResult = await fetch(`http://localhost:8000/api/trend?name=${coin}&start_date=${startDayString}`);
            trendResult = await trendResult.json();
            trendResult = trendResult.sort((a, b) => {
                if (dayjs(a.date).isBefore(dayjs(b.date))) {
                    return -1;
                } else {
                    return 1;
                }
            });
            let dateHasValue = computeX(trendResult);
            let x = Array(today.diff(startDay, "day") + 1);
            let newTrend = Array(x.length);
            for (let i = 0; i < x.length; i++) {
                newTrend[i] = null;
            }
            for (let i = 0; i < dateHasValue.length; i++) {
                const temp = dateHasValue[i];
                newTrend[temp] = trendResult[i]["article_count"];
            }
            setCryptoDetail((old) => {
                return old.map((crypto) => {
                    if (crypto.name !== coin) {
                        return { ...crypto };
                    } else {
                        return {
                            ...crypto,
                            trend: newTrend,
                        };
                    }
                });
            });
        }
        Promise.all(coins.map((coin) => fetchTrend(coin)));
    }, [date]);

    const setSelected = (id, isSelected) => {
        setCryptoDetail((prevDetail) =>
            prevDetail.map((crypto) => (crypto.id === id ? { ...crypto, selected: isSelected } : crypto))
        );
    };

    return (
        <CryptoContext.Provider
            value={{
                cryptoDetail,
                setCryptoDetail,
                date,
                setDate,
                source,
                setSource,
                news,
                setNews,
                setSelected, // Add setSelected to the context value
            }}
        >
            {children}
        </CryptoContext.Provider>
    );
}

function useCrypto() {
    const value = useContext(CryptoContext);
    if (value === undefined) {
        throw new Error("Context out of scope");
    }
    return value;
}

export { useCrypto, CryptoProvider, dateRange, mediaSource };
