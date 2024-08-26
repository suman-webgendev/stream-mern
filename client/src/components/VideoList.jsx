import VideoCard from "@/components/VideoCard";

const VideoList = (props) => {
  return (
    <div className="grid grid-cols-1 gap-3 p-3 max-xl:grid-cols-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {props.videos.map((video) => (
        <VideoCard
          key={video.id}
          videoId={video.id}
          imageUrl={video.imageUrl}
          videoTitle={video.title}
          uploadedAt={video.createdAt}
        />
      ))}
    </div>
  );
};

export default VideoList;
