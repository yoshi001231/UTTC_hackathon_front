import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { uploadImageToFirebase, createTweet } from "../services/api";
import { auth } from "../services/firebase";
import GenerateTweetContinuationChat from "../gemini/GenerateTweetContinuationChat";

interface TweetModalProps {
  open: boolean;
  onClose: () => void;
  onTweetCreated: () => Promise<void>;
}

const TweetModal: React.FC<TweetModalProps> = ({ open, onClose, onTweetCreated }) => {
  const [content, setContent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleTweetSubmit = async () => {
    if (!auth.currentUser) {
      console.error("ユーザーが認証されていません");
      return;
    }

    setLoading(true);
    try {
      let imgUrl = "";
      if (imageFile) {
        imgUrl = await uploadImageToFirebase(imageFile, `tweets/${auth.currentUser.uid}/${Date.now()}`);
      }

      await createTweet({
        user_id: auth.currentUser.uid,
        content,
        img_url: imgUrl,
      });

      setContent("");
      setImageFile(null);
      onClose();
      await onTweetCreated();
    } catch (error) {
      console.error("ツイートの作成に失敗しました:", error);
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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>ツイートを作成</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="内容"
            type="text"
            fullWidth
            multiline
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
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
          <Button onClick={handleTweetSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? "送信中..." : "ツイート"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GenerateTweetContinuationChat をモーダルで表示 */}
      <Dialog open={isGenerateDialogOpen} onClose={() => setIsGenerateDialogOpen(false)} fullWidth maxWidth="sm">
        <GenerateTweetContinuationChat
          authId={auth.currentUser?.uid || ""}
          tempText={content} // 現在のテキストボックスの内容を temp_text として渡す
          onSelect={handleGenerateSelect} // 生成された内容をテキストボックスに反映
        />
      </Dialog>
    </>
  );
};

export default TweetModal;
