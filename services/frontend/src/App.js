import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CryptoProvider } from "./CryptoContext";
import Home from "./Home";
import Detail from "./Detail";

function App() {
    return (
        <CryptoProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/detail/:coin" element={<Detail />} />
                </Routes>
            </Router>
        </CryptoProvider>
    );
}

export default App;
