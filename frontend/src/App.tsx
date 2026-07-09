import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/film/:id" element={<MoviePage />} />
    </Routes>
  );
}

export default App;
