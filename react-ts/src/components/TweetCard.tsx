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
import ReplyIcon from "@mui/icons-material/Reply";
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
    parent_post_id?: string | null; // 親投稿のIDをオプションで受け取る
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
    e.stopPropagation();
    navigate(`/tweet/${post.post_id}`);
  };

  const handleNavigateToParentTweet = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (post.parent_post_id) {
      navigate(`/tweet/${post.parent_post_id}`);
    }
  };

  return (
    <Card
      sx={{
        marginBottom: 1,
        cursor: "pointer",
        border: "3px solid #ddd",
        borderRadius: 2,
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        },
      }}
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
            {post.parent_post_id && (
              <IconButton
                sx={{ marginRight: 1 }}
                onClick={handleNavigateToParentTweet}
              >
                <ReplyIcon />
              </IconButton>
            )}
            <Avatar
              src={user.profile_img_url || undefined}
              alt={user.name}
              sx={{ marginRight: 2, cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
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
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
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
            e.stopPropagation();
            onLikeToggle();
          }}
          sx={{ color: isLiked ? "#e91e63" : "default" }}
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
            e.stopPropagation();
            onOpenLikeUsers();
          }}
        >
          {`${likeCount}人からいいね`}
        </Typography>
      </Box>
    </Card>
  );
};

export default TweetCard;
