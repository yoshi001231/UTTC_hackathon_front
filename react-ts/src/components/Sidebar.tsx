import React, { useEffect, useState } from "react";
import { Box, Button, Avatar, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserProfile } from "../services/api";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileImgUrl, setProfileImgUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true); // プロフィール取得中状態
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      try {
        setLoadingProfile(true);
        const profileData = await getUserProfile(userId);
        setProfileImgUrl(profileData.profile_img_url || null);
      } catch (error) {
        console.error("プロフィールの取得に失敗しました:", error);
        setProfileImgUrl(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setProfileImgUrl(null);
        setLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      {currentUser && !isLoginPage && (
        <>
          {loadingProfile ? (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              プロフィール画像をロード中...
            </Typography>
          ) : (
            <Avatar
              src={profileImgUrl || undefined}
              alt="プロフィール画像"
              sx={{ cursor: "pointer", mb: 2 }}
              onClick={() => navigate(`/user/${currentUser.uid}`)} // 自分のプロフィールページに移動
            />
          )}

          <Button
            color="inherit"
            onClick={() => navigate("/timeline")}
            sx={{ mb: 2, textAlign: "left" }}
            startIcon={<HomeIcon />}
          >
            ホーム
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate("/users")}
            sx={{ mb: 2, textAlign: "left" }}
            startIcon={<EmojiEventsIcon />}
          >
            ユーザランキング
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
