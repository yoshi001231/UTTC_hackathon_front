import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, IconButton, Box } from "@mui/material";
import { getFollowGraph, getUserProfile } from "../services/api";
import { Network, Options } from "vis-network/standalone";
import RefreshIcon from "@mui/icons-material/Refresh";

// デフォルトプロファイル画像のパス
const DEFAULT_PROFILE_IMAGE = "/images/unknown_icon.jpeg";

// Propsに3つのuser_idを追加
interface StarWebProps {
  userId1: string;
  userId2: string;
  userId3: string;
}

const StarWeb: React.FC<StarWebProps> = ({ userId1, userId2, userId3 }) => {
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const StarWeb = await getFollowGraph();

        const nodes = new Map<string, any>();
        const edges: { from: string; to: string; arrows: string }[] = [];

        StarWeb.forEach((follow) => {
          edges.push({ from: follow.user_id, to: follow.following_user_id, arrows: "to" });
        });

        const userIds = Array.from(
          new Set(StarWeb.flatMap((follow) => [follow.user_id, follow.following_user_id]))
        );

        await Promise.all(
          userIds.map(async (userId) => {
            const profile = await getUserProfile(userId);

            // ノードのデフォルト設定
            let node = {
              id: profile.user_id,
              image: profile.profile_img_url || DEFAULT_PROFILE_IMAGE, // デフォルト画像を利用
              shape: "circularImage", // 円形画像
              color: {
                background: "#FFFFFF", // ノードの背景色を白に設定
                border: "#C0C0C0", // 枠線の色
              },
              size: 20, // ノードのサイズ
            };

            // 引数に一致するuser_idがあれば、ノードのサイズを拡大
            if ([userId1, userId2, userId3].includes(userId)) {
              node.size = 50;
            }

            nodes.set(userId, node);
          })
        );

        const data = {
          nodes: Array.from(nodes.values()),
          edges,
        };

        const options: Options = {
          nodes: {
            font: {
              size: 14,
            },
          },
          edges: {
            color: "#FFFFFF", // 白色のエッジ
            width: 1,
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 1,
              },
            },
            smooth: {
              enabled: true,
              type: "dynamic",
              roundness: 0.5,
            },
          },
          physics: {
            enabled: true,
          },
        };

        if (graphContainerRef.current) {
          const network = new Network(graphContainerRef.current, data, options);
          networkRef.current = network;

          network.on("click", (event) => {
            if (event.nodes.length > 0) {
              const clickedNodeId = event.nodes[0];
              navigate(`/user/${clickedNodeId}`);
            }
          });
        }
      } catch (error) {
        console.error("フォローグラフ取得エラー:", error);
      }
    };

    fetchGraphData();
  }, [navigate, userId1, userId2, userId3]);

  const resetZoom = () => {
    if (networkRef.current) {
      networkRef.current.fit();
    }
  };

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <Box
        ref={graphContainerRef}
        sx={{
          width: "100%",
          height: "600px",
        }}
      ></Box>

      <Tooltip title="ズームをリセット" placement="top">
        <IconButton
          onClick={resetZoom}
          color="primary"
          sx={{
            position: "absolute",
            top: "16px",
            left: "16px",
            zIndex: 1,
            backgroundColor: "white", // ボタン背景を白に設定
            "&:hover": {
              backgroundColor: "#f0f0f0", // ホバー時の背景色
            },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default StarWeb;
