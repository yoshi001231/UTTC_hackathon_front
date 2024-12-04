import React, { useEffect, useState } from "react";
import {
  getReplies,
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

interface ReplyTweetsProps {
  parentPostId: string; // 親ツイートのID
}

const ReplyTweets: React.FC<ReplyTweetsProps> = ({ parentPostId }) => {
  const [replies, setReplies] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editReply, setEditReply] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [replyToDelete, setReplyToDelete] = useState<string | null>(null);
  const [likeUsersDialogOpen, setLikeUsersDialogOpen] = useState<boolean>(false);
  const [likeUsers, setLikeUsers] = useState<UserProfile[]>([]);

  const user = auth.currentUser;

  const fetchLikesForReplies = async (replies: any[]) => {
    const updatedReplies = await Promise.all(
      replies.map(async (reply) => {
        try {
          const likes = await getLikesForPost(reply.post_id);
          return {
            ...reply,
            like_count: likes ? likes.length : 0,
            is_liked: likes ? likes.some((likeUser) => likeUser.user_id === user?.uid) : false,
          };
        } catch (error) {
          console.error(`リプライ ${reply.post_id} のいいね情報取得エラー`, error);
          return reply;
        }
      })
    );
    setReplies(updatedReplies);
  };

  const fetchReplies = async () => {
    try {
      const repliesData = await getReplies(parentPostId) || [];
      console.log("ReplyTweets:",repliesData);
      if (repliesData.length === 0) {
        setReplies([]);
        setUsers({});
        setLoading(false);
        return;
      }

      const userIds: string[] = Array.from(
        new Set<string>(repliesData.map((reply: { user_id: string }) => reply.user_id))
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
      await fetchLikesForReplies(repliesData);
    } catch (err: any) {
      setError(err.message || "リプライ一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = (replyId: string, isLiked: boolean) => {
    if (!user) return;

    // 楽観的更新: 状態を即座に変更
    setReplies((prevReplies) =>
      prevReplies.map((reply) =>
        reply.post_id === replyId
          ? {
              ...reply,
              is_liked: !isLiked,
              like_count: isLiked ? reply.like_count - 1 : reply.like_count + 1,
            }
          : reply
      )
    );

    // 非同期でバックエンドを更新
    (async () => {
      try {
        if (isLiked) {
          await removeLike(replyId, user.uid);
        } else {
          await addLike(replyId, user.uid);
        }
      } catch (error) {
        console.error("いいね処理に失敗しました:", error);

        // エラー時に状態を元に戻す
        setReplies((prevReplies) =>
          prevReplies.map((reply) =>
            reply.post_id === replyId
              ? {
                  ...reply,
                  is_liked: isLiked,
                  like_count: isLiked ? reply.like_count + 1 : reply.like_count - 1,
                }
              : reply
          )
        );
      }
    })();
  };

  const handleDeleteReply = async () => {
    if (replyToDelete) {
      try {
        await deleteTweet(replyToDelete);
        await fetchReplies();
        setDeleteDialogOpen(false);
        setReplyToDelete(null);
      } catch (err) {
        console.error("リプライの削除に失敗しました", err);
      }
    }
  };

  const handleUpdateReply = async (updatedReply: any) => {
    try {
      await updateTweet(updatedReply);
      await fetchReplies();
      setEditReply(null);
    } catch (error) {
      console.error("リプライの更新に失敗しました:", error);
    }
  };

  const openDeleteDialog = (replyId: string) => {
    setDeleteDialogOpen(true);
    setReplyToDelete(replyId);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReplyToDelete(null);
  };

  const openLikeUsersDialog = async (replyId: string) => {
    try {
      const usersWhoLiked = await getLikesForPost(replyId);
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
    fetchReplies();
  }, [parentPostId]);

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

  if (replies.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">リプライがありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto" }}>
      {editReply && (
        <TweetEditModal
          open={!!editReply}
          onClose={() => setEditReply(null)}
          tweet={editReply}
          onUpdate={handleUpdateReply}
        />
      )}

      {replies.map((reply) => (
        <TweetCard
          key={reply.post_id}
          post={reply}
          user={users[reply.user_id]}
          isLiked={reply.is_liked}
          likeCount={reply.like_count}
          isOwnPost={user?.uid === reply.user_id}
          onLikeToggle={() => handleLikeToggle(reply.post_id, reply.is_liked)}
          onEdit={() => setEditReply(reply)}
          onDelete={() => openDeleteDialog(reply.post_id)}
          onOpenLikeUsers={() => openLikeUsersDialog(reply.post_id)}
        />
      ))}

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>リプライを削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>キャンセル</Button>
          <Button onClick={handleDeleteReply} color="error" variant="contained">
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

export default ReplyTweets;
