import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { updateTweet, uploadImageToFirebase } from "../services/api";
import GenerateTweetContinuationChat from "../gemini/GenerateTweetContinuationChat";

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
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

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

  const handleGenerateSelect = (generatedText: string) => {
    setContent(generatedText); // 生成されたテキストをテキストボックスに設定
    setIsGenerateDialogOpen(false); // ダイアログを閉じる
  };

  return (
    <>
      {/* ツイート編集ダイアログ */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>ツイートを編集</DialogTitle>
        <DialogContent>
          <TextField
            label="内容"
            margin="dense"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={10}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <IconButton component="label">
              <PhotoCamera />
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </IconButton>
            <Button
              onClick={() => setIsGenerateDialogOpen(true)}
              variant="outlined"
              color="secondary"
              sx={{
                flexGrow: 1,
                ml: 2,
                color: "#444", backgroundColor: "gold", borderColor: "gold", overflow: "hidden", "&:hover": { backgroundColor: "rgba(255, 215, 0, 0.8)", borderColor: "gold" }, "&::before": { content: '""', position: "absolute", top: 0, left: "-100%", width: "200%", height: "100%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)", transform: "translateX(-100%)", animation: "shine 1.2s infinite" }, "@keyframes shine": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } }
              }}
            >
              過去の投稿から入力の続きを生成
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GenerateTweetContinuationChat ダイアログ */}
      <Dialog open={isGenerateDialogOpen} onClose={() => setIsGenerateDialogOpen(false)} fullWidth maxWidth="sm">
        <GenerateTweetContinuationChat
          authId={tweet.post_id} // 投稿IDを渡す
          tempText={content} // 現在のテキストボックスの内容を temp_text として渡す
          onSelect={handleGenerateSelect} // 生成された内容をテキストボックスに反映
        />
      </Dialog>
    </>
  );
};

export default TweetEditModal;
