import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserProfile } from "../services/api";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {/* ロゴと文字の表示 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          mb: 2,
        }}
      >
        <img
          src="../../TwinStar_logo.svg"
          alt="TwinStar Logo"
          style={{
            width: "60px",
            height: "60px",
            filter: "invert(1)", // 白色基調
            marginRight: "2px",
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Great Vibes', cursive",
            fontWeight: 300,
            color: "#fff",
          }}
        >
          TwinStar
        </Typography>
      </Box>

      {!isLoginPage && currentUser && (
        <>
          {/* ホームボタン */}
          <Button
            color="inherit"
            onClick={() => navigate(`/user/${currentUser.uid}`)}
            sx={{ mb: 1, textAlign: "left" }}
            startIcon={<HomeIcon />}
          >
            ホーム
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate("/timeline")}
            sx={{ mb: 1, textAlign: "left" }}
            startIcon={<ViewTimelineIcon />}
          >
            タイムライン
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate("/users")}
            sx={{ mb: 1, textAlign: "left" }}
            startIcon={<EmojiEventsIcon />}
          >
            ユーザランキング
          </Button>

          {/* ユーザ検索ボタン */}
          <Button
            color="inherit"
            onClick={() => navigate("/find/users")}
            sx={{ mb: 1, textAlign: "left" }}
            startIcon={<ManageSearchIcon />}
          >
            ユーザ検索
          </Button>

          {/* ツイート検索ボタン */}
          <Button
            color="inherit"
            onClick={() => navigate("/find/tweets")}
            sx={{ mb: 1, textAlign: "left" }}
            startIcon={<SearchIcon />}
          >
            ツイート検索
          </Button>
        </>
      )}

      {currentUser ? (
        <Button
          color="inherit"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{ textAlign: "left" }}
        >
          ログアウト
        </Button>
      ) : (
        <Button
          color="inherit"
          onClick={() => navigate("/login")}
          startIcon={<AccountCircleIcon />}
          sx={{ textAlign: "left" }}
        >
          ログイン
        </Button>
      )}
    </Box>
  );
};

export default Sidebar;
