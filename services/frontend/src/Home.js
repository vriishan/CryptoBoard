import CryptoList from "./CryptoList";
import News from "./News";
import TrendGraph from "./TrendGraph";
import NavBar from "./NavBar";

function App() {
    return (
        <div className="App" style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            <div style={{ height: "7%", width: "100%" }}>
                <NavBar />
            </div>
            <div style={{ display: "flex", justifyContent: "center", height: "93%", width: "100%" }}>
                <div style={{ width: "45%", display: "flex", flexDirection: "column" }}>
                    <CryptoList />
                    <TrendGraph />
                </div>
                <News size={7} />
            </div>
        </div>
    );
}

export default App;
