import axios from "axios";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const BASE_URL = "https://uttc-hackathon-back-52633672360.us-central1.run.app";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (userData: object) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    console.error("Axios Error:", error.toJSON());
    throw error;
  }
};

// タイムライン取得
export const getTimeline = async (authId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/timeline/${authId}`);
    return response.data;
  } catch (error: any) {
    console.error("タイムライン取得失敗:", error);
    throw new Error(error.response?.data?.message || "タイムラインの取得に失敗しました");
  }
};

// ユーザープロフィール取得
export const getUserProfile = async (userId: string): Promise<{ 
  user_id: string; 
  name: string; 
  bio: string; 
  profile_img_url: string; 
}> => {
  const response = await apiClient.get(`/user/${userId}`);
  return response.data;
};

// フォロー追加
export const addFollow = async (currentUserId: string, targetUserId: string) => {
  const response = await axios.post(`${BASE_URL}/follow/${targetUserId}`, {
    user_id: currentUserId,
  });
  return response.data;
};

// フォロー解除
export const removeFollow = async (currentUserId: string, targetUserId: string) => {
  const response = await axios.delete(`${BASE_URL}/follow/${targetUserId}/remove`, {
    data: { user_id: currentUserId },
  });
  return response.data;
};

// フォロワー取得
export const getFollowers = async (userId: string) => {
  const response = await axios.get(`${BASE_URL}/follow/${userId}/followers`);
  return response.data;
};

// フォロー中取得
export const getFollowing = async (userId: string) => {
  const response = await axios.get(`${BASE_URL}/follow/${userId}/following`);
  return response.data;
};

// ツイート数順ユーザ取得
export const getTopUsersByTweets = async (): Promise<any[]> => {
  const response = await apiClient.get("/users/top/tweets");
  return response.data;
};

// いいね数順ユーザ取得
export const getTopUsersByLikes = async (): Promise<any[]> => {
  const response = await apiClient.get("/users/top/likes");
  return response.data;
};

// ユーザー情報を更新
export const updateUserProfile = async (userData: {
  user_id: string;
  name: string;
  bio: string;
  profile_img_url: string;
}): Promise<void> => {
  try {
    await apiClient.put("/user/update-profile", userData);
  } catch (error: any) {
    console.error("プロフィール更新エラー:", error);
    throw new Error("プロフィールの更新に失敗しました");
  }
};


// プロフィール画像をアップロード
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `profile_images/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef); // アップロード後のURL取得
    return downloadUrl;
  } catch (error: any) {
    console.error("プロフィール画像アップロードエラー:", error);
    throw new Error("プロフィール画像のアップロードに失敗しました");
  }
};

// Firebase Storage に画像をアップロードして URL を取得
export const uploadImageToFirebase = async (file: File, path: string): Promise<string> => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef); // アップロード後の画像URLを取得
  } catch (error: any) {
    console.error("画像アップロードエラー:", error);
    throw new Error("画像のアップロードに失敗しました");
  }
};

// バックエンドにツイートを作成
export const createTweet = async (tweetData: { user_id: string; content: string; img_url: string }) => {
  try {
    const response = await apiClient.post("/post/create", tweetData);
    return response.data;
  } catch (error: any) {
    console.error("ツイート作成エラー:", error);
    throw error;
  }
};

// ツイートを更新
export const updateTweet = async (tweetData: { post_id: string; content: string; img_url: string }) => {
  try {
    const response = await apiClient.put(`/post/${tweetData.post_id}/update`, tweetData);
    return response.data;
  } catch (error: any) {
    console.error("ツイート更新エラー:", error);
    throw new Error(error.response?.data?.message || "ツイートの更新に失敗しました");
  }
};

// ツイートを削除
export const deleteTweet = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/post/${postId}/delete`);
  } catch (error: any) {
    console.error("ツイート削除エラー:", error);
    throw new Error("ツイートの削除に失敗しました");
  }
};
