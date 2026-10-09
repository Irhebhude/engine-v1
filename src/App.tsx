import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchResults from "./pages/SearchResults";
function App(){ return (<BrowserRouter><Routes><Route path="/" element={<SearchResults />} /><Route path="/search" element={<SearchResults />} /><Route path="*" element={<SearchResults />} /></Routes></BrowserRouter>); }
export default App;
