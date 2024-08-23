import VideoCard from "@/components/VideoCard";

const VideoList = (props) => {
  console.log(props.videos[0]);
  return (
    <>
      {props.videos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {props.videos.map((video, index) => (
            <VideoCard
              key={`${video.id}-${index}`}
              videoId={video._id}
              videoTitle={video.title}
              uploadedAt={video.createdAt}
            />
          ))}
        </div>
      ) : (
        <p>No video found!</p>
      )}
    </>
  );
};

export default VideoList;
