import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { updateTweet, uploadImageToFirebase } from "../services/api";

interface TweetEditModalProps {
  open: boolean;
  onClose: () => void;
  tweet: {
    post_id: string;
    content: string;
    img_url: string;
  };
  onUpdate: (updatedTweet: any) => void;
}

const TweetEditModal: React.FC<TweetEditModalProps> = ({
  open,
  onClose,
  tweet,
  onUpdate,
}) => {
  const [content, setContent] = useState(tweet.content);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let imgUrl = tweet.img_url;

      // 画像を再アップロード
      if (imageFile) {
        imgUrl = await uploadImageToFirebase(imageFile, `tweets/${tweet.post_id}`);
      }

      const updatedTweet = {
        post_id: tweet.post_id,
        content,
        img_url: imgUrl,
      };

      await updateTweet(updatedTweet); // バックエンドに保存
      onUpdate(updatedTweet); // 親コンポーネントに更新内容を伝える
      onClose(); // モーダルを閉じる
    } catch (error) {
      console.error("ツイートの更新に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          ツイートを編集
        </Typography>
        <TextField
          label="内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <Box>
          <IconButton component="label" sx={{ mb: 2 }}>
            <PhotoCamera />
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </IconButton>
          <Typography variant="caption" color="textSecondary">
            {imageFile ? "新しい画像が選択されています" : "現在の画像を保持"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "保存中..." : "保存"}
        </Button>
      </Box>
    </Modal>
  );
};

export default TweetEditModal;
