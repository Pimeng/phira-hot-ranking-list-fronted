import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import LegendaryHall from "@/pages/LegendaryHall";
import ChartDetail from "@/pages/ChartDetail";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050507]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/legendary" element={<LegendaryHall />} />
        <Route path="/chart/:id" element={<ChartDetail />} />
      </Routes>
    </div>
  );
}
