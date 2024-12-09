import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, CircularProgress, List, ListItem, Typography } from "@mui/material";
import { getTopUsersByTweets, getTopUsersByLikes } from "../services/api";
import UserCard from "../components/UserCard";

const UserRanking: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0); // 0: ツイート数順, 1: いいね数順
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 2 }}>
      <Typography variant="h4" gutterBottom textAlign="center" sx={{ fontFamily: "'Dancing Script', cursive", fontWeight: 300 }}>
        User Ranking
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
          {users.map((user) => (
            <ListItem key={user.user_id} sx={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* ツイート数またはいいね数を表示（順位の代わり） */}
              <Typography variant="h4" sx={{ fontFamily: "'Times New Roman'" }}>
                {tabIndex === 0 ? user.tweet_count ?? 0 : user.like_count ?? 0}
              </Typography>
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
      )}
    </Box>
  );
};

export default UserRanking;
