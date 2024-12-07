import axios from "axios";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const BASE_URL = "https://uttc-hackathon-back-52633672360.us-central1.run.app";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});





//// ユーザー認証関連エンドポイント ////
// 新規ユーザー登録
export const registerUser = async (userData: object) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    console.error("Axios Error:", error.toJSON());
    throw error;
  }
};





//// ユーザー管理エンドポイント ////
//// (サブ)プロフィール画像をアップロード
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

//// (サブ)ヘッダー画像をアップロード
export const uploadHeaderImage = async (userId: string, file: File): Promise<string> => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `header_images/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef); // アップロード後のURL取得
    return downloadUrl;
  } catch (error: any) {
    console.error("ヘッダー画像アップロードエラー:", error);
    throw new Error("ヘッダー画像のアップロードに失敗しました");
  }
};

// ユーザーの詳細情報を取得
export const getUserProfile = async (
  userId: string
): Promise<{
  user_id: string;
  name: string;
  bio: string;
  profile_img_url: string;
  header_img_url: string;
  location: string;
  birthday: string | null; // フォーマット済みの誕生日（nullの場合あり）
}> => {
  const response = await apiClient.get(`/user/${userId}`);
  const data = response.data;
  // 誕生日をフォーマットする
  const formattedBirthday = data.birthday
    ? new Date(data.birthday).toISOString().split("T")[0] // "YYYY-MM-DD" の形式に変換
    : null;
  return {
    ...data,
    birthday: formattedBirthday, // フォーマット済みの誕生日を設定
  };
};

// プロフィール情報の更新
export const updateUserProfile = async (userData: {
  user_id: string;
  name: string | null;
  bio: string | null;
  profile_img_url: string | null;
  header_img_url: string | null;
  location: string | null;
  birthday: string | null; // ISO形式の日付文字列
}): Promise<void> => {
  try {
    // 誕生日をISO形式に変換（存在しない場合はそのままnull）
    const formattedData = {
      ...userData,
      birthday: userData.birthday ? new Date(userData.birthday).toISOString() : null,
    };

    // サーバーにPUTリクエストを送信
    await apiClient.put("/user/update-profile", formattedData);
  } catch (error: any) {
    console.error("プロフィール更新エラー:", error);
    throw new Error("プロフィールの更新に失敗しました");
  }
};

// ツイート数が多い順にユーザーを取得
export const getTopUsersByTweets = async (): Promise<any[]> => {
  const response = await apiClient.get("/users/top/tweets");
  return response.data;
};

// もらったいいね数が多い順にユーザーを取得
export const getTopUsersByLikes = async (): Promise<any[]> => {
  const response = await apiClient.get("/users/top/likes");
  return response.data;
};





//// ツイート関連エンドポイント ////
//// (サブ)Firebase Storage に画像をアップロードして URL を取得
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

// 新しい投稿を作成
export const createTweet = async (tweetData: { user_id: string; content: string; img_url?: string; parent_post_id?: string;}) => {
  try {
    const response = await apiClient.post("/post/create", tweetData);
    return response.data;
  } catch (error: any) {
    console.error("ツイート作成エラー:", error);
    throw error;
  }
};

// 投稿の詳細を取得
export const getPostById = async (postId: string) => {
  try {
    const response = await apiClient.get(`/post/${postId}`);
    return response.data;
  } catch (error: any) {
    console.error("ツイート取得エラー:", error);
    throw new Error("ツイートの取得に失敗しました");
  }
};

// 投稿の内容を更新
export const updateTweet = async (tweetData: { post_id: string; content: string; img_url?: string; parent_post_id?: string; }) => {
  try {
    const response = await apiClient.put(`/post/${tweetData.post_id}/update`, tweetData);
    return response.data;
  } catch (error: any) {
    console.error("ツイート更新エラー:", error);
    throw new Error(error.response?.data?.message || "ツイートの更新に失敗しました");
  }
};

// 投稿を削除
export const deleteTweet = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/post/${postId}/delete`);
  } catch (error: any) {
    console.error("ツイート削除エラー:", error);
    throw new Error("ツイートの削除に失敗しました");
  }
};

// 指定した投稿にリプライを追加
export const createReply = async (postId: string, replyData: { user_id: string; content: string; img_url?: string }) => {
  try {
    const response = await apiClient.post(`/post/${postId}/reply`, replyData);
    return response.data;
  } catch (error: any) {
    console.error("リプライ作成エラー:", error);
    throw new Error("リプライの作成に失敗しました");
  }
};

// 投稿への返信一覧を取得
export const getReplies = async (postId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/post/${postId}/children`);
    return response.data;
  } catch (error: any) {
    console.error("リプライ一覧取得エラー:", error);
    throw new Error("リプライ一覧の取得に失敗しました");
  }
};





//// いいね関連エンドポイント ////
// 投稿にいいねを追加
export const addLike = async (postId: string, userId: string): Promise<void> => {
  try {
    await apiClient.post(`/like/${postId}`, { user_id: userId });
  } catch (error: any) {
    console.error("いいね追加エラー:", error);
    throw new Error("いいねの追加に失敗しました");
  }
};

// 投稿のいいねを削除
export const removeLike = async (postId: string, userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/like/${postId}/remove`, { data: { user_id: userId } });
  } catch (error: any) {
    console.error("いいね削除エラー:", error);
    throw new Error("いいねの削除に失敗しました");
  }
};

// 指定投稿にいいねしたユーザー一覧を取得
export const getLikesForPost = async (postId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/like/${postId}/users`);
    return response.data; // APIから返されるユーザーデータの配列
  } catch (error: any) {
    console.error("いいねユーザー取得エラー:", error);
    throw new Error("いいねユーザーの取得に失敗しました");
  }
};





//// フォロー関連エンドポイント ////
// 指定ユーザーをフォロー
export const addFollow = async (currentUserId: string, targetUserId: string) => {
  const response = await apiClient.post(`/follow/${targetUserId}`, {
    user_id: currentUserId,
  });
  return response.data;
};

// 指定ユーザーのフォロー解除
export const removeFollow = async (currentUserId: string, targetUserId: string) => {
  const response = await apiClient.delete(`/follow/${targetUserId}/remove`, {
    data: { user_id: currentUserId },
  });
  return response.data;
};

// 指定ユーザーのフォロワー取得
export const getFollowers = async (userId: string) => {
  const response = await apiClient.get(`/follow/${userId}/followers`);
  return response.data;
};

// 指定ユーザーのフォロー中取得
export const getFollowing = async (userId: string) => {
  const response = await apiClient.get(`${BASE_URL}/follow/${userId}/following`);
  return response.data;
};

// フォローグラフを取得
export const getFollowGraph = async (): Promise<{ user_id: string; following_user_id: string }[]> => {
  try {
    const response = await apiClient.get("/follow/graph");
    return response.data; // APIから返されるフォローグラフデータ
  } catch (error: any) {
    console.error("フォローグラフ取得エラー:", error);
    throw new Error("フォローグラフの取得に失敗しました");
  }
};





//// タイムライン関連エンドポイント ////
// ログインユーザーのタイムライン取得
export const getTimeline = async (authId: string) => {
  try {
    const response = await apiClient.get(`/timeline/${authId}`);
    return response.data;
  } catch (error: any) {
    console.error("タイムライン取得失敗:", error);
    throw new Error(error.response?.data?.message || "タイムラインの取得に失敗しました");
  }
};

// 指定ユーザーの投稿一覧を取得
export const getUserTweets = async (userId: string) => {
  try {
    const response = await apiClient.get(`/timeline/posts_by/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("ユーザのツイート一覧取得失敗:", error);
    throw new Error(error.response?.data?.message || "ユーザのツイート一覧の取得に失敗しました");
  }
};

// 指定ユーザーがいいねした投稿一覧を取得
export const getUserLikedTweets = async (userId: string) => {
  try {
    const response = await apiClient.get(`/timeline/liked_by/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("ユーザがいいねしたツイート一覧取得失敗:", error);
    throw new Error(error.response?.data?.message || "ユーザがいいねしたツイート一覧の取得に失敗しました");
  }
};





//// 検索関連エンドポイント ////
// 指定したキーワードをnameまたはbioに含むユーザーを検索
export const findUsersByKey = async (key: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/find/user/${key}`);
    return response.data; // APIから返されるユーザーデータの配列
  } catch (error: any) {
    console.error("ユーザー検索エラー:", error);
    throw new Error("ユーザー検索に失敗しました");
  }
};

// 指定したキーワードをcontentに含む投稿を検索
export const findPostsByKey = async (key: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/find/post/${key}`);
    return response.data; // APIから返される投稿データの配列
  } catch (error: any) {
    console.error("投稿検索エラー:", error);
    throw new Error("投稿検索に失敗しました");
  }
};





//// Gemini関連エンドポイント ////
// 指定したユーザーの過去ツイートをもとに、instructionに従った自己紹介文を生成。instructionが""なら何も指示しない
export const generateName = async (authId: string, instruction: string | null): Promise<string> => {
  try {
    const requestBody = {
      instruction: instruction || "", // instruction が null の場合は空白文字列を設定
    };
    const response = await apiClient.post(`/gemini/generate_name/${authId}`, requestBody);
    const parts = response.data;
    return parts; // 最初の生成結果を返す
  } catch (error: any) {
    console.error("名前生成エラー:", error);
    throw new Error(error.response?.data?.message || "名前の生成に失敗しました");
  }
};

// 指定したユーザーの過去ツイートをもとに、instructionに従った自己紹介文を生成。instructionが""なら何も指示しない
export const generateBio = async (authId: string, instruction: string | null): Promise<string> => {
  try {
    const requestBody = {
      instruction: instruction || "", // instruction が null の場合は空白文字列を設定
    };
    const response = await apiClient.post(`/gemini/generate_bio/${authId}`, requestBody);
    const parts = response.data;
    return parts; // 最初の生成結果を返す
  } catch (error: any) {
    console.error("自己紹介生成エラー:", error);
    throw new Error(error.response?.data?.message || "自己紹介の生成に失敗しました");
  }
};

// 指定したユーザーの過去ツイートをもとに、instructionとtemp_textに従ってツイートの続きを生成
export const generateTweetContinuation = async (
  authId: string,
  instruction: string | null,
  tempText: string | null
): Promise<string> => {
  try {
    const requestBody = {
      instruction: instruction || "", // instruction が null の場合は空白文字列を設定
      temp_text: tempText || "",     // temp_text が null の場合は空白文字列を設定
    };
    const response = await apiClient.post(`/gemini/generate_tweet_continuation/${authId}`, requestBody);
    const parts = response.data;
    return parts; // 最初の生成結果を返す
  } catch (error: any) {
    console.error("ツイート生成エラー:", error);
    throw new Error(error.response?.data?.message || "ツイートの生成に失敗しました");
  }
};

// 指定したツイートが良識に反するかを判定
export const checkIsBad = async (postId: string): Promise<string> => {
  try {
    const response = await apiClient.get(`/gemini/check_isbad/${postId}`);
    const result = response.data; // 判定結果 ("YES\n" または "NO\n")
    return result;
  } catch (error: any) {
    console.error("is_bad 判定エラー:", error);
    throw new Error(error.response?.data?.message || "is_bad 判定に失敗しました");
  }
};

// 指定したツイートの is_bad カラムを更新
export const updateIsBad = async (postId: string, isBad: boolean): Promise<void> => {
  try {
    const boolValue = isBad ? 1 : 0; // boolean を 1 または 0 に変換
    console.log("isBad", isBad, "boolValue", boolValue);
    await apiClient.put(`/gemini/update_isbad/${postId}/${boolValue}`);
  } catch (error: any) {
    console.error("is_bad 更新エラー:", error);
    throw new Error(error.response?.data?.message || "is_bad 更新に失敗しました");
  }
};
