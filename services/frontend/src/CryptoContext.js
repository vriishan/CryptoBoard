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
    const [date, setDate] = useState(0); // Selected date range
    const [source, setSource] = useState(0); // Selected news source
    const [news, setNews] = useState([]); // News data

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
    }, []); // Runs once on mount

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
                setSelected,
            }}
        >
            {children}
        </CryptoContext.Provider>
    );
}

function useCrypto() {
    const value = useContext(CryptoContext);
    if (value === undefined) {
        throw new Error("CryptoContext is not within scope");
    }
    return value;
}

export { useCrypto, CryptoProvider, dateRange, mediaSource };
