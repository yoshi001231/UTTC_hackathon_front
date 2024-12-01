import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeUtils";

interface TweetCardProps {
  post: {
    post_id: string;
    user_id: string;
    content: string;
    img_url: string | null;
    created_at: string;
    edited_at?: string | null;
  };
  user: {
    user_id: string;
    name: string;
    profile_img_url: string | null;
  };
  isLiked: boolean;
  likeCount: number;
  isOwnPost: boolean;
  onLikeToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenLikeUsers: () => void;
}

const TweetCard: React.FC<TweetCardProps> = ({
  post,
  user,
  isLiked,
  likeCount,
  isOwnPost,
  onLikeToggle,
  onEdit,
  onDelete,
  onOpenLikeUsers,
}) => {
  const navigate = useNavigate();

  const createdAt = new Date(post.created_at);
  const editedAt = post.edited_at ? new Date(post.edited_at) : null;

  const handleNavigateToTweet = (e: React.MouseEvent<HTMLDivElement>) => {
    // イベントが子要素（ボタン、アイコン）で発生した場合は無視
    e.stopPropagation();
    navigate(`/tweet/${post.post_id}`);
  };

  return (
    <Card
      sx={{ marginBottom: 2, cursor: "pointer" }}
      onClick={handleNavigateToTweet}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={user.profile_img_url || undefined}
              alt={user.name}
              sx={{ marginRight: 2, cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation(); // カード遷移のイベントを無効化
                navigate(`/user/${user.user_id}`);
              }}
            />
            <Typography variant="h6">{user.name}</Typography>
          </Box>
          {isOwnPost && (
            <Box>
              {onEdit && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // カード遷移のイベントを無効化
                    onEdit();
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // カード遷移のイベントを無効化
                    onDelete();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
          {editedAt
            ? `${timeAgo(createdAt)} (編集：${timeAgo(editedAt)})`
            : timeAgo(createdAt)}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          {post.content}
        </Typography>
        {post.img_url && (
          <CardMedia
            component="img"
            image={post.img_url}
            alt="投稿画像"
            sx={{ maxHeight: 300, objectFit: "contain", marginTop: 2 }}
          />
        )}
      </CardContent>
      <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation(); // カード遷移のイベントを無効化
            onLikeToggle();
          }}
          color={isLiked ? "primary" : "default"}
        >
          <FavoriteIcon />
        </IconButton>
        <Typography
          variant="body2"
          sx={{
            cursor: "pointer",
            textDecoration: "underline",
            textDecorationThickness: "2px",
          }}
          onClick={(e) => {
            e.stopPropagation(); // カード遷移のイベントを無効化
            onOpenLikeUsers();
          }}
        >
          {`${likeCount || 0}人からいいね`}
        </Typography>
      </Box>
    </Card>
  );
};

export default TweetCard;
