import { Card, CardContent } from "@/components/ui/card";
import { useCallback } from "react";
import { Link } from "react-router-dom";

const VideoCard = (props) => {
  const formatDate = useCallback((uploadDate) => {
    const dateFormat = new Date(uploadDate);
    const now = new Date();
    const years = now.getFullYear() - dateFormat.getFullYear();
    const months = now.getMonth() - dateFormat.getMonth() + years * 12;
    const days = Math.floor(
      (now.getTime() - dateFormat.getTime()) / (1000 * 60 * 60 * 24),
    );
    const hours =
      Math.floor((now.getTime() - dateFormat.getTime()) / (1000 * 60 * 60)) %
      24;
    const minutes =
      Math.floor((now.getTime() - dateFormat.getTime()) / (1000 * 60)) % 60;
    const seconds =
      Math.floor((now.getTime() - dateFormat.getTime()) / 1000) % 60;

    if (years > 1) {
      return `${years} years ago`;
    } else if (months > 1) {
      return `${months} months ago`;
    } else if (days > 1) {
      return `${days} days ago`;
    } else if (hours > 1) {
      return `${hours} hours ago`;
    } else if (minutes > 1) {
      return `${minutes} minutes ago`;
    } else {
      return `${seconds} seconds ago`;
    }
  }, []);

  return (
    <Link to={`/${props.videoId}`}>
      <Card>
        <CardContent className="grid-cols-video grid content-center gap-1 self-center border-none p-1">
          <div className="my-auto h-48 w-64">
            <img
              src={`/thumbnails/${props.videoTitle}_thumbnail.jpg`}
              alt="video thumbnail"
              width={256}
              height={128}
              loading="lazy"
              className="aspect-video size-full rounded-md object-cover object-center"
            />
          </div>
          <div className="overflow-x grid h-32 w-full max-w-screen-md grid-rows-3 space-y-1">
            <p className="row-span-2 text-pretty break-all text-lg">
              {props.videoTitle}
            </p>
            <p className="row-span-1 text-muted-foreground">
              {formatDate(props.uploadedAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default VideoCard;
