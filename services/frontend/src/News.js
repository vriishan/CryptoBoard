import { Box, Link, Stack, Typography, Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SentimentIndicator from "./SentimentIndicator";

function shorten(message) {
    if (message && message.length > 200) {
        return message.slice(0, 200) + "...";
    } else {
        return message;
    }
}

function Article({ article }) {
    const date = new Date(article.timestamp).toDateString();
    return (
        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, border: "1px solid lightgrey", marginRight: "10px" }}>
            <Box>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="h6" sx={{ textOverflow: "clip", mx: 1, fontWeight: "bold" }}>
                        {article.title}
                    </Typography>
                    <Typography variant="body1">{date}</Typography>
                </div>
                <Typography variant="body2" sx={{ mx: 1, py: 1 }}>
                    {shorten(article.summary)}
                </Typography>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Link href={article.link} target="_blank" rel="noopener noreferrer">
                        <Typography variant="body2" sx={{ mx: 1 }}>
                            Read More
                        </Typography>
                    </Link>
                    {article.source ? (
                        <Typography variant="caption">{`(${article.source} for ${article.coin})`}</Typography>
                    ) : null}
                </div>
            </Box>
        </Paper>
    );
}

Article.propTypes = {
    article: PropTypes.object.isRequired,
};

export default function News({ size = 10, coin }) {
    const [allNews, setAllNews] = useState([]); // Store all articles
    const [latestNews, setLatestNews] = useState([]); // Current page articles
    const [sentiment, setSentiment] = useState([]);
    const [page, setPage] = useState(1); // Current page
    const articlesPerPage = size; // Articles per page

    useEffect(() => {
        let apiUrl = `http://localhost:8000/api/article/`;
        if (coin) {
            apiUrl += `?name=${encodeURIComponent(coin)}&`;
        }
        apiUrl += `?size=40`;
        // Fetch all articles
        async function fetchNews() {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error("Failed to fetch news");
                }
                const newsData = await response.json();
                setAllNews(newsData.filter((article) => article.title.toLowerCase() !== "no title")); // Store all articles
                setLatestNews(newsData.slice(0, articlesPerPage)); // Set first page articles
            } catch (error) {
                console.error("Error fetching news:", error);
            }
        }

        async function fetchSentiment() {
            try {
                const response = await fetch(`http://localhost:8000/api/sentiment`);
                if (!response.ok) {
                    throw new Error("Failed to fetch sentiment");
                }
                const sentimentData = await response.json();
                setSentiment(sentimentData);
            } catch (error) {
                console.error("Error fetching sentiment:", error);
            }
        }

        fetchNews();
        fetchSentiment();
    }, [coin]);

    // Update articles for the current page
    useEffect(() => {
        const startIndex = (page - 1) * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;
        setLatestNews(allNews.slice(startIndex, endIndex));
    }, [page, allNews, articlesPerPage]);

    const totalPages = Math.ceil(allNews.length / articlesPerPage);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "60%",
                minWidth: "60%",
            }}
        >
            {coin ? (
                <Typography variant="h5" sx={{ mt: 3, mb: 3, fontWeight: "bold" }}>
                    Polarity Scores (Based on Articles)
                </Typography>
            ) : null}
            {Array.isArray(sentiment) && sentiment.length > 0 && coin ? (
                <SentimentIndicator
                    coin={coin}
                    sentiment={parseFloat(sentiment.find((entry) => entry.coin === coin)?.AvgSentiment)}
                    subjectivity={parseFloat(sentiment.find((entry) => entry.coin === coin)?.AvgSubjectivity)}
                />
            ) : (
                ""
            )}
            <Typography variant="h5" sx={{ mt: 3, mb: 3, fontWeight: "bold" }}>
                Latest News {coin ? `on ${coin}` : "on All Coins"}
            </Typography>
            <div style={{ margin: "0 15px", overflowX: "hidden", overflowY: "scroll" }}>
                <Stack spacing={2}>
                    {latestNews.length !== 0 ? (
                        latestNews.map((article) => <Article key={article._id} article={article} />)
                    ) : (
                        <Typography variant="body2" sx={{ alignSelf: "center", color: "grey" }}>
                            No Articles Found!
                        </Typography>
                    )}
                </Stack>
            </div>
            {latestNews.length !== 0 ? (
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Button disabled={page === 1} onClick={() => setPage((prevPage) => prevPage - 1)}>
                        Previous
                    </Button>
                    <Typography variant="body2" sx={{ alignSelf: "center" }}>
                        Page {page} of {totalPages}
                    </Typography>
                    <Button disabled={page === totalPages} onClick={() => setPage((prevPage) => prevPage + 1)}>
                        Next
                    </Button>
                </Box>
            ) : null}
        </div>
    );
}

News.propTypes = {
    size: PropTypes.number,
    coin: PropTypes.string,
};
