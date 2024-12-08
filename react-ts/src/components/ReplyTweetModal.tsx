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
import { uploadImageToFirebase, createReply, checkIsBad, updateIsBad } from "../services/api";
import { auth } from "../services/firebase";

interface ReplyTweetModalProps {
  open: boolean;
  onClose: () => void;
  parentPostId: string; // リプライ先の投稿ID
  onReplyCreated: () => void;
}

const ReplyTweetModal: React.FC<ReplyTweetModalProps> = ({
  open,
  onClose,
  parentPostId,
  onReplyCreated,
}) => {
  const [content, setContent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleReplySubmit = async () => {
    if (!auth.currentUser) {
      console.error("ユーザーが認証されていません");
      return;
    }
  
    setLoading(true);
    try {
      let imgUrl = "";
      if (imageFile) {
        imgUrl = await uploadImageToFirebase(imageFile, `replies/${auth.currentUser.uid}/${Date.now()}`);
      }
  
      // リプライを作成し、レスポンスから post_id を取得
      const newReply = await createReply(parentPostId, {
        user_id: auth.currentUser.uid,
        content,
        img_url: imgUrl,
      });
  
      // ダイアログを閉じて、リプライが作成されたことを通知
      setContent("");
      setImageFile(null);
      onClose();
      onReplyCreated();
  
      // 非同期で `is_bad` 処理を進める
      const processIsBadCheck = async () => {
        try {
          const isBadResult = await checkIsBad(newReply.post_id);
          if (isBadResult.includes("YES")) {
            // 警告を表示し、is_bad を 1 に更新
            alert(`良識に反している可能性があります。タイムラインでは表示制限がかかります。\n内容:\n ${content}\n`);
            await updateIsBad(newReply.post_id, true);
          }
        } catch (error) {
          console.error("checkIsBad または updateIsBad に失敗しました:", error);
        }
      };
  
      // バックグラウンドで処理を進める
      processIsBadCheck();
    } catch (error) {
      console.error("リプライの作成に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>リプライを作成</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="内容"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <IconButton component="label">
            <PhotoCamera />
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button onClick={handleReplySubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "送信中..." : "リプライ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReplyTweetModal;
