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
} from "@mui/material";
import LikeUsersDialog from "../components/LikeUsersDialog";
import TweetEditModal from "../components/TweetEditModal";
import ReplyTweetModal from "../components/ReplyTweetModal";
import ReplyTweets from "../components/ReplyTweets";
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
} from "../services/api";

const Tweet: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [replyModalOpen, setReplyModalOpen] = useState<boolean>(false); // 返信モーダルの状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [likeUsersDialogOpen, setLikeUsersDialogOpen] = useState<boolean>(false);
  const [likeUsers, setLikeUsers] = useState<any[]>([]);
  const [replyTweetsKey, setReplyTweetsKey] = useState<number>(0); // 返信リストの再ロード用キー
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
      setLikeCount(likes ? likes.length : 0);
      setIsLiked(likes ? likes.some((likeUser) => likeUser.user_id === currentUser?.uid) : false);
    } catch (error) {
      console.error("ツイート詳細の取得に失敗しました", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const handleReplyCreated = async () => {
    await fetchPostDetails();
    setReplyTweetsKey((prev) => prev + 1); // キーを更新して返信リストを再レンダリング
  };

  const handleLikeToggle = async () => {
    if (!currentUser || !postId) return;

    // 楽観的更新: UI を即座に更新
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

      // エラー時に状態を元に戻す
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

      <TweetEditModal
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

      <Button
        variant="contained"
        color="primary"
        onClick={() => setReplyModalOpen(true)} // 返信モーダルを開く
        sx={{ mt: 1, width: "100%" }}
      >
        リプライを作成
      </Button>

      <ReplyTweetModal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        parentPostId={postId!}
        onReplyCreated={handleReplyCreated} // 返信作成後にツイート詳細をリロード
      />

      <Box sx={{ mt: 1 }}>
        <Typography variant="h6">
          リプライ
        </Typography>
        <ReplyTweets key={replyTweetsKey} parentPostId={postId!} />
      </Box>
    </Box>
  );
};

export default Tweet;
