import React, { useCallback, useEffect, useState } from "react";
import {
  getUserLikedTweets,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import TweetEditModal from "./TweetEditModal";
import LikeUsersDialog from "./LikeUsersDialog";
import TweetCard from "./TweetCard";

interface UserProfile {
  user_id: string;
  name: string;
  bio: string;
  profile_img_url: string;
}

interface UserLikedTweetsProps {
  userId: string;
}

const UserLikedTweets: React.FC<UserLikedTweetsProps> = ({ userId }) => {
  const [tweets, setTweets] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editTweet, setEditTweet] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [likeUsersDialogOpen, setLikeUsersDialogOpen] = useState<boolean>(false);
  const [likeUsers, setLikeUsers] = useState<UserProfile[]>([]);

  const user = auth.currentUser;

  const fetchLikesForPosts = useCallback(async (tweets: any[]) => {
    setLoading(true);
    try {
      const updatedTweets = await Promise.all(
        tweets.map(async (tweet) => {
          try {
            const likes = await getLikesForPost(tweet.post_id);
            return {
              ...tweet,
              like_count: likes ? likes.length : 0,
              is_liked: likes.some((likeUser) => likeUser.user_id === user?.uid),
            };
          } catch (error) {
            console.error(`ツイート ${tweet.post_id} のいいね情報取得エラー`, error);
            return tweet;
          }
        })
      );
      setTweets(updatedTweets);
    } catch (error) {
      console.error("いいね情報の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUserLikedPosts = useCallback(async () => {
    setLoading(true);
    try {
      const tweetsData = await getUserLikedTweets(userId);

      if (!tweetsData || tweetsData.length === 0) {
        setTweets([]);
        setUsers({});
        setLoading(false);
        return;
      }

      const userIds = Array.from(
        new Set<string>(tweetsData.map((tweet: { user_id: string }) => tweet.user_id))
      );

      const userPromises = userIds.map((id) => getUserProfile(id));
      const userData = await Promise.all(userPromises);

      const userMap = userData.reduce(
        (acc: Record<string, UserProfile>, user: UserProfile) => {
          acc[user.user_id] = user;
          return acc;
        },
        {}
      );

      setUsers(userMap);
      await fetchLikesForPosts(tweetsData);
    } catch (err: any) {
      setError(err.message || "ユーザのいいねしたツイート一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [userId, fetchLikesForPosts]);

  const handleLikeToggle = (postId: string, isLiked: boolean) => {
    if (!user) return;

    setTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.post_id === postId
          ? {
              ...tweet,
              is_liked: !isLiked,
              like_count: isLiked ? tweet.like_count - 1 : tweet.like_count + 1,
            }
          : tweet
      )
    );

    (async () => {
      try {
        if (isLiked) {
          await removeLike(postId, user.uid);
        } else {
          await addLike(postId, user.uid);
        }
      } catch (error) {
        console.error("いいね処理に失敗しました:", error);
        setTweets((prevTweets) =>
          prevTweets.map((tweet) =>
            tweet.post_id === postId
              ? {
                  ...tweet,
                  is_liked: isLiked,
                  like_count: isLiked ? tweet.like_count + 1 : tweet.like_count - 1,
                }
              : tweet
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
        await fetchUserLikedPosts();
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
      await fetchUserLikedPosts();
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
    fetchUserLikedPosts();
  }, [fetchUserLikedPosts]);

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

  if (tweets.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">いいねしたツイートがありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto" }}>
      {editTweet && (
        <TweetEditModal
          open={!!editTweet}
          onClose={() => setEditTweet(null)}
          tweet={editTweet}
          onUpdate={handleUpdateTweet}
        />
      )}

      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.post_id}
          post={tweet}
          user={users[tweet.user_id]}
          isLiked={tweet.is_liked}
          likeCount={tweet.like_count}
          isOwnPost={user?.uid === tweet.user_id}
          onLikeToggle={() => handleLikeToggle(tweet.post_id, tweet.is_liked)}
          onEdit={() => setEditTweet(tweet)}
          onDelete={() => openDeleteDialog(tweet.post_id)}
          onOpenLikeUsers={() => openLikeUsersDialog(tweet.post_id)}
        />
      ))}

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>ツイートを削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>キャンセル</Button>
          <Button onClick={handleDeleteTweet} color="error" variant="contained">
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

export default UserLikedTweets;
