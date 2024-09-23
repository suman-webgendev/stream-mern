import Loading from "@/components/Loading";
import VideoTitle from "@/components/VideoTitle";
import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const VideoPage = () => {
  const location = useLocation();
  const { title, videoId, owner } = location.state || {};

  const VideoPlayer = lazy(() => import("@/components/VideoPlayer"));

  return (
    <>
      <div className="flex h-full flex-col items-center justify-center p-2">
        <Suspense fallback={<Loading />}>
          <VideoPlayer videoId={videoId} />
        </Suspense>
      </div>
      <VideoTitle title={title} owner={owner} />
    </>
  );
};

export default VideoPage;
