import React, { useEffect, useState } from "react";
import { getTimeline } from "../services/api";
import { auth } from "../services/firebase";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const user = auth.currentUser;

  useEffect(() => {
    const fetchTimeline = async () => {
      if (user) {
        try {
          const data = await getTimeline(user.uid);
          setPosts(data || []);
        } catch (err: any) {
          setError(err.message || "タイムラインの取得に失敗しました");
        } finally {
          setLoading(false);
        }
      } else {
        setError("認証されていません");
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          ロード中...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!posts.length) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">タイムラインが空です</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          他のユーザーをフォローしてタイムラインを充実させましょう。
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/users")}
        >
          ユーザーをフォローする
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        タイムライン
      </Typography>
      <List>
        {posts.map((post) => {
          const user = post.user || {};
          const profileImgUrl = user.profile_img_url || "";
          const userName = user.name || "不明なユーザー";
          const userId = user.user_id || "";

          return (
            <ListItem alignItems="flex-start" key={post.post_id}>
              <ListItemAvatar>
                <Avatar
                  src={profileImgUrl}
                  alt={userName}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/user/${userId}`)} // ユーザページへの遷移
                >
                  {profileImgUrl ? null : userName[0]?.toUpperCase() || "?"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={post.content}
                secondary={`投稿者: ${userName} | 投稿日時: ${new Date(
                  post.created_at
                ).toLocaleString()}`}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Timeline;
