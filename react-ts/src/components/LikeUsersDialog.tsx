import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  user_id: string;
  name: string;
  profile_img_url: string;
}

interface LikeUsersDialogProps {
  open: boolean;
  onClose: () => void;
  likeUsers: UserProfile[] | null; // null も許容
}

const LikeUsersDialog: React.FC<LikeUsersDialogProps> = ({ open, onClose, likeUsers }) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>いいねしたユーザー</DialogTitle>
      <DialogContent>
        {likeUsers && likeUsers.length > 0 ? (
          <List>
            {likeUsers.map((likeUser) => (
              <ListItem key={likeUser.user_id}>
                <Avatar
                  src={likeUser.profile_img_url}
                  alt={likeUser.name}
                  sx={{ marginRight: 2, cursor: "pointer" }}
                  onClick={() => navigate(`/user/${likeUser.user_id}`)}
                />
                <Typography variant="body1">{likeUser.name}</Typography>
              </ListItem>
            ))}
          </List>
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
