import React, { useEffect, useState } from "react";
import {
  getUserTweets,
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
  profile_img_url: string | null;
}

interface UserTweetsProps {
  userId: string; // ユーザーID
}

const UserTweets: React.FC<UserTweetsProps> = ({ userId }) => {
  const [tweets, setTweets] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editTweet, setEditTweet] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [likeUsersDialogOpen, setLikeUsersDialogOpen] = useState<boolean>(false);
  const [likeUsers, setLikeUsers] = useState<any[]>([]);

  const user = auth.currentUser;

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
    } catch (err) {
      console.error("ユーザープロフィールの取得に失敗しました:", err);
      setError("ユーザープロフィールの取得に失敗しました");
    }
  };

  const fetchLikesForTweets = async (tweets: any[]) => {
    const updatedTweets = await Promise.all(
      tweets.map(async (tweet) => {
        try {
          const likes = await getLikesForPost(tweet.post_id);
          return {
            ...tweet,
            like_count: likes ? likes.length : 0,
            is_liked: likes ? likes.some((likeUser) => likeUser.user_id === user?.uid) : false,
          };
        } catch (error) {
          console.error(`ツイート ${tweet.post_id} のいいね情報取得エラー`, error);
          return tweet;
        }
      })
    );
    setTweets(updatedTweets);
  };

  const fetchUserTweets = async () => {
    try {
      const tweetsData = await getUserTweets(userId) || [];
      if (tweetsData.length === 0) {
        setTweets([]);
        setLoading(false);
        return;
      }

      await fetchLikesForTweets(tweetsData);
    } catch (err: any) {
      setError(err.message || "ユーザのツイート一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = (tweetId: string, isLiked: boolean) => {
    if (!user) return;

    setTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.post_id === tweetId
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
          await removeLike(tweetId, user.uid);
        } else {
          await addLike(tweetId, user.uid);
        }
      } catch (error) {
        console.error("いいね処理に失敗しました:", error);
        setTweets((prevTweets) =>
          prevTweets.map((tweet) =>
            tweet.post_id === tweetId
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
      try {
        await deleteTweet(tweetToDelete);
        await fetchUserTweets();
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
      await fetchUserTweets();
      setEditTweet(null);
    } catch (error) {
      console.error("ツイートの更新に失敗しました:", error);
    }
  };

  const openDeleteDialog = (tweetId: string) => {
    setDeleteDialogOpen(true);
    setTweetToDelete(tweetId);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTweetToDelete(null);
  };

  const openLikeUsersDialog = async (tweetId: string) => {
    try {
      const usersWhoLiked = await getLikesForPost(tweetId);
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
    fetchUserProfile();
    fetchUserTweets();
  }, [userId]);

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
        <Typography variant="h6">ツイートがありません</Typography>
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
          user={{
            user_id: userId,
            name: userProfile?.name || "",
            profile_img_url: userProfile?.profile_img_url || null,
          }}
          isLiked={tweet.is_liked}
          likeCount={tweet.like_count}
          isOwnPost={user?.uid === tweet.user_id}
          onLikeToggle={() => handleLikeToggle(tweet.post_id, tweet.is_liked)}
          onEdit={() => setEditTweet(tweet)} onDelete={() => openDeleteDialog(tweet.post_id)} onOpenLikeUsers={() => openLikeUsersDialog(tweet.post_id)} /> ))}
      
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

export default UserTweets;
