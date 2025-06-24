import { Routes, Route } from "react-router-dom";
import Dictionary from "../pages/Dictionary";
import DictionaryDetail from "../pages/DictionaryDetail";

const DictionaryRoutes = () => (
  <Routes>
    <Route path="" element={<Dictionary />} />
    <Route path=":signId" element={<DictionaryDetail />} />
  </Routes>
);

export default DictionaryRoutes;
