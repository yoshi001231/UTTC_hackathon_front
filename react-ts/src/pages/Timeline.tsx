import React, { useEffect, useState } from "react";
import {
  getTimeline,
  getUserProfile,
  deleteTweet,
  updateTweet,
  addLike,
  removeLike,
  getLikesForPost,
} from "../services/api";
import { auth } from "../services/firebase";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TweetModal from "../components/TweetModal";
import EditTweetModal from "../components/EditTweetModal";
import LikeUsersDialog from "../components/LikeUsersDialog";
import TweetCard from "../components/TweetCard";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  user_id: string;
  name: string;
  bio: string;
  profile_img_url: string;
}

const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editTweet, setEditTweet] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [likeUsersDialogOpen, setLikeUsersDialogOpen] = useState<boolean>(false);
  const [likeUsers, setLikeUsers] = useState<UserProfile[]>([]);
  const navigate = useNavigate();

  const user = auth.currentUser;

  const fetchLikesForPosts = async (posts: any[]) => {
    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        try {
          const likes = await getLikesForPost(post.post_id);
          return {
            ...post,
            like_count: likes.length || 0,
            is_liked: likes.some((likeUser) => likeUser.user_id === user?.uid),
          };
        } catch (error) {
          console.error(`投稿 ${post.post_id} のいいね情報取得エラー`, error);
          return post;
        }
      })
    );
    setPosts(updatedPosts);
  };

  const fetchTimeline = async () => {
    if (user) {
      try {
        const timelineData = await getTimeline(user.uid);

        const userIds: string[] = Array.from(
          new Set<string>(timelineData.map((post: { user_id: string }) => post.user_id))
        );

        const userPromises: Promise<UserProfile>[] = userIds.map((id) => getUserProfile(id));
        const userData = await Promise.all(userPromises);

        const userMap: Record<string, UserProfile> = userData.reduce(
          (acc: Record<string, UserProfile>, user: UserProfile) => {
            acc[user.user_id] = user;
            return acc;
          },
          {}
        );
        setUsers(userMap);
        await fetchLikesForPosts(timelineData);
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

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await removeLike(postId, user.uid);
      } else {
        await addLike(postId, user.uid);
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                is_liked: !isLiked,
                like_count: isLiked ? post.like_count - 1 : post.like_count + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("いいね処理に失敗しました:", error);
    }
  };

  const handleDeleteTweet = async () => {
    if (tweetToDelete) {
      try {
        await deleteTweet(tweetToDelete);
        await fetchTimeline();
        setDeleteDialogOpen(false);
        setTweetToDelete(null);
      } catch (err) {
        console.error("ツイートの削除に失敗しました", err);
      }
    }
  };

  const handleUpdateTweet = async (updatedTweet: any) => {
    try {
      await updateTweet(updatedTweet);
      await fetchTimeline();
      setEditTweet(null);
    } catch (error) {
      console.error("ツイートの更新に失敗しました:", error);
    }
  };

  const openDeleteDialog = (postId: string) => {
    setDeleteDialogOpen(true);
    setTweetToDelete(postId);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTweetToDelete(null);
  };

  const openLikeUsersDialog = async (postId: string) => {
    try {
      const usersWhoLiked = await getLikesForPost(postId);
      setLikeUsers(usersWhoLiked);
      setLikeUsersDialogOpen(true);
    } catch (error) {
      console.error("いいねしたユーザーの取得に失敗しました:", error);
    }
  };

  const closeLikeUsersDialog = () => {
    setLikeUsersDialogOpen(false);
    setLikeUsers([]);
  };

  useEffect(() => {
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
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/users")}
        >
          ユーザーランキングを見る
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        タイムライン
      </Typography>
      {posts.map((post) => (
        <TweetCard
          key={post.post_id}
          post={post}
          user={users[post.user_id]}
          isLiked={post.is_liked}
          likeCount={post.like_count}
          isOwnPost={user?.uid === post.user_id}
          onLikeToggle={() => handleLikeToggle(post.post_id, post.is_liked)}
          onEdit={() => setEditTweet(post)}
          onDelete={() => openDeleteDialog(post.post_id)}
          onOpenLikeUsers={() => openLikeUsersDialog(post.post_id)}
        />
      ))}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <TweetModal open={modalOpen} onClose={() => setModalOpen(false)} onTweetCreated={fetchTimeline} />
      {editTweet && (
        <EditTweetModal
          open={!!editTweet}
          onClose={() => setEditTweet(null)}
          tweet={editTweet}
          onUpdate={handleUpdateTweet}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>ツイートを削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>キャンセル</Button>
          <Button
            onClick={handleDeleteTweet}
            color="error"
            variant="contained"
          >
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

export default Timeline;
