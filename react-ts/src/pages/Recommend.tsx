import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { auth } from "../services/firebase";
import { recommendUsers, getUserProfile } from "../services/api";
import UserCard from "../components/UserCard"; // UserCardコンポーネントをインポート

const Recommend: React.FC = () => {
  const [instruction, setInstruction] = useState<string>(""); // 検索窓の入力値
  const [recommendedUser, setRecommendedUser] = useState<any>(null); // おすすめユーザー情報
  const [isLoading, setIsLoading] = useState<boolean>(false); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラー状態
  const CurrentUser = auth.currentUser;

  // "おすすめを聞く"ボタン押下時のハンドラー
  const handleRecommend = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendedUser(null);
    try {
      if (CurrentUser) {
        // ユーザーIDを取得
        const userId = await recommendUsers(CurrentUser.uid, instruction);
        if (!userId) {
          setError("おすすめユーザーが見つかりませんでした");
          return;
        }

        // ユーザー情報を取得
        const user = await getUserProfile(userId);
        setRecommendedUser(user);
      } else {
        setError("ユーザーが認証されていません");
      }
    } catch (err: any) {
      setError(err.message || "ユーザー推薦に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mt: 4,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          width: "100%",
          alignItems: "center",
        }}
      >
        <TextField
          fullWidth
          label="例: AIに興味ある人"
          variant="outlined"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRecommend}
          disabled={isLoading}
          sx={{
            color: "#444",
            backgroundColor: "gold",
            borderColor: "gold",
            overflow: "hidden",
            "&:hover": {
              backgroundColor: "rgba(255, 215, 0, 0.8)",
              borderColor: "gold",
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : "未フォローから検索"}
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {recommendedUser && !error && (
        <Box
          sx={{
            textAlign: "center",
            marginTop: "20px",
            width: "100%",
          }}
        >
          {/* UserCard を使用してユーザー情報を表示 */}
          <UserCard
            userId={recommendedUser.user_id}
            name={recommendedUser.name}
            bio={recommendedUser.bio}
            profileImgUrl={recommendedUser.profile_img_url}
            headerImgUrl={recommendedUser.header_img_url}
          />
        </Box>
      )}
    </Box>
  );
};

export default Recommend;
