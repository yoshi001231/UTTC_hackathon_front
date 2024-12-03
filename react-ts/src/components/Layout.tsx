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
        backgroundColor: "#222", // ダークグレーで少し明るく設定
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        color: "#fff", // テキストの色を白に設定
        overflowY: "auto", // 垂直スクロールを有効にする
        height: "100vh", // 高さを100%に設定して、スクロールを有効にする
      }}>
        <Sidebar />
      </Box>

      {/* 中央のコンテンツと右側の空きスペースを半分ずつ */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* 中央のコンテンツ */}
        <Box sx={{
          flex: 1,
          backgroundColor: "#fff", // コンテンツ背景色を白に設定
          overflowY: "auto", // 垂直スクロールを有効にする
          height: "100vh", // 高さを100%に設定して、スクロールを有効にする
        }}>
          {children}
        </Box>

        {/* 右側の空きスペース */}
        <Box sx={{
          width: "50%",
          backgroundColor: "#222", // ダークグレーで設定
          overflowY: "auto", // 垂直スクロールを有効にする
          height: "100vh", // 高さを100%に設定して、スクロールを有効にする
        }} />
      </Box>
    </Box>
  );
};

export default Layout;
