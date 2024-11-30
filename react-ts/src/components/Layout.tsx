import React from "react";
import { Box } from "@mui/material";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box>
      <Header />
      <Box sx={{ padding: 3 }}>{children}</Box>
    </Box>
  );
};

export default Layout;
