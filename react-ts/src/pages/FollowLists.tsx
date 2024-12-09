import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, List, ListItem, Button, Tabs, Tab, CircularProgress } from "@mui/material";
import { getFollowers, getFollowing } from "../services/api";
import UserCard from "../components/UserCard";

const FollowLists: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabIndex, setTabIndex] = useState(0); // 0: フォロワー, 1: フォロー中
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("ユーザーIDが指定されていません");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (tabIndex === 0) {
          const followers = await getFollowers(userId);
          setUsers(followers || []);
        } else {
          const following = await getFollowing(userId);
          setUsers(following || []);
        }
      } catch (err: any) {
        setError(err.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, tabIndex]);

  useEffect(() => {
    // プロフィールページからの遷移に応じて初期タブを設定
    if (location.pathname.includes("following")) {
      setTabIndex(0);
    } else if (location.pathname.includes("followers")) {
      setTabIndex(1);
    }
  }, [location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
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
      {/* 戻るボタン */}
      <Button
        variant="outlined"
        onClick={() => navigate(`/user/${userId}`)}
        sx={{ mb: 2 }}
      >
        戻る
      </Button>

      {/* タブ */}
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="フォロー" />
        <Tab label="フォロワー" />
      </Tabs>

      {users.length > 0 ? (
        <List sx={{ mt: 2 }}>
          {users.map((user) => (
            <ListItem key={user.user_id}>
            <UserCard
              userId={user.user_id}
              name={user.name}
              bio={user.bio}
              profileImgUrl={user.profile_img_url}
              headerImgUrl={user.header_img_url}
            />
          </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mt: 2 }}>
          {tabIndex === 0 ? "フォロワーはいません" : "フォロー中のユーザーはいません"}
        </Typography>
      )}
    </Box>
  );
};

export default FollowLists;
