import React, { useCallback, useEffect, useState } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import TweetModal from "../components/TweetModal";
import TweetEditModal from "../components/TweetEditModal";
import LikeUsersDialog from "../components/LikeUsersDialog";
import TweetCard from "../components/TweetCard";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  user_id: string;
  name: string;
  bio: string;
  profile_img_url: string;
  header_img_url: string;
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

  const fetchLikesForPosts = useCallback(async (posts: any[]) => {
    setLoading(true);
    try {
      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          try {
            const likes = await getLikesForPost(post.post_id);
            return {
              ...post,
              like_count: likes ? likes.length : 0,
              is_liked: likes ? likes.some((likeUser) => likeUser.user_id === user?.uid) : false,
            };
          } catch (error) {
            console.error(`投稿 ${post.post_id} のいいね情報取得エラー`, error);
            return post;
          }
        })
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("いいね情報の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTimeline = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const timelineData = await getTimeline(user.uid) || []; // 空の場合のデフォルト値を設定

        if (timelineData.length === 0) {
          setPosts([]);
          setUsers({});
          setLoading(false);
          return;
        }

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
  }, [fetchLikesForPosts, user]);

  const handleLikeToggle = (postId: string, isLiked: boolean) => {
    if (!user) return;
  
    // 楽観的更新: 状態を即座に変更
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
  
    // 非同期でバックエンドを更新
    (async () => {
      try {
        if (isLiked) {
          await removeLike(postId, user.uid);
        } else {
          await addLike(postId, user.uid);
        }
      } catch (error) {
        console.error("いいね処理に失敗しました:", error);
  
        // エラー時に状態を元に戻す
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId
              ? {
                  ...post,
                  is_liked: isLiked,
                  like_count: isLiked ? post.like_count + 1 : post.like_count - 1,
                }
              : post
          )
        );
      }
    })();
  };  

  const handleDeleteTweet = async () => {
    if (tweetToDelete) {
      setLoading(true);
      try {
        await deleteTweet(tweetToDelete);
        await fetchTimeline();
        setDeleteDialogOpen(false);
        setTweetToDelete(null);
      } catch (err) {
        console.error("ツイートの削除に失敗しました", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateTweet = async (updatedTweet: any) => {
    setLoading(true);
    try {
      await updateTweet(updatedTweet);
      await fetchTimeline();
      setEditTweet(null);
    } catch (error) {
      console.error("ツイートの更新に失敗しました:", error);
    } finally {
      setLoading(false);
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
  }, [fetchTimeline]);

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
      <Box sx={{ maxWidth: 600, margin: "auto"}}>
        <Fab
          color="primary"
          aria-label="つぶやく"
          onClick={() => setModalOpen(true)}
          sx={{ mt: 2, ml: 2, mb: 2 }}
        >
          <Tooltip title="つぶやく" placement="top">
            <ChatBubbleIcon />
          </Tooltip>
        </Fab>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6">タイムラインが空です</Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate("/users")}
          >
            ユーザランキングを見る
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto"}}>
      <Fab
        color="primary"
        aria-label="つぶやく"
        onClick={() => setModalOpen(true)}
        sx={{ ml: 2, mb: 2, position: "fixed"}}
      >
        <Tooltip title="つぶやく" placement="top">
          <ChatBubbleIcon />
        </Tooltip>
      </Fab>

      <TweetModal open={modalOpen} onClose={() => setModalOpen(false)} onTweetCreated={fetchTimeline} />
      {editTweet && (
        <TweetEditModal
          open={!!editTweet}
          onClose={() => setEditTweet(null)}
          tweet={editTweet}
          onUpdate={handleUpdateTweet}
        />
      )}

      <Typography variant="h4" gutterBottom textAlign="center" sx={{ fontFamily: "'Dancing Script', cursive", fontWeight: 300, mt: 2 }}>
        Timeline
      </Typography>

      <Box sx={{ pt: 2 }}>
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
    </Box>
  );
};

export default Timeline;
