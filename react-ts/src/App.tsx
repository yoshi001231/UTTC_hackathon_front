// App.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";

// タイムラインの投稿データの型
interface Post {
  post_id: string;
  user_id: string;
  content: string;
  img_url: string;
  created_at: string;
  parent_post_id?: string;
}

const App: React.FC = () => {
  const [timeline, setTimeline] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // タイムラインを取得するAPIコール
    const fetchTimeline = async () => {
      try {
        const response = await axios.get(
          "https://uttc-hackathon-back-52633672360.us-central1.run.app/timeline/user1"
        );
        setTimeline(response.data); // データをステートに保存
        setLoading(false); // ローディング終了
      } catch (err) {
        setError("タイムラインの取得に失敗しました");
        setLoading(false); // ローディング終了
      }
    };

    fetchTimeline();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // ローディング中の表示
  }

  if (error) {
    return <div>{error}</div>; // エラーメッセージの表示
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>user1's Timeline</h1>
      {timeline.length === 0 ? (
        <p>タイムラインには投稿がありません。</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {timeline.map((post) => (
            <li
              key={post.post_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "10px",
                padding: "10px",
              }}
            >
              <p><strong>ユーザーID:</strong> {post.user_id}</p>
              <p><strong>内容:</strong> {post.content}</p>
              {post.img_url && (
                <img
                  src={post.img_url}
                  alt="投稿画像"
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              )}
              <p style={{ fontSize: "12px", color: "#666" }}>
                投稿日時: {new Date(post.created_at).toLocaleString()}
              </p>
              {post.parent_post_id && (
                <p style={{ fontSize: "12px", color: "#999" }}>
                  リプライ元: {post.parent_post_id}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
