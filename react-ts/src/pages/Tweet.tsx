// ./react-ts/src/pages/Tweet.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { auth } from "../services/firebase";
import {
  getUserProfile,
  getPostById,
  addLike,
  removeLike,
  getLikesForPost,
} from "../services/api";

const Tweet: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!postId) return;

      try {
        const postDetails = await getPostById(postId);
        const postUser = await getUserProfile(postDetails.user_id);
        const likes = await getLikesForPost(postId);

        setPost(postDetails);
        setUser(postUser);
        setLikeCount(likes.length);
        setIsLiked(likes.some((likeUser) => likeUser.user_id === currentUser?.uid));
      } catch (error) {
        console.error("ツイート詳細の取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId, currentUser]);

  const handleLikeToggle = async () => {
    if (!currentUser || !postId) return;

    try {
      if (isLiked) {
        await removeLike(postId, currentUser.uid);
        setLikeCount((prev) => prev - 1);
      } else {
        await addLike(postId, currentUser.uid);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("いいね操作に失敗しました", error);
    }
  };

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

  if (!post || !user) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          ツイートが見つかりません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      {/* 戻るボタンを上部に配置 */}
      <Box sx={{ textAlign: "left", mb: 2 }}>
        <Button onClick={() => navigate("/timeline")} variant="outlined">
          タイムラインに戻る
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={user.profile_img_url}
              alt={user.name}
              sx={{ mr: 2, cursor: "pointer" }}
              onClick={() => navigate(`/user/${user.user_id}`)}
            />
            <Typography variant="h6">{user.name}</Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {post.content}
          </Typography>
          {post.img_url && (
            <CardMedia
              component="img"
              image={post.img_url}
              alt="投稿画像"
              sx={{ maxHeight: 300, objectFit: "contain", mt: 2 }}
            />
          )}
        </CardContent>
        <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
          <IconButton onClick={handleLikeToggle} color={isLiked ? "primary" : "default"}>
            <FavoriteIcon />
          </IconButton>
          <Typography variant="body2">{likeCount}</Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Tweet;
