import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import LikeUsersDialog from "../components/LikeUsersDialog";
import EditTweetModal from "../components/EditTweetModal";
import TweetCard from "../components/TweetCard";
import { auth } from "../services/firebase";
import {
  getUserProfile,
  getPostById,
  addLike,
  removeLike,
  deleteTweet,
  updateTweet,
  getLikesForPost,
  createReply,
  getReplies,
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
  const [likeUsersDialogOpen, setLikeUsersDialogOpen] = useState<boolean>(false);
  const [likeUsers, setLikeUsers] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState<string>("");
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

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

  const fetchReplies = async () => {
    if (!postId) return;

    setLoadingReplies(true);
    try {
      const repliesList = await getReplies(postId);
      setReplies(repliesList);
    } catch (error) {
      console.error("リプライ一覧の取得に失敗しました", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
    fetchReplies();
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!currentUser || !postId) return;

    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked((prev) => !prev);

    try {
      if (isLiked) {
        await removeLike(postId, currentUser.uid);
      } else {
        await addLike(postId, currentUser.uid);
      }
    } catch (error) {
      console.error("いいね操作に失敗しました", error);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      setIsLiked((prev) => !prev);
    }
  };

  const handleUpdateTweet = async (updatedTweet: any) => {
    try {
      await updateTweet(updatedTweet);
      await fetchPostDetails();
      setEditModalOpen(false);
    } catch (error) {
      console.error("ツイートの更新に失敗しました:", error);
    }
  };

  const openLikeUsersDialog = async () => {
    try {
      if (!postId) return;
      const usersWhoLiked = await getLikesForPost(postId);
      setLikeUsers(usersWhoLiked);
      setLikeUsersDialogOpen(true);
    } catch (error) {
      console.error("いいねしたユーザーの取得に失敗しました", error);
    }
  };

  const closeLikeUsersDialog = () => {
    setLikeUsersDialogOpen(false);
    setLikeUsers([]);
  };

  const handleReplySubmit = async () => {
    if (!newReply.trim() || !postId || !currentUser) return;

    try {
      await createReply(postId, {
        user_id: currentUser.uid,
        content: newReply,
        img_url: "",
      });
      setNewReply("");
      await fetchReplies();
    } catch (error) {
      console.error("リプライの作成に失敗しました", error);
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

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <Box sx={{ textAlign: "left", mb: 2 }}>
        <Button onClick={() => navigate("/timeline")} variant="outlined">
          タイムラインに戻る
        </Button>
      </Box>

      <TweetCard
        post={post}
        user={user}
        isLiked={isLiked}
        likeCount={likeCount}
        isOwnPost={currentUser?.uid === post.user_id}
        onLikeToggle={handleLikeToggle}
        onEdit={() => setEditModalOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
        onOpenLikeUsers={openLikeUsersDialog}
      />

      <Box sx={{ mt: 4 }}>
        <Box sx={{ my: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="リプライを入力..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <Button
            sx={{ mt: 1 }}
            variant="contained"
            onClick={handleReplySubmit}
            disabled={!newReply.trim()}
          >
            投稿
          </Button>
        </Box>

        {loadingReplies ? (
          <CircularProgress />
        ) : Array.isArray(replies) && replies.length > 0 ? ( // replies の長さをチェック
          replies.map((reply) => (
            <Box key={reply.id} sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
              <Typography variant="body1">{reply.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {reply.user_id}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            リプライはまだありません
          </Typography>
        )}
      </Box>

      <EditTweetModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        tweet={post}
        onUpdate={handleUpdateTweet}
      />

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

      <LikeUsersDialog
        open={likeUsersDialogOpen}
        onClose={closeLikeUsersDialog}
        likeUsers={likeUsers}
      />
    </Box>
  );
};

export default Tweet;
