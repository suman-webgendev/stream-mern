import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

const VideoCard = (props) => {
  return (
    <Link to={`/${props.videoId}`}>
      <Card>
        <CardContent className="grid grid-cols-video content-center gap-1 self-center border-none p-1">
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
