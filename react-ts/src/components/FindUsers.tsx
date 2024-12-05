import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { findUsersByKey } from "../services/api"; // API 呼び出し関数をサービスからインポート
import UserCard from "./UserCard";

interface FindUsersProps {
  keyword: string; // 検索キーワードを親コンポーネントから受け取る
}

const FindUsers: React.FC<FindUsersProps> = ({ keyword }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!keyword.trim()) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await findUsersByKey(keyword); // キーワードでユーザー検索
        setUsers(data);
      } catch (err: any) {
        setError("ユーザー検索に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [keyword]);

  return (
    <Box sx={{ maxWidth: 800, margin: "auto"}}>
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
      ) : users.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            ユーザーが見つかりません
          </Typography>
        </Box>
      ) : (
        <List sx={{ mt: 2 }}>
          {users.map((user) => (
            <ListItem key={user.user_id} sx={{ display: "flex", gap: 2 }}>
              <UserCard
                userId={user.user_id}
                name={user.name}
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

export default FindUsers;
