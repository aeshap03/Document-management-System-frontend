import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { useEffect, useState } from "react";

function App() {
  const ApiDom = "http://localhost:7000";

  // const re = new RegExp("^[0-9]+$");
  // const dom = window.location.host.split(".")[0];
  // console.log(!dom.includes("localhost") && !dom.match(re));

  // const [newdom, setnewdom] = useState();
  // useEffect(() => {
  //   if (!dom.includes("localhost") && !dom.match(re)) {
  //     if (window.location.host.includes("localhost")) {
  //       const [a, b] = window.location.host.split(".");
  //       setnewdom(`abc.${b}`);
  //     } else if (dom.match(re)) {
  //       const [a, b, c, d, e] = window.location.host.split(".");
  //       setnewdom(`abc.${b}.${c}.${d}.${e}`);
  //     } else {
  //       const [a, b, c] = window.location.host.split(".");
  //       setnewdom(`abc.${b}.${c}`);
  //     }
  //   } else {
  //     if (window.location.host.includes("localhost")) {
  //       const [a] = window.location.host.split(".");
  //       setnewdom(`abc.${a}`);
  //     } else if (dom.match(re)) {
  //       const [a, b, c, d] = window.location.host.split(".");
  //       setnewdom(`abc.${a}.${b}.${c}.${d}`);
  //     } else {
  //       const [a, b] = window.location.host.split(".");
  //       setnewdom(`abc.${a}.${b}`);
  //     }
  //   }
  // }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home ApiDom={ApiDom} />} />
          <Route path="/login" element={<Login ApiDom={ApiDom} />} />
          <Route path="/*" element={<Home ApiDom={ApiDom} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
