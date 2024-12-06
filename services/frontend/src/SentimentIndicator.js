import React from "react";
import "./SentimentIndicator.css";
import GaugeChart from "react-gauge-chart";

const SentimentGauge = ({ sentimentValue, normalizedValue, label, description, colors }) => {
    return (
        <div className="sentiment-gauge">
            <div className="sentiment-gauge-chart">
                <GaugeChart
                    id={`gauge-${label}`}
                    nrOfLevels={20}
                    arcsLength={[0.3, 0.3, 0.3]}
                    colors={colors}
                    percent={normalizedValue}
                    arcPadding={0.02}
                    needleColor="#464A4F"
                    needleBaseColor="#464A4F"
                    textColor="#000000"
                    hideText="true"
                />
                <p
                    style={{
                        color: sentimentValue > 0 ? "green" : sentimentValue < 0 ? "red" : "gold",
                        textAlign: "center",
                        fontSize: "24px",
                    }}
                >
                    {sentimentValue >= 0 ? `${sentimentValue.toFixed(4)}` : `${sentimentValue.toFixed(4)}`}
                </p>
            </div>

            <div className="sentiment-description">
                <h4>{label}</h4>
                <p>{description}</p>
            </div>
        </div>
    );
};

const getSentimentDescription = (sentiment) => {
    if (sentiment >= -1 && sentiment < -0.5) {
        return "The sentiment is strongly negative, indicating pessimism or bearish views.";
    } else if (sentiment >= -0.5 && sentiment < 0) {
        return "The sentiment is slightly negative, showing mild concerns or cautious attitudes.";
    } else if (sentiment >= 0 && sentiment < 0.5) {
        return "The sentiment is slightly positive, reflecting some optimism or bullish tendencies.";
    } else if (sentiment >= 0.5 && sentiment <= 1) {
        return "The sentiment is strongly positive, signaling high optimism or confidence in the market.";
    }
    return "No sentiment data available.";
};

const getSubjectivityDescription = (subjectivity) => {
    if (subjectivity >= 0 && subjectivity < 0.25) {
        return "The content is highly objective, with little personal bias or opinion.";
    } else if (subjectivity >= 0.25 && subjectivity < 0.5) {
        return "The content is mostly objective, but with some subjective elements.";
    } else if (subjectivity >= 0.5 && subjectivity < 0.75) {
        return "The content is somewhat subjective, mixing opinions with facts.";
    } else if (subjectivity >= 0.75 && subjectivity <= 1) {
        return "The content is highly subjective, reflecting personal opinions or emotions.";
    }
    return "No subjectivity data available.";
};

const SentimentIndicator = ({ coin, sentiment, subjectivity }) => {
    const normalizedSentiment = (sentiment + 1) / 2; // Range from -1 to 1 -> 0 to 1 for sentiment score

    return (
        <div className="sentiment-indicator">
            <SentimentGauge
                sentimentValue={sentiment}
                normalizedValue={normalizedSentiment}
                label="Sentiment"
                colors={["#FF5F6D", "#FFC371", "#61DA56"]}
                description={getSentimentDescription(sentiment)}
            />

            <SentimentGauge
                sentimentValue={subjectivity}
                normalizedValue={subjectivity}
                colors={["#002f5e", "#4d8cff"]}
                label="Subjectivity"
                description={getSubjectivityDescription(subjectivity)}
            />
        </div>
    );
};

export default SentimentIndicator;
