import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/timeline"); // ログイン後にタイムライン画面に遷移
    } catch (err: any) {
      setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
      console.error("ログインエラー:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        ログイン
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <TextField
        label="メールアドレス"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="パスワード"
        fullWidth
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>
        ログイン
      </Button>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2" color="textSecondary">
          アカウントをお持ちでない方はこちら:
        </Typography>
        <Button
          variant="text"
          onClick={() => navigate("/register")}
          sx={{ textTransform: "none", mt: 1 }}
        >
          ユーザー登録
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
