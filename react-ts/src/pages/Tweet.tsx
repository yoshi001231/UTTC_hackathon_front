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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditTweetModal from "../components/EditTweetModal";
import { auth } from "../services/firebase";
import {
  getUserProfile,
  getPostById,
  addLike,
  removeLike,
  deleteTweet,
  getLikesForPost,
} from "../services/api";

const Tweet: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // 時間差計算
  const timeAgo = (date: Date | null): string => {
    if (!date) return "不明な日時";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor((diffMs + 10) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) {
      return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      return `${diffDays}日前`;
    }
  };

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

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

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

  const handleDelete = async () => {
    if (!postId) return;

    try {
      await deleteTweet(postId);
      navigate("/timeline"); // 削除後はタイムラインに戻る
    } catch (error) {
      console.error("ツイートの削除に失敗しました", error);
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

  const editedAt = post.edited_at ? new Date(post.edited_at) : null;
  const createdAt = post.created_at ? new Date(post.created_at) : null;

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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={user.profile_img_url}
                alt={user.name}
                sx={{ mr: 2, cursor: "pointer" }}
                onClick={() => navigate(`/user/${user.user_id}`)}
              />
              <Typography variant="h6">{user.name}</Typography>
            </Box>
            {/* 自分のツイートであれば編集・削除ボタンを表示 */}
            {currentUser?.uid === post.user_id && (
              <Box>
                <IconButton onClick={() => setEditModalOpen(true)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => setDeleteDialogOpen(true)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>
          {/* 時間情報を表示 */}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {editedAt
              ? `${user.name}・${timeAgo(createdAt)} (編集：${timeAgo(editedAt)})`
              : `${user.name}・${timeAgo(createdAt)}`}
          </Typography>
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

      {/* 編集モーダル */}
      {editModalOpen && post && (
        <EditTweetModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            fetchPostDetails(); // 編集後にツイート情報を再取得
          }}
          tweet={post}
          onUpdate={(updatedTweet) => {
            setPost(updatedTweet); // ローカルステートを更新
            setEditModalOpen(false);
          }}
        />
      )}

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>ツイートを削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tweet;
