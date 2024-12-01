import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, List, ListItem, Avatar } from "@mui/material";
import { getFollowing } from "../services/api";

const FollowingList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        if (!userId) {
          setError("ユーザーIDが指定されていません");
          setLoading(false);
          return;
        }
        const data = await getFollowing(userId);
        setFollowing(data);
      } catch (err: any) {
        setError(err.message || "フォロー中の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">ロード中...</Typography>
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
      <Typography variant="h4" gutterBottom>
        フォロー中一覧
      </Typography>
      <List>
        {following.map((followed) => (
          <ListItem key={followed.user_id}>
            <Avatar
              src={followed.profile_img_url}
              alt={followed.name}
              sx={{ mr: 2, cursor: "pointer" }}
              onClick={() => navigate(`/user/${followed.user_id}`)}
            />
            <Typography variant="body1">{followed.name}</Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FollowingList;
