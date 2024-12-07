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
import { recommendUsers } from "../services/api";

const Recommend: React.FC = () => {
  const [instruction, setInstruction] = useState<string>(""); // 検索窓の入力値
  const [recommendedUser, setRecommendedUser] = useState<string | null>(null); // おすすめユーザーID
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
        const user = await recommendUsers(CurrentUser.uid, instruction);
        setRecommendedUser(user || "おすすめユーザーが見つかりませんでした"); // 一人だけ取得
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
        p: 2 
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
            color: "#444", backgroundColor: "gold", borderColor: "gold", overflow: "hidden", "&:hover": { backgroundColor: "rgba(255, 215, 0, 0.8)", borderColor: "gold" }, "&::before": { content: '""', position: "absolute", top: 0, left: "-100%", width: "200%", height: "100%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)", transform: "translateX(-100%)", animation: "shine 1.2s infinite" }, "@keyframes shine": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } }
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : "検索"}
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {recommendedUser && !error && (
        <Box
          sx={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <Typography variant="h6">おすすめのユーザーID</Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "18px" }}>
            {recommendedUser}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Recommend;
