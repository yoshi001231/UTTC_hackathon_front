import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import UserCard from "./UserCard";

interface UserProfile {
  user_id: string;
  name: string;
  bio: string;
  profile_img_url: string;
  header_img_url: string;
}

interface LikeUsersDialogProps {
  open: boolean;
  onClose: () => void;
  likeUsers: UserProfile[] | null; // null も許容
}

const LikeUsersDialog: React.FC<LikeUsersDialogProps> = ({ open, onClose, likeUsers }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>いいねしたユーザー</DialogTitle>
      <DialogContent>
        {likeUsers && likeUsers.length > 0 ? (
          <>
            {likeUsers.map((likeUser) => (
              <UserCard
                key={likeUser.user_id}
                userId={likeUser.user_id}
                name={likeUser.name}
                bio={likeUser.bio}
                profileImgUrl={likeUser.profile_img_url}
                headerImgUrl={likeUser.header_img_url}
              />
            ))}
          </>
        ) : (
          <Typography variant="body1" color="textSecondary">
            いいねしたユーザーはいません
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LikeUsersDialog;
