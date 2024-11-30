import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  TextField,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { auth } from "../services/firebase";
import {
  getUserProfile,
  addFollow,
  removeFollow,
  getFollowers,
  getFollowing,
  updateUserProfile,
  uploadProfileImage,
} from "../services/api";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false); // 自分のページか判定
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false); // 編集モード
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    bio: "",
    profileImgUrl: "",
    profileImgFile: null as File | null,
  });
  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!userId) {
          setError("ユーザーIDが指定されていません");
          setLoading(false);
          return;
        }

        // プロフィールデータを取得
        const profileData = await getUserProfile(userId);
        const followersData = (await getFollowers(userId)) || [];
        const followingData = (await getFollowing(userId)) || [];

        setUser(profileData);
        setFollowersCount(followersData.length);
        setFollowingCount(followingData.length);

        // 自分のページかどうかを判定
        const isSelf = currentUser?.uid === userId;
        setIsCurrentUser(isSelf);

        // 編集用データを設定
        if (isSelf) {
          setUpdatedProfile({
            name: profileData.name || "",
            bio: profileData.bio || "",
            profileImgUrl: profileData.profile_img_url || "",
            profileImgFile: null,
          });
        }

        // 他人のページの場合、フォロー状態を確認
        if (!isSelf) {
          const isFollowed = followersData.some(
            (follower: any) => follower.user_id === currentUser?.uid
          );
          setIsFollowing(isFollowed);
        }
      } catch (err: any) {
        console.error("プロフィールの取得に失敗:", err);
        setError(err.message || "プロフィールの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !userId) return;

    try {
      if (isFollowing) {
        await removeFollow(currentUser.uid, userId);
        setFollowersCount((prev) => prev - 1);
      } else {
        await addFollow(currentUser.uid, userId);
        setFollowersCount((prev) => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("フォロー操作に失敗しました", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setUpdatedProfile((prev) => ({ ...prev, profileImgFile: file }));
  };

  const handleSave = async () => {
    if (!currentUser || !userId || !isCurrentUser) return;

    try {
      let profileImgUrl = updatedProfile.profileImgUrl;

      // プロフィール画像のアップロード
      if (updatedProfile.profileImgFile) {
        profileImgUrl = await uploadProfileImage(currentUser.uid, updatedProfile.profileImgFile);
      }

      // プロフィールの更新
      await updateUserProfile({
        user_id: currentUser.uid,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        profile_img_url: profileImgUrl,
      });

      // ユーザー情報を更新
      setUser((prev: any) => ({
        ...prev,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        profile_img_url: profileImgUrl,
      }));

      setEditing(false);
    } catch (err) {
      console.error("プロフィールの更新に失敗しました", err);
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

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <Box sx={{ textAlign: "center" }}>
        {editing ? (
          <>
            <Avatar
              src={
                updatedProfile.profileImgFile
                  ? URL.createObjectURL(updatedProfile.profileImgFile)
                  : updatedProfile.profileImgUrl
              }
              sx={{ width: 100, height: 100, margin: "auto", mb: 2 }}
            />
            <IconButton component="label">
              <PhotoCamera />
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </IconButton>
            <TextField
              label="名前"
              value={updatedProfile.name}
              onChange={(e) => setUpdatedProfile((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="自己紹介"
              value={updatedProfile.bio}
              onChange={(e) => setUpdatedProfile((prev) => ({ ...prev, bio: e.target.value }))}
              fullWidth
              sx={{ mt: 2 }}
              multiline
              rows={3}
            />
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSave}>
              保存
            </Button>
          </>
        ) : (
          <>
            <Avatar
              src={user.profile_img_url}
              alt={user.name}
              sx={{ width: 100, height: 100, margin: "auto", mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {user.bio || "自己紹介はまだありません"}
            </Typography>
            {isCurrentUser ? (
              <Button variant="contained" color="primary" onClick={() => setEditing(true)}>
                プロフィール編集
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleFollow}
                color={isFollowing ? "secondary" : "primary"}
              >
                {isFollowing ? "フォロー解除" : "フォロー"}
              </Button>
            )}
          </>
        )}
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-around" }}>
        <Typography
          variant="body1"
          onClick={() => navigate(`/user/${userId}/followers`)}
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
          フォロワー: {followersCount}
        </Typography>
        <Typography
          variant="body1"
          onClick={() => navigate(`/user/${userId}/following`)}
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
          フォロー中: {followingCount}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserProfile;
