import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { registerUser } from "../services/api";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProfileImage(file);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      let finalProfileImageUrl = profileImageUrl;

      // プロフィール画像をFirebase Storageにアップロード
      if (profileImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile_images/${userId}`);
        await uploadBytes(storageRef, profileImage);
        const downloadURL = await getDownloadURL(storageRef);
        setProfileImageUrl(downloadURL);
        finalProfileImageUrl = downloadURL;
      }

      // サーバーにユーザー情報を登録
      await registerUser({
        user_id: userId,
        name,
        bio,
        profile_img_url: finalProfileImageUrl,
      });

      navigate("/timeline");
    } catch (err: any) {
      setError(err.message || "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        新規登録
      </Typography>
      {error && (
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Avatar
          src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl}
          alt="プロフィール画像"
          sx={{ width: 100, height: 100, margin: "auto" }}
        />
        <IconButton component="label">
          <PhotoCamera />
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </IconButton>
        <Typography variant="caption" color="textSecondary">
          プロフィール画像を選択
        </Typography>
      </Box>
      <TextField
        label="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="メールアドレス"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="自己紹介 (任意)"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "登録"}
      </Button>
    </Box>
  );
};

export default Register;
