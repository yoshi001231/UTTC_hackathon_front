import React, { useState } from "react";
import { generateTweetContinuation } from "../services/api";
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";

interface GenerateTweetContinuationChatProps {
  authId: string; // 外部から渡される authId
  tempText: string; // 外部コンポーネントから渡される現在入力中のテキスト
  onSelect: (selectedTweet: string) => void; // 選択されたツイートを渡すコールバック
  onClose: () => void; // ダイアログを閉じるための関数
}

const GenerateTweetContinuationChat: React.FC<GenerateTweetContinuationChatProps> = ({
  authId,
  tempText,
  onSelect,
  onClose,
}) => {
  const [instruction, setInstruction] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "system"; message: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!instruction.trim()) return;

    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: instruction },
    ]);
    setIsLoading(true);
    setError(null);

    try {
      const tweetContinuation = await generateTweetContinuation(authId, instruction.trim(), tempText.trim());
      setChatHistory((prev) => [...prev, { role: "system", message: tweetContinuation }]);
    } catch (err: any) {
      setError(err.message || "ツイートの生成に失敗しました");
    } finally {
      setIsLoading(false);
      setInstruction("");
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 600, textAlign: "center" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button
          onClick={onClose}
        >
          戻る
        </Button>
      </Box>

      {/* 現在の入力を表示 */}
      <Box
        sx={{
          padding: 2,
          marginBottom: 2,
          border: "1px solid #ccc",
          borderRadius: 4,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          現在の入力:
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {tempText.trim() ? tempText : "なし"}
        </Typography>
      </Box>

      <Box
        sx={{
          minHeight: 400,
          maxHeight: 400,
          overflowY: "auto",
          marginBottom: 2,
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: 2,
        }}
      >
        {chatHistory.length === 0 ? (
          <Typography color="textSecondary" variant="body2">
            チャットがここに表示されます
          </Typography>
        ) : (
          chatHistory.map((entry, index) => (
            <Box
              key={index}
              sx={{
                textAlign: entry.role === "user" ? "right" : "left",
                marginBottom: 1,
              }}
            >
              <Typography
                sx={{
                  display: "inline-block",
                  backgroundColor: entry.role === "user" ? "#e3f2fd" : "#f3e5f5",
                  padding: 1,
                  borderRadius: 1,
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                {entry.message}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {isLoading && <CircularProgress size={24} sx={{ marginBottom: 2 }} />}
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="指示 (例: ポジティブなトーンで)"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={isLoading}
          sx={{
            color: "#444", backgroundColor: "gold", borderColor: "gold", overflow: "hidden", "&:hover": { backgroundColor: "rgba(255, 215, 0, 0.8)", borderColor: "gold" }, "&::before": { content: '""', position: "absolute", top: 0, left: "-100%", width: "200%", height: "100%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)", transform: "translateX(-100%)", animation: "shine 1.2s infinite" }, "@keyframes shine": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } }
          }}
        >
          生成
        </Button>
      </Box>

      {!isLoading && chatHistory.length > 0 && (
        <Button
          variant="contained"
          color="secondary"
          sx={{ marginTop: 2 }}
          onClick={() => {
            const latestSystemMessage = chatHistory
              .filter((entry) => entry.role === "system")
              .slice(-1)[0]?.message;
            if (latestSystemMessage) onSelect(latestSystemMessage);
          }}
        >
          これを使う
        </Button>
      )}
    </Box>
  );
};

export default GenerateTweetContinuationChat;
