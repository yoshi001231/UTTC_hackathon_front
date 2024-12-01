import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import RegisterUser from "./pages/RegisterUser";
import Login from "./pages/Login";
import Timeline from "./pages/Timeline";
import Layout from "./components/Layout";
import UserProfile from "./pages/UserProfile";
import FollowersList from "./pages/FollowersList";
import FollowingList from "./pages/FollowingList";
import UserRanking from "./pages/UserRanking";
import Tweet from "./pages/Tweet";
import { auth } from "./services/firebase";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 現在のパスを取得

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && location.pathname !== "/register") {
        navigate("/login"); // ログインしていない場合、登録ページ以外はログイン画面へリダイレクト
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/user/:userId/followers" element={<FollowersList />} />
        <Route path="/user/:userId/following" element={<FollowingList />} />
        <Route path="/users" element={<UserRanking />} />
        <Route path="/tweet/:postId" element={<Tweet />} />
      </Routes>
    </Layout>
  );
};

export default App;
