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
import { updateTweet, uploadImageToFirebase, checkIsBad, updateIsBad } from "../services/api";

interface ReplyTweetEditModalProps {
  open: boolean;
  onClose: () => void;
  tweet: {
    post_id: string;
    content: string;
    img_url: string;
    parent_post_id?: string;
  };
  onUpdate: (updatedTweet: any) => void;
}

const ReplyTweetEditModal: React.FC<ReplyTweetEditModalProps> = ({
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
        parent_post_id: tweet.parent_post_id,
      };

      // バックエンドに更新を送信
      await updateTweet(updatedTweet);

      // checkIsBad API を呼び出して判定を確認
      const isBadResult = await checkIsBad(tweet.post_id);

      if (isBadResult.includes("NO")) {
        // is_bad を 0 に更新
        alert(`表示制限が解除されました。\n`);
        await updateIsBad(tweet.post_id, false);
      } else if (isBadResult.includes("YES")) {
        // 警告文を表示し、is_bad を 1 に更新
        alert(`良識に反している可能性があります。タイムラインでは表示制限がかかります。\n内容:\n ${content}\n`);
        await updateIsBad(tweet.post_id, true);
      }
  
      // 親コンポーネントに更新内容を伝える
      onUpdate(updatedTweet);
  
      // モーダルを閉じる
      onClose();
    } catch (error) {
      console.error("リプライの更新に失敗しました:", error);
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

export default ReplyTweetEditModal;
