import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Button, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserProfile, getFollowers, getFollowing, addFollow, removeFollow } from "../services/api";
import PlaceIcon from "@mui/icons-material/Place";
import CakeIcon from "@mui/icons-material/Cake";

interface Follower {
  user_id: string;
  name: string;
  profile_img_url: string | null;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false); // ボタンのロード状態
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        // プロフィールデータ取得
        const profileData = await getUserProfile(userId);
        setUser(profileData);

        // フォロワー数とフォロー中数の取得
        const followersData: Follower[] = await getFollowers(userId);
        const followingData: Follower[] = await getFollowing(userId);

        setFollowersCount(followersData.length);
        setFollowingCount(followingData.length);

        // 現在のユーザーがこのユーザーをフォローしているか確認
        setIsFollowing(followersData.some((follower: Follower) => follower.user_id === currentUser?.uid));
      } catch (err) {
        console.error("プロフィールの取得に失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser?.uid]);

  const handleFollowToggle = async () => {
    if (!currentUser || !userId) return;

    setButtonLoading(true);

    try {
      if (isFollowing) {
        // フォロー解除
        await removeFollow(currentUser.uid, userId);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        // フォロー
        await addFollow(currentUser.uid, userId);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("フォロー操作に失敗しました:", err);
    } finally {
      setButtonLoading(false);
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

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 1 }}>
      <Box sx={{ position: "relative", textAlign: "center" }}>
        {/* ヘッダー画像 */}
        <Box
          sx={{
            width: "100%",
            maxHeight: "200px",
            height: "200px",
            backgroundImage: user?.header_img_url
              ? `url(${user.header_img_url})`
              : "none",
            backgroundColor: user?.header_img_url ? "transparent" : "#f0f0f0", // デフォルト背景色
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderBottom: "1px solid #ccc", // 見栄えのための境界線
          }}
        />
  
        {/* プロフィール画像 */}
        <Avatar
          src={user?.profile_img_url}
          alt={user?.name}
          sx={{
            width: 100,
            height: 100,
            position: "absolute",
            left: "20px", // ヘッダー画像の左下
            bottom: "-50px",
            border: "3px solid white",
          }}
        />

        {/* 名前 */}
        <Typography
          variant="h5"
          sx={{
            position: "absolute",
            left: "125px", // プロフィール画像の右隣
            bottom: "-40px",
            whiteSpace: "nowrap",
          }}
        >
          {user?.name}
        </Typography>
  
        {/* 編集ボタンまたはフォローボタン */}
        {currentUser?.uid === userId ? (
          <Button
            variant="contained"
            color="primary"
            sx={{
              position: "absolute",
              right: "20px", // ヘッダー画像の右下
              bottom: "-40px",
              padding: "5px",
            }}
            onClick={() => navigate(`/user/edit/${userId}`)} // 編集ページに遷移
          >
            プロフィール編集
          </Button>
        ) : (
          <Button
            variant={isFollowing ? "outlined" : "contained"}
            color="primary"
            sx={{
              position: "absolute",
              right: "20px", // ヘッダー画像の右下
              bottom: "-40px",
              padding: "5px",
            }}
            onClick={handleFollowToggle}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : isFollowing ? (
              "フォロー解除"
            ) : (
              "フォロー"
            )}
          </Button>
        )}
      </Box>
  
      {/* プロフィール情報 */}
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Box sx={{ display: "flex", alignItems: "left", justifyContent: "left", gap: 1, mb: 1 }}>
          <PlaceIcon color="action" />
          <Typography>{user?.location || "未設定"}</Typography>
          <CakeIcon color="action" />
          <Typography>{user?.birthday || "未設定"}</Typography>
        </Box>
        <Typography sx={{ mt: 2, ml: 2, textAlign: "left" }} variant="body1" color="textSecondary" gutterBottom>
          {user?.bio || "自己紹介はまだありません"}
        </Typography>
  
        {/* フォロワー数とフォロー中数の表示 */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-around" }}>
          <Typography
            variant="body1"
            onClick={() => navigate(`/user/${userId}/followers`)} // フォロワー一覧に遷移
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            フォロワー: {followersCount}
          </Typography>
          <Typography
            variant="body1"
            onClick={() => navigate(`/user/${userId}/following`)} // フォロー中一覧に遷移
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            フォロー中: {followingCount}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
