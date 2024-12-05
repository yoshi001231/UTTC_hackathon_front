import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import FindUsers from "../components/FindUsers";

const FindUsersPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [currentKeyword, setCurrentKeyword] = useState<string>("");

  const handleSearch = () => {
    setCurrentKeyword(searchKeyword.trim());
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 4, p: 2 }}>
      {/* 検索ボックス */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          label="ユーザーを検索"
          variant="outlined"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: "black",
            color: "white",
          }}
          onClick={handleSearch}
          disabled={!searchKeyword.trim()}
        >
          検索
        </Button>
      </Box>

      {/* 検索結果 */}
      {currentKeyword ? (
        <FindUsers keyword={currentKeyword} />
      ) : (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" color="textSecondary">
            検索キーワードを入力してください
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FindUsersPage;
