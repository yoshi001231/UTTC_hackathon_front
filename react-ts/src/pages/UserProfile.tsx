import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Button, CircularProgress, Tabs, Tab } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserProfile, getFollowers, getFollowing, addFollow, removeFollow } from "../services/api";
import PlaceIcon from "@mui/icons-material/Place";
import CakeIcon from "@mui/icons-material/Cake";
import UserTweets from "../components/UserTweets";
import UserMediaTweets from "../components/UserMediaTweets";
import UserLikedTweets from "../components/UserLikedTweets";

interface Follower {
  user_id: string;
  name: string;
  profile_img_url: string | null;
  header_img_url: string | null;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        // プロフィールデータ取得
        const profileData = await getUserProfile(userId);
        setUser(profileData);

        // フォロワー数とフォロー中数の取得
        const followersData: Follower[] = await getFollowers(userId);
        const followingData: Follower[] = await getFollowing(userId);

        setFollowersCount(followersData ? followersData.length : 0);
        setFollowingCount(followingData ? followingData.length : 0);

        // 現在のユーザーがこのユーザーをフォローしているか確認
        setIsFollowing(followersData ? followersData.some((follower: Follower) => follower.user_id === currentUser?.uid) : false);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
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
    <Box sx={{ maxWidth: 600, margin: "auto"}}>
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
            backgroundColor: user?.header_img_url ? "transparent" : "#f0f0f0",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderBottom: "1px solid #ccc",
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
            left: "20px",
            bottom: "-50px",
            border: "3px solid white",
          }}
        />

        {/* 名前 */}
        <Typography
          variant="h5"
          sx={{
            position: "absolute",
            left: "125px",
            bottom: "-50px",
            whiteSpace: "nowrap",
          }}
        >
          {user?.name}
        </Typography>

        {/* 編集ボタンまたはフォローボタン */}
        {currentUser?.uid === userId ? (
          <Button
            variant="contained"
            sx={{
              position: "absolute",
              right: "20px",
              bottom: "-50px",
              padding: "5px",
              color: "#444", backgroundColor: "gold", borderColor: "gold", overflow: "hidden", "&:hover": { backgroundColor: "rgba(255, 215, 0, 0.8)", borderColor: "gold" }, "&::before": { content: '""', position: "absolute", top: 0, left: "-100%", width: "200%", height: "100%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)", transform: "translateX(-100%)", animation: "shine 1.2s infinite" }, "@keyframes shine": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } }
            }}
            onClick={() => navigate(`/user/edit/${userId}`)}
          >
            プロフィール生成/編集
          </Button>
        ) : (
          <Button
            variant={isFollowing ? "outlined" : "contained"}
            sx={{
              position: "absolute",
              right: "20px",
              bottom: "-40px",
              padding: "5px",
              border: isFollowing ? "1px solid black" : "none",
              backgroundColor: isFollowing ? "white" : "black",
              color: isFollowing ? "black" : "white",
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
        <Box sx={{ mt: 2, display: "flex", justifyContent: "left", gap: 2 }}>
          <Typography
            variant="body1"
            onClick={() => navigate(`/user/${userId}/following`)}
            sx={{ cursor: "pointer", textDecoration: "underline" }}
          >
            {followingCount} フォロー
          </Typography>
          <Typography
            variant="body1"
            onClick={() => navigate(`/user/${userId}/followers`)}
            sx={{ cursor: "pointer", textDecoration: "underline" }}
          >
            {followersCount} フォロワー
          </Typography>
        </Box>
      </Box>

      {/* 横線 */}
      <Box sx={{ mt: 2, borderBottom: "2px solid #ccc" }} />

      {/* ツイート/メディア/いいね */}
      <Box>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="ツイート" />
          <Tab label="メディア" />
          <Tab label="いいね" />
        </Tabs>
      </Box>

      {/* タブに基づいた内容の切り替え */}
      <Box sx={{ mt: 1 }}>
        {selectedTab === 0 && <UserTweets userId={userId!} />}
        {selectedTab === 1 && <UserMediaTweets userId={userId!} />}
        {selectedTab === 2 && <UserLikedTweets userId={userId!} />}
      </Box>
    </Box>
  );
};

export default UserProfile;
