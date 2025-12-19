import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SpreadsheetView from "@/pages/SpreadsheetView";
import "@/App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/spreadsheet" element={<SpreadsheetView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;