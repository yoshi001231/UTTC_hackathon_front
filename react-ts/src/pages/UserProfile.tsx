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
  uploadHeaderImage,
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
    headerImgUrl: "",
    headerImgFile: null as File | null,
    location: "",
    birthday: "",
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
            headerImgUrl: profileData.header_img_url || "",
            headerImgFile: null,
            location: profileData.location || "",
            birthday: profileData.birthday || "",
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

  const handleFileChange = (field: "profileImgFile" | "headerImgFile") => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      setUpdatedProfile((prev) => ({ ...prev, [field]: file }));
    };

  const handleSave = async () => {
    if (!currentUser || !userId || !isCurrentUser) return;

    try {
      let profileImgUrl = updatedProfile.profileImgUrl;
      let headerImgUrl = updatedProfile.headerImgUrl;

      // プロフィール画像のアップロード
      if (updatedProfile.profileImgFile) {
        profileImgUrl = await uploadProfileImage(currentUser.uid, updatedProfile.profileImgFile);
      }

      // ヘッダー画像のアップロード
      if (updatedProfile.headerImgFile) {
        headerImgUrl = await uploadHeaderImage(currentUser.uid, updatedProfile.headerImgFile);
      }

      // プロフィールの更新
      await updateUserProfile({
        user_id: currentUser.uid,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        profile_img_url: profileImgUrl,
        header_img_url: headerImgUrl,
        location: updatedProfile.location,
        birthday: updatedProfile.birthday,
      });

      // ユーザー情報を更新
      setUser((prev: any) => ({
        ...prev,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        profile_img_url: profileImgUrl,
        header_img_url: headerImgUrl,
        location: updatedProfile.location,
        birthday: updatedProfile.birthday,
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
              プロフィール画像
              <PhotoCamera />
              <input type="file" hidden accept="image/*" onChange={handleFileChange("profileImgFile")} />
            </IconButton>
            <IconButton component="label">
              ヘッダー画像
              <PhotoCamera />
              <input type="file" hidden accept="image/*" onChange={handleFileChange("headerImgFile")} />
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
            <TextField
              label="位置"
              value={updatedProfile.location}
              onChange={(e) => setUpdatedProfile((prev) => ({ ...prev, location: e.target.value }))}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="誕生日"
              type="date"
              value={updatedProfile.birthday}
              onChange={(e) => setUpdatedProfile((prev) => ({ ...prev, birthday: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true, }, }}
              sx={{ mt: 2 }}
            />
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSave}>
              保存
            </Button>
          </>
        ) : (
          <>
            {user?.header_img_url && (
              <img
                src={user.header_img_url}
                alt="ヘッダー画像"
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover", marginBottom: "20px" }}
              />
            )}
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
            <Typography>位置: {user?.location || "未設定"}</Typography>
            <Typography>誕生日: {user?.birthday || "未設定"}</Typography>
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
