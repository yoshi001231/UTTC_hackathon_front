import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import CommentIcon from "@mui/icons-material/Comment";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeUtils";
import { getReplies } from "../services/api";

interface TweetCardProps {
  post: {
    post_id: string;
    user_id: string;
    content: string;
    img_url: string | null;
    created_at: string;
    edited_at?: string | null;
    parent_post_id?: string | null;
    is_bad: boolean;
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
  const [replyCount, setReplyCount] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(!post.is_bad); // 初期状態: is_bad なら非表示
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

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const replies = await getReplies(post.post_id);
        setReplyCount(replies ? replies.length : 0);
      } catch (error) {
        console.error("リプライ数の取得に失敗しました", error);
        setReplyCount(0);
      }
    };
    fetchReplies();
  }, [post.post_id]);

  return (
    <Card
      sx={{
        marginBottom: 1,
        cursor: "pointer",
        border: "3px solid #ddd",
        borderRadius: 2,
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "scale(1.005)",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
        },
        position: "relative",
      }}
      onClick={handleNavigateToTweet}
    >
      {post.is_bad && !showContent ? (
        // 良識に反している場合の表示
        <CardContent>
          <Typography
            variant="body2"
            color="error"
            sx={{ textAlign: "center", marginBottom: 2 }}
          >
            良識に反している可能性があります
          </Typography>
          <CardMedia
            component="img"
            image="/images/is_bad.jpg" // 表示する画像
            alt="良識に反している警告"
            sx={{ maxHeight: 300, objectFit: "contain", margin: "0 auto", display: "block" }}
          />
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{
              marginTop: 2,
              color: "#444", backgroundColor: "gold", borderColor: "gold", overflow: "hidden", "&:hover": { backgroundColor: "rgba(255, 215, 0, 0.8)", borderColor: "gold" }, "&::before": { content: '""', position: "absolute", top: 0, left: "-100%", width: "200%", height: "100%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)", transform: "translateX(-100%)", animation: "shine 1.2s infinite" }, "@keyframes shine": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } }
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowContent(true); // 中身を表示
            }}
          >
            中身を見る
          </Button>
        </CardContent>
      ) : (
        // 通常の表示
        <>
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
                  sx={{
                    marginRight: 2,
                    cursor: "pointer",
                    transition: "transform 0.1s ease",
                    "&:hover": {
                      transform: "scale(1.5)",
                    },
                  }}
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
          {post.is_bad && showContent && (
            <CardContent>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{
                  marginTop: 2,
                  color: "#444", backgroundColor: "gold", borderColor: "gold", overflow: "hidden", "&:hover": { backgroundColor: "rgba(255, 215, 0, 0.8)", borderColor: "gold" }, "&::before": { content: '""', position: "absolute", top: 0, left: "-100%", width: "200%", height: "100%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)", transform: "translateX(-100%)", animation: "shine 1.2s infinite" }, "@keyframes shine": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContent(false); // 再度非表示にする
                }}
              >
                隠す
              </Button>
            </CardContent>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CommentIcon />
              <Typography variant="body2" sx={{ marginLeft: 0.5 }}>
                {replyCount}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
};

export default TweetCard;
