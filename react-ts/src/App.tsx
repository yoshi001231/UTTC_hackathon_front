import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import RegisterUser from "./pages/RegisterUser";
import Login from "./pages/Login";
import Timeline from "./pages/Timeline";
import Layout from "./components/Layout";
import UserProfile from "./pages/UserProfile";
import UserProfileEdit from "./pages/UserProfileEdit";
import FollowLists from "./pages/FollowLists";
import UserRanking from "./pages/UserRanking";
import Tweet from "./pages/Tweet";
import FindUsersPage from "./pages/FindUsersPage";
import FindTweetsPage from "./pages/FindTweetsPage";
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
        <Route path="/user/edit/:userId" element={<UserProfileEdit />} />
        <Route path="/user/:userId/followers" element={<FollowLists />} />
        <Route path="/user/:userId/following" element={<FollowLists />} />
        <Route path="/users" element={<UserRanking />} />
        <Route path="/tweet/:postId" element={<Tweet />} />
        <Route path="/find/users" element={<FindUsersPage />} />
        <Route path="/find/tweets" element={<FindTweetsPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
