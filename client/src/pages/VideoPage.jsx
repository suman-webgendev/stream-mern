import Loading from "@/components/Loading";
import VideoPlayer from "@/components/VideoPlayer";
import VideoTitle from "@/components/VideoTitle";
import { Suspense } from "react";
import { useLocation } from "react-router-dom";

const VideoPage = () => {
  const location = useLocation();
  const { title, videoId, owner } = location.state || {};

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
