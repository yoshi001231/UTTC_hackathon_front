import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const DebugComponent: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    console.log("userId from useParams:", userId);
  }, [userId]);

  return <div>Debugging userId: {userId}</div>;
};

export default DebugComponent;