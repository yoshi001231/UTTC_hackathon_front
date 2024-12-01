import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserProfile } from "../services/api";

const Header: React.FC = () => {
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
    <AppBar position="static">
      <Toolbar>
        {currentUser && !isLoginPage && (
          <>
            <Avatar
              src={profileImgUrl || undefined}
              alt="プロフィール画像"
              sx={{ cursor: "pointer", mr: 2 }}
              onClick={() => navigate(`/user/${currentUser.uid}`)} // 自分のプロフィールページに移動
            />
            <Button
              color="inherit"
              onClick={() => navigate("/timeline")}
              sx={{ mr: 2 }}
            >
              タイムライン
            </Button>
          </>
        )}
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/timeline")}
        >
          Twitter-like App
        </Typography>
        {!isLoginPage && (
          <Box>
            <Button
              color="inherit"
              onClick={() => navigate("/users")}
              sx={{ mr: 2 }}
            >
              ユーザランキング
            </Button>
            {currentUser ? (
              <Button color="inherit" onClick={handleLogout}>
                ログアウト
              </Button>
            ) : (
              <Button color="inherit" onClick={() => navigate("/login")}>
                ログイン
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
