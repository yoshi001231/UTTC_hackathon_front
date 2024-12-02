import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, List, ListItem, Avatar } from "@mui/material";
import { getFollowers } from "../services/api";

const FollowersList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        if (!userId) {
          setError("ユーザーIDが指定されていません");
          setLoading(false);
          return;
        }
        const data = await getFollowers(userId);
        setFollowers(data || []); // nullの場合に空配列を設定
      } catch (err: any) {
        setError(err.message || "フォロワーの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
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
        フォロワー一覧
      </Typography>
      {followers && followers.length > 0 ? ( // フォロワーが存在する場合の処理
        <List>
          {followers.map((follower) => (
            <ListItem key={follower.user_id}>
              <Avatar
                src={follower.profile_img_url || undefined} // nullの場合のフォールバック
                alt={follower.name}
                sx={{ mr: 2, cursor: "pointer" }}
                onClick={() => navigate(`/user/${follower.user_id}`)}
              />
              <Typography variant="body1">{follower.name}</Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary" textAlign="center">
          フォロワーはいません
        </Typography>
      )}
    </Box>
  );
};

export default FollowersList;
