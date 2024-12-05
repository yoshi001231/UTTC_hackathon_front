import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, TextField, Button, IconButton, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserProfile, updateUserProfile, uploadProfileImage, uploadHeaderImage } from "../services/api";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const UserProfileEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    bio: "",
    location: "",
    birthday: "",
    profileImgFile: null as File | null,
    headerImgFile: null as File | null,
    profileImgUrl: "",
    headerImgUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // 保存中状態
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const profileData = await getUserProfile(userId);
        setUpdatedProfile({
          name: profileData.name || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          birthday: profileData.birthday || "",
          profileImgUrl: profileData.profile_img_url || "",
          headerImgUrl: profileData.header_img_url || "",
          profileImgFile: null,
          headerImgFile: null,
        });
      } catch (err) {
        console.error("プロフィールの取得に失敗:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const handleFileChange = (field: "profileImgFile" | "headerImgFile") => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      setUpdatedProfile((prev) => ({ ...prev, [field]: file }));
    };

  const handleSave = async () => {
    if (!currentUser || !userId) return;

    setIsSaving(true); // 保存中の状態を設定

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
        location: updatedProfile.location,
        birthday: updatedProfile.birthday,
        profile_img_url: profileImgUrl,
        header_img_url: headerImgUrl,
      });

      navigate(`/user/${userId}`); // プロフィール画面に遷移
    } catch (err) {
      console.error("プロフィールの更新に失敗しました", err);
    } finally {
      setIsSaving(false); // 保存中状態をリセット
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">ロード中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <Box sx={{ textAlign: "center" }}>

        {/* ヘッダー画像 */}
        <Box
          sx={{
            position: "relative",
            marginBottom: "20px",
            width: "100%",
            maxHeight: "200px",
            height: "200px",
            backgroundColor: updatedProfile.headerImgUrl || updatedProfile.headerImgFile
              ? "transparent"
              : "#f0f0f0", // デフォルト背景色
            backgroundImage: updatedProfile.headerImgFile
              ? `url(${URL.createObjectURL(updatedProfile.headerImgFile)})`
              : updatedProfile.headerImgUrl
              ? `url(${updatedProfile.headerImgUrl})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
            }}
          >
            <PhotoCamera />
            <input type="file" hidden accept="image/*" onChange={handleFileChange("headerImgFile")} />
          </IconButton>
        </Box>

        {/* プロフィール画像 */}
        <Box sx={{ position: "relative", width: 100, height: 100, margin: "auto", marginBottom: 2 }}>
          <Avatar
            src={updatedProfile.profileImgFile ? URL.createObjectURL(updatedProfile.profileImgFile) : updatedProfile.profileImgUrl}
            alt="プロフィール画像"
            sx={{
              width: "100%",
              height: "100%",
              opacity: 0.5, // 画像を薄く
            }}
          />
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
            }}
          >
            <PhotoCamera />
            <input type="file" hidden accept="image/*" onChange={handleFileChange("profileImgFile")} />
          </IconButton>
        </Box>

        {/* プロフィール情報編集フォーム */}
        <TextField
          label="名前"
          value={updatedProfile.name}
          onChange={(e) => {if (e.target.value.length <= 50 ) {setUpdatedProfile((prev) => ({ ...prev, name: e.target.value }))}}}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          label="自己紹介"
          value={updatedProfile.bio}
          onChange={(e) => {if (e.target.value.length <= 160 ) {setUpdatedProfile((prev) => ({ ...prev, bio: e.target.value }))}}}
          fullWidth
          sx={{ mt: 2 }}
          multiline
          rows={3}
        />
        <TextField
          label="位置"
          value={updatedProfile.location}
          onChange={(e) => {if (e.target.value.length <= 100 ) {setUpdatedProfile((prev) => ({ ...prev, location: e.target.value }))}}}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          label="誕生日"
          type="date"
          value={updatedProfile.birthday}
          onChange={(e) => setUpdatedProfile((prev) => ({ ...prev, birthday: e.target.value }))}
          fullWidth
          sx={{ mt: 2 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSave}
          disabled={isSaving} // 通信中はボタンを無効化
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : "保存"}
        </Button>
      </Box>
    </Box>
  );
};

export default UserProfileEdit;
