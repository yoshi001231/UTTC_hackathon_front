import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, CircularProgress, List, ListItem, Avatar, Typography } from "@mui/material";
import { getTopUsersByTweets, getTopUsersByLikes } from "../services/api";
import { useNavigate } from "react-router-dom";

const UserRanking: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0); // 0: ツイート数順, 1: いいね数順
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (tabIndex === 0) {
          const data = await getTopUsersByTweets();
          setUsers(data);
        } else {
          const data = await getTopUsersByLikes();
          setUsers(data);
        }
      } catch (err: any) {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tabIndex]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`); // 指定されたユーザページに遷移
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        ユーザランキング
      </Typography>
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="ツイート数" />
        <Tab label="もらったいいね" />
      </Tabs>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            ロード中...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      ) : (
        <List sx={{ mt: 2 }}>
          {users.map((user, index) => (
            <ListItem key={user.user_id} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6">{index + 1}</Typography>
              <Avatar
                src={user.profile_img_url}
                alt={user.name}
                sx={{ width: 50, height: 50, cursor: "pointer" }}
                onClick={() => handleUserClick(user.user_id)} // ユーザ詳細ページに遷移
              />
              <Box>
                <Typography variant="body1">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {tabIndex === 0
                    ? `ツイート: ${user.tweet_count ?? 0}`
                    : `いいね: ${user.like_count ?? 0}`
                  }
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default UserRanking;
