import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface UserCardProps {
  userId: string;
  name: string;
  profileImgUrl?: string | null;
  headerImgUrl?: string | null;
}

const UserCard: React.FC<UserCardProps> = ({ userId, name, profileImgUrl, headerImgUrl }) => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/user/${userId}`)}
      sx={{
        position: "relative",
        width: "100%",
        height: 100,
        mb: 2,
        borderRadius: "8px",
        overflow: "hidden",
        backgroundImage: headerImgUrl
          ? `linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url(${headerImgUrl})`
          : "linear-gradient(to right, #fff, #888)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1px solid #ddd",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease", // アニメーション設定
        "&:hover": {
          transform: "scale(1.05)", // ホバー時の拡大
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)", // ホバー時の影
        },
      }}
    >
      {/* プロフィール画像 */}
      <Avatar
        src={profileImgUrl || undefined}
        alt={name}
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          width: 60,
          height: 60,
          border: "2px solid white",
        }}
        onClick={() => navigate(`/user/${userId}`)}
      />

      {/* 名前 */}
      <Typography
        variant="h6"
        sx={{
          position: "absolute",
          bottom: 16,
          left: 88,
          color: "white",
          textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
        }}
      >
        {name}
      </Typography>
    </Box>
  );
};

export default UserCard;
