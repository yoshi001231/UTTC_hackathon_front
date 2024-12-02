import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#000" }}> {/* 背景色を黒に設定 */}
      {/* 左側のナビゲーション */}
      <Box sx={{
        width: 240,
        padding: 2,
        backgroundColor: "#1c1c1c", // ダークグレーで少し明るく設定
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        color: "#fff", // テキストの色を白に設定
      }}>
        <Sidebar />
      </Box>

      {/* 中央のコンテンツと右側の空きスペースを半分ずつ */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* 中央のコンテンツ */}
        <Box sx={{ flex: 1, padding: 2, color: "#fff" }}> {/* テキストの色を白に設定 */}
          {children}
        </Box>

        {/* 右側の空きスペース */}
        <Box sx={{ width: "50%", padding: 2, backgroundColor: "#1c1c1c", color: "#fff" }} /> {/* ダークグレーで設定 */}
      </Box>
    </Box>
  );
};

export default Layout;
