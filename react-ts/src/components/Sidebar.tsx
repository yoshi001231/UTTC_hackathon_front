import React, { useEffect, useState } from "react";
import { Box, Button, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserProfile } from "../services/api";
import HomeIcon from "@mui/icons-material/Home"; // 家のアイコン
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // ユーザアイコン
import LogoutIcon from "@mui/icons-material/Logout"; // ログアウトアイコン
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // 表彰アイコン（代替として使用）

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileImgUrl, setProfileImgUrl] = useState<string | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const profileData = await getUserProfile(currentUser.uid);
          setProfileImgUrl(profileData.profile_img_url || null);
        } catch (error) {
          console.error("プロフィールの取得に失敗しました:", error);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login"); // ログアウト後にログイン画面へ遷移
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {currentUser && !isLoginPage && (
        <>
          <Avatar
            src={profileImgUrl || undefined}
            alt="プロフィール画像"
            sx={{ cursor: "pointer", mb: 2 }}
            onClick={() => navigate(`/user/${currentUser.uid}`)} // 自分のプロフィールページに移動
          />
          
          {/* タイムラインボタン (ホームアイコンを追加) */}
          <Button
            color="inherit"
            onClick={() => navigate("/timeline")}
            sx={{ mb: 2, textAlign: "left" }}
            startIcon={<HomeIcon />}
          >
            ホーム
          </Button>
        </>
      )}

      {/* ユーザランキングボタン (表彰アイコンを追加) */}
      <Button
        color="inherit"
        onClick={() => navigate("/users")}
        sx={{ mb: 2, textAlign: "left" }}
        startIcon={<EmojiEventsIcon />}
      >
        ユーザランキング
      </Button>

      {/* ログイン/ログアウトボタン (適切なアイコンを追加) */}
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
